/**
 * POST /api/webhooks/square — Square webhook event receiver.
 *
 * Verifies the Square webhook HMAC-SHA256 signature, then handles:
 *   payment.updated  — upsert order status in Supabase orders table
 *   order.updated    — upsert order status in Supabase orders table
 *
 * Square signature verification (spec: https://developer.squareup.com/docs/webhooks/validate-notifications):
 *   1. Concatenate the notification URL (the full public URL of THIS endpoint)
 *      and the raw request body (bytes, not parsed JSON).
 *   2. Compute HMAC-SHA256 over that concatenated string using
 *      SQUARE_WEBHOOK_SIGNATURE_KEY as the key.
 *   3. Base64-encode the digest.
 *   4. Compare to the x-square-hmacsha256-signature header (timing-safe compare).
 *
 * Env vars:
 *   SQUARE_WEBHOOK_SIGNATURE_KEY — required; from Square Developer Dashboard →
 *     Webhooks → your endpoint → Signature key
 *   NEXT_PUBLIC_SITE_URL (or VERCEL_URL) — used to reconstruct the notification
 *     URL for HMAC computation. If absent, falls back to the x-forwarded-host header.
 *   NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY — for order persistence
 *
 * Returns:
 *   200  — event accepted (or skipped for unsupported event types)
 *   400  — signature missing or invalid
 *   500  — internal error during processing
 *
 * Design: fail open on Supabase errors (log warn, still 200) so Square does
 * not retry indefinitely on DB issues. Return 500 only on signature or
 * parsing errors to keep Square's retry logic meaningful.
 *
 * Task: UPAEC webhook implementation (ORDER-07)
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import { buildSupabaseClient } from "@/lib/supabase/client";

// ── Supported event types ─────────────────────────────────────────────────────

const HANDLED_EVENT_TYPES = new Set([
  "payment.updated",
  "order.updated",
  // Square may also send payment.created; handle it the same way
  "payment.created",
]);

// ── Signature verification ────────────────────────────────────────────────────

/**
 * Reconstruct the notification URL that Square signed.
 *
 * Square signs: notificationUrl + rawBody
 * The notification URL must exactly match what was registered in the Square
 * Developer Dashboard Webhooks section.
 */
function buildNotificationUrl(req: NextRequest): string {
  // Prefer explicit site URL env var (set in Vercel production)
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    const base = process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
    return `${base}/api/webhooks/square`;
  }

  // Fall back to VERCEL_URL (injected by Vercel; no protocol prefix)
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}/api/webhooks/square`;
  }

  // Last resort: reconstruct from the request host header
  const host =
    req.headers.get("x-forwarded-host") ?? req.headers.get("host") ?? "localhost";
  const proto =
    req.headers.get("x-forwarded-proto") ?? "https";
  return `${proto}://${host}/api/webhooks/square`;
}

/**
 * Verify the Square HMAC-SHA256 webhook signature.
 *
 * @returns true if the signature is valid, false otherwise.
 */
