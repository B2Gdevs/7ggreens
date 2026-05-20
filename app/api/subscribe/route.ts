/**
 * POST /api/subscribe — Square Subscriptions API, recurring box delivery.
 *
 * Subscribe flow:
 *   1. Validate request body
 *   2. Graceful degradation when Square is not configured (200 ok:false configured:false)
 *   3. Create or retrieve Square Customer by email
 *   4. Store card-on-file (converts Web Payments nonce to a reusable card)
 *   5. Create Square Subscription (customer + card + plan variation + location)
 *   6. Persist subscription to Supabase (fire-and-forget — failure does NOT fail the op)
 *   7. Send Resend confirmation email (fire-and-forget — failure does NOT fail the op)
 *
 * Body (JSON):
 *   {
 *     sourceId: string,            // Web Payments nonce from tokenize()
 *     planVariationId: string,     // Square plan variation ID
 *     planName: string,            // Human-readable plan name (for email/DB)
 *     cadence: string,             // "WEEKLY" | "MONTHLY" etc.
 *     amountCents: number,         // Plan price in cents
 *     customerEmail: string,       // Required — used for customer creation + email
 *     customerName?: string,       // Optional — used for greeting in email
 *     customerPhone?: string,      // Optional — stored on Square customer
 *   }
 *
 * Returns:
 *   { ok: true, subscriptionId: string, status: string, source: string }
 *   { ok: false, error: string, configured: boolean }
 *
 * Graceful degradation:
 *   - Square keys absent → 200 ok:false configured:false (no crash)
 *   - Supabase keys absent or insert fails → subscription still succeeds, warns
 *   - Resend key absent or send fails → subscription still succeeds, warns
 *
 * Env vars consumed (server-only):
 *   SQUARE_ACCESS_TOKEN         — required for live subscriptions
 *   SQUARE_ENVIRONMENT          — "sandbox" | "production" (default: sandbox)
 *   SQUARE_LOCATION_ID          — required for subscription; falls back to first location
 *   NEXT_PUBLIC_SUPABASE_URL    — required for subscription persistence
 *   SUPABASE_SERVICE_ROLE_KEY   — required for subscription persistence
 *   RESEND_API_KEY              — required for confirmation email
 *   RESEND_FROM                 — from address (default: orders@upaec.com)
 *
 * Task: UPAEC-T-272-05
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  squareSubscriptionsConfigured,
  createOrGetCustomer,
  storeCardOnFile,
  createSubscription,
} from "@/lib/square/subscriptions";
import { insertSubscription } from "@/lib/supabase/subscriptions";
import { sendSubscriptionConfirmation } from "@/lib/email/subscription-confirmation";

// ── Request body ──────────────────────────────────────────────────────────────

interface SubscribeBody {
  /** Nonce / token from the Square Web Payments SDK */
  sourceId: string;
  /** Square plan variation ID (from listSubscriptionPlans) */
  planVariationId: string;
  /** Human-readable plan name */
  planName: string;
  /** Cadence string, e.g. "WEEKLY" or "MONTHLY" */
  cadence: string;
  /** Plan price in cents (must be a positive integer) */
  amountCents: number;
  /** Subscriber email — required for customer creation and confirmation email */
  customerEmail: string;
  /** Optional subscriber name */
  customerName?: string;
  /** Optional subscriber phone */
  customerPhone?: string;
}

function isValidBody(body: unknown): body is SubscribeBody {
  if (!body || typeof body !== "object") return false;
  const b = body as Record<string, unknown>;
  return (
    typeof b.sourceId === "string" && b.sourceId.length > 0 &&
    typeof b.planVariationId === "string" && b.planVariationId.length > 0 &&
    typeof b.planName === "string" && b.planName.length > 0 &&
    typeof b.cadence === "string" && b.cadence.length > 0 &&
    typeof b.amountCents === "number" &&
    Number.isInteger(b.amountCents) &&
    b.amountCents > 0 &&
    typeof b.customerEmail === "string" &&
    b.customerEmail.includes("@")
  );
}

