/**
 * Order persistence — Supabase `orders` table.
 *
 * A charge is not a real order until it's persisted. This module inserts
 * an order record after a successful Square payment.
 *
 * Graceful degradation: if Supabase is not configured or the insert fails,
 * `insertOrder()` logs a warning and returns `{ ok: false }`. The payment
 * still succeeds — do NOT propagate persistence errors to the payer.
 *
 * Orders table schema: see supabase/migrations/20260520_create_orders.sql
 *
 * Task: UPAEC-T-272-07
 */

import { buildSupabaseClient } from "./client";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface OrderInsertParams {
  /** Square payment ID (e.g. "sq0D-…") */
  payment_id: string;
  /** Square catalog item / variation ID or fallback display id */
  item_id: string;
  /** Human-readable item name (e.g. "Starter Box") */
  item_name: string;
  /** Amount in cents (must be a positive integer) */
  amount_cents: number;
  /** Buyer email — optional; captured when the checkout form includes it */
  customer_email?: string | null;
  /** Square receipt URL */
  receipt_url?: string | null;
  /** Payment status as returned by Square (e.g. "COMPLETED") */
  status: string;
}

export interface OrderInsertResult {
  ok: boolean;
  orderId?: string;
  error?: string;
}

// ── insertOrder ───────────────────────────────────────────────────────────────

/**
 * Persist a completed order to Supabase.
 *
 * Returns `{ ok: true, orderId }` on success.
 * Returns `{ ok: false, error }` on failure — caller MUST NOT surface this
 * as a payment failure. The Square charge already succeeded.
 */
export async function insertOrder(
  params: OrderInsertParams
): Promise<OrderInsertResult> {
  const client = buildSupabaseClient();

  if (!client) {
    console.warn(
      "[upaec] Supabase not configured — order NOT persisted. " +
        "Set NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY to enable persistence."
    );
    return { ok: false, error: "supabase_not_configured" };
  }

  try {
    const { data, error } = await client
      .from("orders")
      .insert({
        payment_id: params.payment_id,
        item_id: params.item_id,
        item_name: params.item_name,
        amount_cents: params.amount_cents,
        customer_email: params.customer_email ?? null,
        receipt_url: params.receipt_url ?? null,
        status: params.status,
        // created_at is set by the DB default (now())
      })
      .select("id")
      .single();

    if (error) {
      console.warn("[upaec] Supabase order insert failed:", error.message);
      return { ok: false, error: error.message };
    }

    return { ok: true, orderId: data?.id as string | undefined };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn("[upaec] Supabase order insert threw:", msg);
    return { ok: false, error: msg };
  }
}