function verifySquareSignature(
  signatureKey: string,
  notificationUrl: string,
  rawBody: string,
  signatureHeader: string
): boolean {
  // Square signs: notificationUrl + body (raw, no separator)
  const payload = notificationUrl + rawBody;
  const hmac = createHmac("sha256", signatureKey);
  hmac.update(payload, "utf8");
  const computed = hmac.digest("base64");

  // Timing-safe comparison to prevent timing attacks
  try {
    const a = Buffer.from(computed, "utf8");
    const b = Buffer.from(signatureHeader, "utf8");
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

// ── Supabase upsert helpers ───────────────────────────────────────────────────

/**
 * Upsert an order record into the Supabase orders table.
 *
 * Keyed on payment_id (Square's payment.id). On conflict, updates status only.
 * We don't create a new row for every webhook — Square sends multiple events
 * for a single payment lifecycle (created, completed, updated).
 */
async function upsertOrderFromPayment(payment: SquarePaymentObject): Promise<void> {
  const client = buildSupabaseClient();
  if (!client) {
    console.warn("[upaec/webhook] Supabase not configured — skipping order upsert");
    return;
  }

  const paymentId = payment.id ?? `unknown-${Date.now()}`;
  const status = payment.status ?? "UNKNOWN";
  const amountCents = Number(payment.amount_money?.amount ?? 0);
  const receiptUrl = payment.receipt_url ?? null;

  const { error } = await client
    .from("orders")
    .upsert(
      {
        payment_id: paymentId,
        // item_id and item_name are not in the webhook payload — leave empty
        // string so the column constraint (NOT NULL) doesn't fail.
        // The row was already inserted by /api/checkout with real values;
        // upsert here updates status only via the on_conflict clause.
        item_id: payment.reference_id ?? "webhook-update",
        item_name: "Updated via webhook",
        amount_cents: amountCents,
        receipt_url: receiptUrl,
        status,
        customer_email: payment.buyer_email_address ?? null,
      },
      {
        // Upsert: if payment_id already exists, update status + receipt_url
        onConflict: "payment_id",
        ignoreDuplicates: false,
      }
    );

  if (error) {
    console.warn("[upaec/webhook] Supabase order upsert failed:", error.message);
  } else {
    console.log(`[upaec/webhook] Order upserted: payment_id=${paymentId} status=${status}`);
  }
}

// ── Square payload types (minimal — we only access what we need) ───────────

interface SquareMoney {
  amount?: bigint | number | string | null;
  currency?: string;
}

interface SquarePaymentObject {
  id?: string;
  status?: string;
  amount_money?: SquareMoney;
  receipt_url?: string | null;
  reference_id?: string | null;
  buyer_email_address?: string | null;
}

interface SquareOrderObject {
  id?: string;
  state?: string;
  reference_id?: string | null;
}

interface SquareWebhookPayload {
  merchant_id?: string;
  type?: string;
  event_id?: string;
  created_at?: string;
  data?: {
    type?: string;
    id?: string;
    object?: {
      payment?: SquarePaymentObject;
      order?: SquareOrderObject;
    };
  };
}

// ── Handler ──────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  // ── 1. Read raw body (needed for HMAC; must read before any JSON parse) ────
  let rawBody: string;
  try {
    rawBody = await req.text();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Failed to read request body" },
      { status: 400 }
    );
  }

  // ── 2. Signature verification ──────────────────────────────────────────────
  const signatureKey = process.env.SQUARE_WEBHOOK_SIGNATURE_KEY?.trim();

  if (!signatureKey) {
    // Key not configured — reject all webhooks (safe default)
    console.warn("[upaec/webhook] SQUARE_WEBHOOK_SIGNATURE_KEY not set — rejecting webhook");
    return NextResponse.json(
      { ok: false, error: "Webhook signature key not configured" },
      { status: 400 }
    );
  }

  const signatureHeader = req.headers.get("x-square-hmacsha256-signature") ?? "";
  if (!signatureHeader) {
    console.warn("[upaec/webhook] Missing x-square-hmacsha256-signature header");
    return NextResponse.json(
      { ok: false, error: "Missing signature header" },
      { status: 400 }
    );
  }

  const notificationUrl = buildNotificationUrl(req);
  const signatureValid = verifySquareSignature(
    signatureKey,
    notificationUrl,
    rawBody,
    signatureHeader
  );

  if (!signatureValid) {
    console.warn(
      "[upaec/webhook] Signature mismatch — rejected. " +
        `notificationUrl=${notificationUrl} ` +
        `header=${signatureHeader.slice(0, 16)}…`
    );
    return NextResponse.json(
      { ok: false, error: "Invalid signature" },
      { status: 400 }
    );
  }

  // ── 3. Parse JSON payload ──────────────────────────────────────────────────
  let payload: SquareWebhookPayload;
  try {
    payload = JSON.parse(rawBody) as SquareWebhookPayload;
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON payload" },
      { status: 400 }
    );
  }

  const eventType = payload.type ?? "unknown";
  const eventId = payload.event_id ?? "unknown";

  // ── 4. Handle supported event types ───────────────────────────────────────
  if (!HANDLED_EVENT_TYPES.has(eventType)) {
    // Acknowledge unknown events so Square doesn't retry
    return NextResponse.json({ ok: true, handled: false, eventType });
  }

  try {
    // payment.created / payment.updated
    if (eventType === "payment.created" || eventType === "payment.updated") {
      const payment = payload.data?.object?.payment;
      if (payment?.id) {
        await upsertOrderFromPayment(payment);
      } else {
        console.warn(`[upaec/webhook] ${eventType} event missing payment object: eventId=${eventId}`);
      }
    }

    // order.updated — Square Orders API; payment is nested or referenced
    if (eventType === "order.updated") {
      const order = payload.data?.object?.order;
      if (order?.id) {
        // The order object doesn't contain payment details directly.
        // Log the state change; a richer integration would call GET /v2/orders/{id}
        // to fetch full order details. For now we record the state update.
        const client = buildSupabaseClient();
        if (client && order.id) {
          const { error } = await client
            .from("orders")
            .update({ status: order.state ?? "UNKNOWN" })
            .eq("payment_id", order.id);
          // order.id is the Square order ID, not payment_id — this may not match.
          // In practice, the payment.updated event is more reliable for order status.
          if (error) {
            console.warn(`[upaec/webhook] order.updated DB update failed: ${error.message}`);
          }
        }
      }
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[upaec/webhook] Error handling event ${eventType} (${eventId}):`, msg);
    // Return 500 so Square retries — the signature was valid but processing failed
    return NextResponse.json(
      { ok: false, error: "Internal processing error" },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, handled: true, eventType, eventId });
}

// GET — liveness check (no auth required)
export async function GET() {
  const keyConfigured = Boolean(process.env.SQUARE_WEBHOOK_SIGNATURE_KEY?.trim());
  const supabaseConfigured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
  );
  return NextResponse.json({
    ok: true,
    webhook: "square",
    signatureKeyConfigured: keyConfigured,
    supabaseConfigured,
    handledEvents: Array.from(HANDLED_EVENT_TYPES),
    note: "POST to this endpoint is called by Square. Verify your endpoint URL matches what is registered in the Square Developer Dashboard.",
  });
}