// ── Handler ───────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  // ── 1. Parse body ─────────────────────────────────────────────────────────
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body" }, { status: 400 });
  }

  if (!isValidBody(body)) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Missing or invalid fields: sourceId, planVariationId, planName, cadence, amountCents, customerEmail required.",
      },
      { status: 400 }
    );
  }

  // ── 2. Graceful degradation when Square is not configured ─────────────────
  if (!squareSubscriptionsConfigured()) {
    if (process.env.NODE_ENV !== "production") {
      console.info("[upaec] Square not configured — subscribe returning unconfigured state.");
    }
    return NextResponse.json({
      ok: false,
      configured: false,
      error:
        "Subscriptions not configured. Set SQUARE_ACCESS_TOKEN, SQUARE_ENVIRONMENT, and SQUARE_LOCATION_ID to enable subscriptions.",
    });
  }

  // ── 3. Create or retrieve Square Customer ─────────────────────────────────
  const customerResult = await createOrGetCustomer({
    email: body.customerEmail,
    name: body.customerName,
    phone: body.customerPhone,
  });

  if (!customerResult.ok || !customerResult.customerId) {
    const publicMessage = "Could not set up your customer account. Please try again.";
    if (process.env.NODE_ENV !== "production") {
      console.error("[upaec] createOrGetCustomer failed:", customerResult.error);
    }
    return NextResponse.json(
      { ok: false, configured: true, error: publicMessage },
      { status: 402 }
    );
  }

  const customerId = customerResult.customerId;

  // ── 4. Store card on file ─────────────────────────────────────────────────
  const cardResult = await storeCardOnFile({
    customerId,
    sourceId: body.sourceId,
  });

  if (!cardResult.ok || !cardResult.cardId) {
    const publicMessage = "Could not save your card on file. Please check your card details and try again.";
    if (process.env.NODE_ENV !== "production") {
      console.error("[upaec] storeCardOnFile failed:", cardResult.error);
    }
    return NextResponse.json(
      { ok: false, configured: true, error: publicMessage },
      { status: 402 }
    );
  }

  const cardId = cardResult.cardId;

  // ── 5. Create Square Subscription ─────────────────────────────────────────
  const subscriptionResult = await createSubscription({
    customerId,
    cardId,
    planVariationId: body.planVariationId,
  });

  if (!subscriptionResult.ok || !subscriptionResult.subscriptionId) {
    const publicMessage = "Could not create your subscription. Please try again or contact us.";
    if (process.env.NODE_ENV !== "production") {
      console.error("[upaec] createSubscription failed:", subscriptionResult.error);
    }
    return NextResponse.json(
      { ok: false, configured: true, error: publicMessage },
      { status: 402 }
    );
  }

  const subscriptionId = subscriptionResult.subscriptionId;
  const subscriptionStatus = subscriptionResult.status ?? "ACTIVE";

  // ── 6. Persist subscription to Supabase (fire-and-forget) ─────────────────
  // Persistence failure MUST NOT fail the subscription.
  const persistResult = await insertSubscription({
    square_subscription_id: subscriptionId,
    square_customer_id: customerId,
    square_card_id: cardId,
    plan_variation_id: body.planVariationId,
    plan_name: body.planName,
    cadence: body.cadence,
    amount_cents: body.amountCents,
    customer_email: body.customerEmail,
    customer_name: body.customerName ?? null,
    status: subscriptionStatus,
  });

  if (!persistResult.ok) {
    console.warn(
      "[upaec] Subscription persistence skipped/failed for subscription:",
      subscriptionId,
      persistResult.error
    );
  }

  // ── 7. Send confirmation email (fire-and-forget) ──────────────────────────
  // Email failure MUST NOT fail the subscription.
  const emailResult = await sendSubscriptionConfirmation({
    to: body.customerEmail,
    customerName: body.customerName ?? null,
    planName: body.planName,
    cadence: body.cadence,
    amountCents: body.amountCents,
    subscriptionId,
  });

  if (!emailResult.ok && !emailResult.skipped) {
    console.warn(
      "[upaec] Subscription confirmation email failed for subscription:",
      subscriptionId,
      emailResult.error
    );
  }

  // ── 8. Respond with success ───────────────────────────────────────────────
  return NextResponse.json({
    ok: true,
    subscriptionId,
    status: subscriptionStatus,
    source: subscriptionResult.source,
  });
}
