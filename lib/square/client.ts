/**
 * Square integration façade.
 *
 * If SQUARE_ACCESS_TOKEN is set in env, helpers fetch live data
 * from Square. Otherwise they return fallbacks from constants.ts so
 * the site renders fully without Square connected. This is by design
 * per operator direction: "we should have some fallbacks if we don't
 * have square connected at the time, which we won't... but all the
 * pages and looks can be done."
 *
 * Square SDK is not installed yet — Phase 04 will add `square`
 * dep + replace the fetch calls below with the SDK. This module
 * serves as the seam.
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
}

export function squareConfigured(): boolean {
  return Boolean(process.env.SQUARE_ACCESS_TOKEN && process.env.SQUARE_LOCATION_ID);
}

export function squareEnv(): SquareEnv {
  return (process.env.SQUARE_ENVIRONMENT as SquareEnv) || "sandbox";
}

/**
 * Fetch the box catalog. Falls back to static placeholders when
 * Square is not configured.
 */
export async function fetchCatalog(): Promise<CatalogResult> {
  if (!squareConfigured()) {
    return {
      source: "fallback",
      starter: { ...BOX_FALLBACKS.starter, items: [...BOX_FALLBACKS.starter.items] },
      family: { ...BOX_FALLBACKS.family, items: [...BOX_FALLBACKS.family.items] },
    };
  }
  // Phase 04: replace with `import { SquareClient } from "square"` + catalog list.
  return {
    source: "fallback",
    starter: { ...BOX_FALLBACKS.starter, items: [...BOX_FALLBACKS.starter.items] },
    family: { ...BOX_FALLBACKS.family, items: [...BOX_FALLBACKS.family.items] },
  };
}

/**
 * Create a Square Customer. Falls back to a no-op success when Square
 * is not configured — the form pretends to work so we capture the lead
 * intent in client logs and the operator can wire Square later.
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
  // Phase 04: SquareClient.customers.create({...})
  return {
    source: "fallback",
    ok: true,
    message: "Captured — we'll be in touch when the season opens.",
  };
}
