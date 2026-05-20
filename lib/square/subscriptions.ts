/**
 * Square Subscriptions API helpers — server-side only.
 *
 * Uses the official Square Node SDK (SquareClient).
 * Reuses the same buildClient() pattern from lib/square/catalog.ts.
 *
 * Covered operations:
 *   listSubscriptionPlans()  — list SUBSCRIPTION_PLAN objects from the catalog
 *   createOrGetCustomer()    — upsert a Square Customer by email
 *   storeCardOnFile()        — save a Web Payments nonce as a card on file
 *   createSubscription()     — start a Square Subscription for the customer
 *
 * Graceful degradation: all functions return typed result objects. When
 * SQUARE_ACCESS_TOKEN is absent any live call is skipped and a fallback
 * shape is returned. Callers must never crash on { ok: false }.
 *
 * Env vars:
 *   SQUARE_ACCESS_TOKEN   — required for live calls
 *   SQUARE_ENVIRONMENT    — "sandbox" | "production" (default: sandbox)
 *   SQUARE_LOCATION_ID    — required for subscription creation; auto-resolved
 *                           from /v2/locations when absent
 *
 * Task: UPAEC-T-272-05
 */

import { SquareClient, SquareEnvironment, SquareError } from "square";
import { randomUUID } from "crypto";

// ── SDK client factory (mirrors lib/square/catalog.ts) ───────────────────────

