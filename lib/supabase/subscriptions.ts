/**
 * Subscription persistence — Supabase `subscriptions` table.
 *
 * Records a subscription after it's been created in Square. If Supabase
 * is not configured or the insert fails, `insertSubscription()` logs a
 * warning and returns `{ ok: false }`. The Square subscription still
 * exists — do NOT propagate persistence errors to the subscriber.
 *
 * Table schema: see supabase/migrations/20260520_create_subscriptions.sql
 *
 * Task: UPAEC-T-272-05
 */

import { buildSupabaseClient } from "./client";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface SubscriptionInsertParams {
  /** Square subscription ID */
  square_subscription_id: string;
  /** Square customer ID */
  square_customer_id: string;
  /** Square card-on-file ID */
  square_card_id: string;
  /** Square plan variation ID */
  plan_variation_id: string;
  /** Human-readable plan name (e.g. "Weekly Box") */
  plan_name: string;
  /** Cadence string from Square (e.g. "WEEKLY" | "MONTHLY") */
  cadence: string;
  /** Subscription price in cents */
  amount_cents: number;
  /** Subscriber email */
  customer_email: string;
  /** Subscriber display name (optional) */
  customer_name?: string | null;
  /** Status from Square (e.g. "ACTIVE", "PENDING") */
  status: string;
}

export interface SubscriptionInsertResult {
  ok: boolean;
  subscriptionRowId?: string;
  error?: string;
}

// ── insertSubscription ────────────────────────────────────────────────────────

/**
 * Persist a newly created subscription to Supabase.
 *
 * Returns `{ ok: true, subscriptionRowId }` on success.
 * Returns `{ ok: false, error }` on failure — caller MUST NOT surface this
 * as a subscription failure. The Square record already exists.
 */
export async function insertSubscription(
  params: SubscriptionInsertParams
): Promise<SubscriptionInsertResult> {
  const client = buildSupabaseClient();

  if (!client) {
    console.warn(
      "[upaec] Supabase not configured — subscription NOT persisted. " +
        "Set NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY to enable persistence."
    );
    return { ok: false, error: "supabase_not_configured" };
  }

  try {
    const { data, error } = await client
      .from("subscriptions")
      .insert({
        square_subscription_id: params.square_subscription_id,
        square_customer_id: params.square_customer_id,
        square_card_id: params.square_card_id,
        plan_variation_id: params.plan_variation_id,
        plan_name: params.plan_name,
        cadence: params.cadence,
        amount_cents: params.amount_cents,
        customer_email: params.customer_email,
        customer_name: params.customer_name ?? null,
        status: params.status,
        // created_at / updated_at set by DB default
      })
      .select("id")
      .single();

    if (error) {
      console.warn("[upaec] Supabase subscription insert failed:", error.message);
      return { ok: false, error: error.message };
    }

    return { ok: true, subscriptionRowId: data?.id as string | undefined };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn("[upaec] Supabase subscription insert threw:", msg);
    return { ok: false, error: msg };
  }
}
