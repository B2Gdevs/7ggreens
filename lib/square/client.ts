/**
 * Square integration façade.
 *
 * Real fetch-based calls when SQUARE_ACCESS_TOKEN is present; falls
 * through to static placeholders from constants.ts when unset. No
 * Square SDK dep needed — uses the v2 REST API directly.
 *
 * Env vars:
 * - SQUARE_ACCESS_TOKEN — required to make live calls
 * - SQUARE_ENVIRONMENT  — "sandbox" (default) or "production"
 * - SQUARE_LOCATION_ID  — optional. If unset, we fetch the first
 *   location from /v2/locations on first use and cache for the
 *   process lifetime.
 * - SQUARE_APPLICATION_ID — used by the client SDK in Phase 04 (Web
 *   Payments). Not required for Customer creation.
 */

import { BOX_FALLBACKS } from "@/lib/site/constants";

export type SquareEnv = "sandbox" | "production";

export interface BoxItem {
  id: string;
  name: string;
  priceCents: number;
  priceDisplay: string;
  portion: string;
  itemCount: number;
  items: readonly string[];
}

export interface CatalogResult {
  source: "square" | "fallback";
  starter: BoxItem;
  family: BoxItem;
}

export interface CustomerCreateInput {
  email: string;
  name?: string;
  zip?: string;
  phone?: string;
  tags?: string[];
}

export interface CustomerCreateResult {
  source: "square" | "fallback";
  ok: boolean;
  customerId?: string;
  message?: string;
  error?: string;
}

export function squareConfigured(): boolean {
  return Boolean(process.env.SQUARE_ACCESS_TOKEN);
}

export function squareEnv(): SquareEnv {
  return (process.env.SQUARE_ENVIRONMENT as SquareEnv) || "sandbox";
}

function squareApiBase(): string {
  return squareEnv() === "production"
    ? "https://connect.squareup.com"
    : "https://connect.squareupsandbox.com";
}

let cachedLocationId: string | null = null;

async function squareFetch<T = unknown>(path: string, init: RequestInit = {}): Promise<T> {
  const token = process.env.SQUARE_ACCESS_TOKEN;
  if (!token) throw new Error("SQUARE_ACCESS_TOKEN not set");

  const res = await fetch(`${squareApiBase()}${path}`, {
    ...init,
    headers: {
      "Authorization": `Bearer ${token}`,
      "Square-Version": "2024-12-18",
      "Content-Type": "application/json",
      "Accept": "application/json",
      ...(init.headers || {}),
    },
  });

  const text = await res.text();
  if (!res.ok) {
    throw new Error(
      `Square API ${path} → ${res.status}: ${text.slice(0, 400)}`
    );
  }
  return text ? (JSON.parse(text) as T) : ({} as T);
}

async function getLocationId(): Promise<string | null> {
  if (process.env.SQUARE_LOCATION_ID) return process.env.SQUARE_LOCATION_ID;
  if (cachedLocationId) return cachedLocationId;
  try {
    const data = await squareFetch<{ locations?: Array<{ id: string }> }>("/v2/locations");
    const id = data.locations?.[0]?.id ?? null;
    if (id) cachedLocationId = id;
    return id;
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.warn("[7greens] failed to fetch Square location:", err);
    }
    return null;
  }
}

/**
 * Fetch the box catalog. Falls back to static placeholders when
 * Square is not configured. (Live Square Catalog wiring lands in
 * Phase 03 once the operator's Catalog items are mapped — for now
 * we keep the well-known fallback shape regardless of token state.)
 */
export async function fetchCatalog(): Promise<CatalogResult> {
  // Until we have catalog items mapped to Square, always serve fallbacks.
  // squareConfigured() is checked elsewhere (e.g. for live Customer creation).
  return {
    source: "fallback",
    starter: { ...BOX_FALLBACKS.starter, items: [...BOX_FALLBACKS.starter.items] },
    family: { ...BOX_FALLBACKS.family, items: [...BOX_FALLBACKS.family.items] },
  };
}

/**
 * Create a Square Customer. Real API call when configured; otherwise
 * a no-op success that captures intent in dev logs.
 */
export async function createCustomer(input: CustomerCreateInput): Promise<CustomerCreateResult> {
  if (!squareConfigured()) {
    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.log("[7greens fallback] would create Square Customer:", input);
    }
    return {
      source: "fallback",
      ok: true,
      message: "Captured — we'll be in touch when the season opens.",
    };
  }

  try {
    const [given, ...rest] = (input.name ?? "").trim().split(/\s+/);
    const family = rest.join(" ") || undefined;

    const body = {
      idempotency_key: `7greens-${input.email.toLowerCase()}-${Date.now()}`,
      given_name: given || undefined,
      family_name: family,
      email_address: input.email,
      phone_number: input.phone || undefined,
      address: input.zip
        ? { postal_code: input.zip, country: "US" }
        : undefined,
      reference_id: "7greens-web",
      note: input.tags?.length ? `tags: ${input.tags.join(", ")}` : undefined,
    };

    const res = await squareFetch<{
      customer?: { id?: string };
      errors?: Array<{ detail?: string; code?: string }>;
    }>("/v2/customers", {
      method: "POST",
      body: JSON.stringify(body),
    });

    if (res.errors?.length) {
      return {
        source: "square",
        ok: false,
        error: res.errors.map((e) => e.detail || e.code || "unknown").join("; "),
        message: "We couldn't save your details just now. Please try again or call us.",
      };
    }

    return {
      source: "square",
      ok: true,
      customerId: res.customer?.id,
      message: "You're on the list. We'll be in touch when boxes open.",
    };
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.error("[7greens] Square createCustomer failed:", err);
    }
    return {
      source: "square",
      ok: false,
      error: err instanceof Error ? err.message : String(err),
      message: "We couldn't save your details just now. Please try again or call us.",
    };
  }
}

/**
 * Resolve the merchant's primary location ID. Used by Phase 04 order
 * creation. Exported here so tests / debug can poke it.
 */
export async function getPrimaryLocationId(): Promise<string | null> {
  if (!squareConfigured()) return null;
  return getLocationId();
}