function buildClient(): SquareClient | null {
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

export function squareSubscriptionsConfigured(): boolean {
  return Boolean(process.env.SQUARE_ACCESS_TOKEN);
}

// ── Location resolution (cached for process lifetime) ────────────────────────

let cachedLocationId: string | null = null;

async function resolveLocationId(client: SquareClient): Promise<string | null> {
  const fromEnv = process.env.SQUARE_LOCATION_ID;
  if (fromEnv) return fromEnv;
  if (cachedLocationId) return cachedLocationId;
  try {
    const res = await client.locations.list();
    const id = res.locations?.[0]?.id ?? null;
    if (id) cachedLocationId = id;
    return id;
  } catch {
    return null;
  }
}

// ── Money helpers ─────────────────────────────────────────────────────────────

function bigintToCents(v: bigint | number | null | undefined): number {
  if (v == null) return 0;
  return typeof v === "bigint" ? Number(v) : v;
}

function centsToDisplay(cents: number): string {
  if (cents === 0) return "—";
  return `$${(cents / 100).toFixed(cents % 100 === 0 ? 0 : 2)}`;
}

// ── Types ─────────────────────────────────────────────────────────────────────

export interface SubscriptionPlan {
  /** Catalog object ID of the SUBSCRIPTION_PLAN */
  id: string;
  name: string;
  /** Human-readable cadence, e.g. "WEEKLY" or "MONTHLY" */
  cadence: string;
  /** Price in cents for the primary phase */
  priceCents: number;
  priceDisplay: string;
  /** ID of the first subscription plan variation (used for subscription creation) */
  variationId: string;
}

export interface ListPlansResult {
  source: "square" | "fallback";
  configured: boolean;
  plans: SubscriptionPlan[];
}

export interface CustomerResult {
  ok: boolean;
  source: "square" | "fallback";
  customerId?: string;
  error?: string;
}

export interface CardOnFileResult {
  ok: boolean;
  source: "square" | "fallback";
  cardId?: string;
  error?: string;
}

export interface SubscriptionResult {
  ok: boolean;
  source: "square" | "fallback";
  subscriptionId?: string;
  status?: string;
  error?: string;
}

// ── Fallback plan data ────────────────────────────────────────────────────────

const PLAN_FALLBACKS: SubscriptionPlan[] = [
  {
    id: "fallback-plan-weekly",
    name: "Weekly Box",
    cadence: "WEEKLY",
    priceCents: 4500,
    priceDisplay: "$45/week",
    variationId: "fallback-plan-weekly-v1",
  },
  {
    id: "fallback-plan-monthly",
    name: "Monthly Box",
    cadence: "MONTHLY",
    priceCents: 16000,
    priceDisplay: "$160/month",
    variationId: "fallback-plan-monthly-v1",
  },
];

// ── listSubscriptionPlans ─────────────────────────────────────────────────────

/**
 * Fetch SUBSCRIPTION_PLAN catalog objects from Square.
 *
 * When Square is not configured, returns the fallback plan list so the UI
 * can still render a plan chooser (with a "not configured" state indicator).
 */
export async function listSubscriptionPlans(): Promise<ListPlansResult> {
  const client = buildClient();

  if (!client) {
    if (process.env.NODE_ENV !== "production") {
      console.info("[upaec] SQUARE_ACCESS_TOKEN not set — using subscription plan fallback");
    }
    return { source: "fallback", configured: false, plans: PLAN_FALLBACKS };
  }

  try {
    const plans: SubscriptionPlan[] = [];

    // The Square SDK catalog.list() accepts a comma-separated types string.
    // SUBSCRIPTION_PLAN objects have subscriptionPlanData with phases.
    const page = await client.catalog.list({ types: "SUBSCRIPTION_PLAN" });

    for await (const obj of page) {
      if (obj.type !== "SUBSCRIPTION_PLAN" || !obj.subscriptionPlanData) continue;

      // The narrowed type is CatalogObject.SubscriptionPlan which extends
      // CatalogObjectSubscriptionPlanVariation — access via subscriptionPlanData.
      // Use a type assertion to access the correctly-typed field.
      const planObj = obj as import("square").CatalogObject & {
        subscriptionPlanData?: import("square").CatalogSubscriptionPlan;
      };
      const planData = planObj.subscriptionPlanData;
      if (!planData) continue;

      const name = planData.name ?? "Unnamed Plan";

      // subscriptionPlanVariations is CatalogObject[] — each variation entry
      // is a SUBSCRIPTION_PLAN_VARIATION CatalogObject with subscriptionPlanVariationData.
      const rawVariations = planData.subscriptionPlanVariations ?? [];
      if (rawVariations.length === 0) continue;

      for (const rawVariation of rawVariations) {
        // Each variation is a CatalogObject.SubscriptionPlanVariation
        const variation = rawVariation as import("square").CatalogObject & {
          subscriptionPlanVariationData?: import("square").CatalogSubscriptionPlanVariation;
        };
        if (!variation.subscriptionPlanVariationData) continue;
        const vd = variation.subscriptionPlanVariationData;
        const phases = vd.phases ?? [];
        if (phases.length === 0) continue;

        const primaryPhase = phases[0];
        const priceMoney = primaryPhase.recurringPriceMoney;
        const priceCents = bigintToCents(priceMoney?.amount);
        const cadence: string = primaryPhase.cadence ?? "MONTHLY";

        const variationId = variation.id;
        if (!variationId) continue;

        plans.push({
          id: obj.id,
          name: `${name}${rawVariations.length > 1 ? ` — ${vd.name}` : ""}`,
          cadence,
          priceCents,
          priceDisplay: `${centsToDisplay(priceCents)}/${cadence.toLowerCase()}`,
          variationId,
        });
      }
    }

    // Fall back to static plans if Square returned nothing
    const finalPlans = plans.length > 0 ? plans : PLAN_FALLBACKS;

    return { source: "square", configured: true, plans: finalPlans };
  } catch (err) {
    const label =
      err instanceof SquareError ? `SquareError ${err.statusCode}` : String(err);
    if (process.env.NODE_ENV !== "production") {
      console.warn(`[upaec] listSubscriptionPlans failed (${label}) — using fallback`);
    }
    return { source: "fallback", configured: true, plans: PLAN_FALLBACKS };
  }
}

// ── createOrGetCustomer ───────────────────────────────────────────────────────

/**
 * Search Square for an existing customer by email; create one if not found.
 *
 * Idempotent: calling twice with the same email returns the same customer ID.
 */
export async function createOrGetCustomer(input: {
  email: string;
  name?: string;
  phone?: string;
}): Promise<CustomerResult> {
  const client = buildClient();

  if (!client) {
    if (process.env.NODE_ENV !== "production") {
      console.log("[upaec fallback] would create Square Customer:", input.email);
    }
    return { ok: true, source: "fallback", customerId: `fallback-cust-${Date.now()}` };
  }

  try {
    // 1. Search by email first (avoid duplicates)
    const searchRes = await client.customers.search({
      query: { filter: { emailAddress: { exact: input.email } } },
    });

    const existing = searchRes.customers?.[0];
    if (existing?.id) {
      return { ok: true, source: "square", customerId: existing.id };
    }

    // 2. Create new customer
    const [given, ...rest] = (input.name ?? "").trim().split(/\s+/);
    const family = rest.join(" ") || undefined;

    const createRes = await client.customers.create({
      idempotencyKey: `upaec-sub-cust-${input.email.toLowerCase()}-${Date.now()}`,
      emailAddress: input.email,
      givenName: given || undefined,
      familyName: family,
      phoneNumber: input.phone || undefined,
      referenceId: "upaec-web-subscription",
    });

    if (createRes.customer?.id) {
      return { ok: true, source: "square", customerId: createRes.customer.id };
    }

    return {
      ok: false,
      source: "square",
      error: "Square returned no customer ID after creation",
    };
  } catch (err) {
    const label =
      err instanceof SquareError
        ? `SquareError ${err.statusCode}: ${JSON.stringify(err.errors ?? []).slice(0, 200)}`
        : String(err);
    if (process.env.NODE_ENV !== "production") {
      console.error("[upaec] createOrGetCustomer failed:", label);
    }
    return { ok: false, source: "square", error: label };
  }
}

// ── storeCardOnFile ───────────────────────────────────────────────────────────

/**
 * Store a Web Payments nonce as a card on file for the given customer.
 *
 * Square Subscriptions require a card on file (not a one-time nonce).
 * The returned cardId is passed to createSubscription().
 */
export async function storeCardOnFile(input: {
  customerId: string;
  /** Payment nonce from Square Web Payments tokenize() */
  sourceId: string;
}): Promise<CardOnFileResult> {
  const client = buildClient();

  if (!client) {
    if (process.env.NODE_ENV !== "production") {
      console.log("[upaec fallback] would store card on file for customer:", input.customerId);
    }
    return { ok: true, source: "fallback", cardId: `fallback-card-${Date.now()}` };
  }

  try {
    const res = await client.cards.create({
      idempotencyKey: randomUUID(),
      sourceId: input.sourceId,
      card: {
        customerId: input.customerId,
      },
    });

    if (res.card?.id) {
      return { ok: true, source: "square", cardId: res.card.id };
    }

    return { ok: false, source: "square", error: "Square returned no card ID" };
  } catch (err) {
    const label =
      err instanceof SquareError
        ? `SquareError ${err.statusCode}: ${JSON.stringify(err.errors ?? []).slice(0, 200)}`
        : String(err);
    if (process.env.NODE_ENV !== "production") {
      console.error("[upaec] storeCardOnFile failed:", label);
    }
    return { ok: false, source: "square", error: label };
  }
}

// ── createSubscription ────────────────────────────────────────────────────────

/**
 * Create a Square Subscription for the customer with the given plan variation.
 *
 * Requires: customerId + cardId (card on file) + planVariationId + locationId.
 * Starts immediately (startDate defaults to today in Square).
 */
export async function createSubscription(input: {
  customerId: string;
  cardId: string;
  planVariationId: string;
}): Promise<SubscriptionResult> {
  const client = buildClient();

  if (!client) {
    if (process.env.NODE_ENV !== "production") {
      console.log("[upaec fallback] would create subscription for customer:", input.customerId);
    }
    return {
      ok: true,
      source: "fallback",
      subscriptionId: `fallback-sub-${Date.now()}`,
      status: "ACTIVE",
    };
  }

  try {
    const locationId = await resolveLocationId(client);
    if (!locationId) {
      return {
        ok: false,
        source: "square",
        error: "Could not resolve Square location ID. Set SQUARE_LOCATION_ID.",
      };
    }

    const res = await client.subscriptions.create({
      idempotencyKey: randomUUID(),
      locationId,
      customerId: input.customerId,
      planVariationId: input.planVariationId,
      cardId: input.cardId,
      timezone: "America/Chicago",
    });

    const sub = res.subscription;
    if (sub?.id) {
      return {
        ok: true,
        source: "square",
        subscriptionId: sub.id,
        status: sub.status ?? "ACTIVE",
      };
    }

    return { ok: false, source: "square", error: "Square returned no subscription ID" };
  } catch (err) {
    const label =
      err instanceof SquareError
        ? `SquareError ${err.statusCode}: ${JSON.stringify(err.errors ?? []).slice(0, 200)}`
        : String(err);
    if (process.env.NODE_ENV !== "production") {
      console.error("[upaec] createSubscription failed:", label);
    }
    return { ok: false, source: "square", error: label };
  }
}
