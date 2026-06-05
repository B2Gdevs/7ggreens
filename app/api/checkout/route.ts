/**
 * POST /api/checkout — Square Payments API, one-time purchase.
 *
 * Body (JSON):
 *   { sourceId: string, itemId: string, itemName: string, amountCents: number,
 *     note?: string, customerEmail?: string }
 *
 *   itemId may be either:
 *   - A catalog slug (e.g. "starter-box") — resolved to Square variation ID via
 *     lib/catalog.ts getSquareVariationId(). Falls back gracefully to slug when
 *     variation ID not yet synced.
 *   - A Square variation ID (direct from BoxCard "Buy now" for live catalog items)
 *   - A fallback display id (e.g. "fallback-starter") — display-only, no variation lookup.
 *
 * Returns:
 *   { ok: true, paymentId: string, receiptUrl?: string }
 *   { ok: false, error: string, configured: boolean }
 *
 * Graceful degradation:
 *   - Square keys absent → 200 ok:false configured:false (no crash)
 *   - Supabase keys absent or insert fails → payment still succeeds, warns
 *   - Resend key absent or send fails → payment still succeeds, warns
 *
 * Env vars consumed (server-only):
 *   SQUARE_ACCESS_TOKEN         — required for live payments
 *   SQUARE_ENVIRONMENT          — "sandbox" | "production" (default: sandbox)
 *   SQUARE_LOCATION_ID          — required for payment; falls back to first
 *                                  location if unset
 *   NEXT_PUBLIC_SUPABASE_URL    — required for order persistence
 *   SUPABASE_SERVICE_ROLE_KEY   — required for order persistence
 *   RESEND_API_KEY              — required for confirmation email
 *   RESEND_FROM                 — from address (default: orders@upaec.com)
 *
 * Tasks: UPAEC-T-272-04 (Square), UPAEC-T-272-07 (Supabase), UPAEC-T-272-09 (Resend)
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SquareClient, SquareEnvironment, SquareError } from "square";
import { randomUUID } from "crypto";
import { insertOrder } from "@/lib/supabase/orders";
import { sendOrderConfirmation } from "@/lib/email/order-confirmation";
import { getCatalogItem, getSquareVariationId } from "@/lib/catalog";

// ── Slug → Square ID resolution ───────────────────────────────────────────────
//
// Cart sends { slug, quantity }[] where slug is the catalog slug (e.g. "starter-box").
// CheckoutForm sends itemId which may be:
//   1. A catalog slug → resolved to squareVariationId if synced
//   2. Already a Square variation ID (live catalog path)
//   3. A fallback id (display-only, no resolution needed)
//
// Resolution order:
//   1. Try getCatalogItem(itemId) — if found and has squareVariationId, use it
//   2. Otherwise, use itemId as-is (may be a real Square ID already)
//
function resolveSquareItemId(itemId: string): string {
  // Check if it's a known catalog slug with a synced variation ID
  const variationId = getSquareVariationId(itemId);
  if (variationId) return variationId;

  // Not a slug or not yet synced — use as-is
  // (Square IDs start with real prefixes like "XXXXXXXXXXX" — safe to pass through)
  return itemId;
}

// ── Validate that amountCents matches the catalog price when slug is known ────
//
// Prevents price-tampering: if the slug maps to a catalog product, the amount
// must match priceCents. Mismatch returns 400.
// When itemId is not a known slug, we trust the client amount (existing behavior).
//
function validateAmount(itemId: string, amountCents: number): string | null {
  const product = getCatalogItem(itemId);
  if (!product) return null; // Unknown slug — no validation possible
  if (product.priceCents !== amountCents) {
    return `Price mismatch for "${itemId}": expected ${product.priceCents} cents, got ${amountCents}`;
  }
  return null;
}

// ── Clerk auth (optional) ─────────────────────────────────────────────────────
// Gracefully skipped when CLERK_SECRET_KEY is absent.
async function getClerkUserId(req: NextRequest): Promise<string | null> {
  if (!process.env.CLERK_SECRET_KEY) return null;
  try {
    const { getAuth } = await import("@clerk/nextjs/server");
    const { userId } = getAuth(req);
    return userId ?? null;
  } catch {
    return null;
  }
}

// ── helpers ──────────────────────────────────────────────────────────────────

function buildSquareClient(): SquareClient | null {
  const token = process.env.SQUARE_ACCESS_TOKEN;
  if (!token) return null;
  const envStr = process.env.SQUARE_ENVIRONMENT ?? "sandbox";
  return new SquareClient({
    token,
    environment:
      envStr === "production"
        ? SquareEnvironment.Production
        : SquareEnvironment.Sandbox,
  });
}

async function resolveLocationId(client: SquareClient): Promise<string | null> {
  const fromEnv = process.env.SQUARE_LOCATION_ID;
  if (fromEnv) return fromEnv;
  try {
    const res = await client.locations.list();
    return res.locations?.[0]?.id ?? null;
  } catch {
    return null;
  }
}

// ── request body shape ───────────────────────────────────────────────────────

interface CheckoutBody {
  /** Nonce / token from the Square Web Payments SDK */
  sourceId: string;
  /** Square catalog item / variation ID (or fallback id for display only) */
  itemId: string;
  itemName: string;
  /** Amount in cents, must be positive integer */
  amountCents: number;
  /** Optional buyer note */
  note?: string;
  /** Optional buyer email — enables order confirmation email */
  customerEmail?: string;
}

function isValidBody(body: unknown): body is CheckoutBody {
  if (!body || typeof body !== "object") return false;
  const b = body as Record<string, unknown>;
  return (
    typeof b.sourceId === "string" &&
    b.sourceId.length > 0 &&
    typeof b.itemId === "string" &&
    typeof b.itemName === "string" &&
    typeof b.amountCents === "number" &&
    Number.isInteger(b.amountCents) &&
    b.amountCents > 0
  );
}

// ── handler ──────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  // ── 1. Parse body ───────────────────────────────────────────────────────────
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body" }, { status: 400 });
  }

  if (!isValidBody(body)) {
    return NextResponse.json(
      { ok: false, error: "Missing or invalid fields: sourceId, itemId, itemName, amountCents required." },
      { status: 400 }
    );
  }

  // ── 1b. Validate catalog price (tamper-proofing) ────────────────────────────
  const priceError = validateAmount(body.itemId, body.amountCents);
  if (priceError) {
    return NextResponse.json(
      { ok: false, error: priceError },
      { status: 400 }
    );
  }

  // ── 1c. Resolve slug → Square variation ID ──────────────────────────────────
  // When itemId is a catalog slug, this returns the synced squareVariationId.
  // When not synced, returns the slug as-is (Square will accept it as referenceId).
  const resolvedItemId = resolveSquareItemId(body.itemId);

  // ── 2. Graceful degradation when Square is not configured ──────────────────
  const client = buildSquareClient();
  if (!client) {
    if (process.env.NODE_ENV !== "production") {
      console.info("[upaec] Square not configured — checkout returning unconfigured state.");
    }
    return NextResponse.json({
      ok: false,
      configured: false,
      error: "Payments not configured. Set SQUARE_ACCESS_TOKEN, SQUARE_ENVIRONMENT, and SQUARE_LOCATION_ID to enable checkout.",
    });
  }

  // ── 3. Resolve location ────────────────────────────────────────────────────
  const locationId = await resolveLocationId(client);
  if (!locationId) {
    return NextResponse.json(
      { ok: false, configured: true, error: "Could not resolve Square location ID. Set SQUARE_LOCATION_ID." },
      { status: 500 }
    );
  }

  // ── 4. Create payment ──────────────────────────────────────────────────────
  try {
    const result = await client.payments.create({
      sourceId: body.sourceId,
      idempotencyKey: randomUUID(),
      amountMoney: {
        amount: BigInt(body.amountCents),
        currency: "USD",
      },
      locationId,
      note: body.note ?? `7G Greens — ${body.itemName}`,
      // Use resolvedItemId (squareVariationId when synced, slug otherwise).
      // referenceId is informational — not used for payment processing.
      referenceId: `7greens-${body.itemId}-${Date.now()}`,
    });

    const payment = result.payment;

    if (!payment || payment.status === "FAILED") {
      const detail =
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (payment as any)?.failureCode ?? "Payment failed";
      return NextResponse.json({ ok: false, configured: true, error: detail }, { status: 402 });
    }

    // ── 5. Persist order (272-07) ────────────────────────────────────────────
    // Fire-and-forget pattern: persistence failure MUST NOT fail the payment.
    // Attach Clerk user ID when auth is configured (272-06).
    const clerkUserId = await getClerkUserId(req);
    const orderResult = await insertOrder({
      payment_id: payment.id ?? `unknown-${Date.now()}`,
      item_id: body.itemId,
      item_name: body.itemName,
      amount_cents: body.amountCents,
      customer_email: body.customerEmail ?? null,
      receipt_url: payment.receiptUrl ?? null,
      status: payment.status ?? "COMPLETED",
      clerk_user_id: clerkUserId ?? undefined,
    });

    if (!orderResult.ok) {
      // Already warned inside insertOrder — don't surface to client.
      console.warn("[upaec] Order persistence skipped/failed for payment:", payment.id, orderResult.error);
    }

    // ── 6. Send confirmation email (272-09) ──────────────────────────────────
    // Only send when a customer email was provided. Failure does NOT fail the payment.
    if (body.customerEmail) {
      const emailResult = await sendOrderConfirmation({
        to: body.customerEmail,
        itemName: body.itemName,
        amountCents: body.amountCents,
        paymentId: payment.id ?? "",
        receiptUrl: payment.receiptUrl ?? null,
      });

      if (!emailResult.ok && !emailResult.skipped) {
        console.warn("[upaec] Confirmation email failed for payment:", payment.id, emailResult.error);
      }
    }

    return NextResponse.json({
      ok: true,
      paymentId: payment.id,
      receiptUrl: payment.receiptUrl ?? null,
      status: payment.status,
    });
  } catch (err) {
    const label =
      err instanceof SquareError
        ? `SquareError ${err.statusCode}: ${JSON.stringify(err.errors ?? []).slice(0, 300)}`
        : String(err);

    if (process.env.NODE_ENV !== "production") {
      console.error("[upaec] checkout payment failed:", label);
    }

    // Surface Square error codes to client without leaking internals
    const publicMessage =
      err instanceof SquareError && err.errors?.[0]?.detail
        ? err.errors[0].detail
        : "Payment could not be completed. Please try again.";

    return NextResponse.json(
      { ok: false, configured: true, error: publicMessage },
      { status: 402 }
    );
  }
}
