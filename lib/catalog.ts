/**
 * UPAEC Canonical Product Catalog — single source of truth.
 *
 * This file IS the catalog. The website renders FROM this file; nothing is
 * hardcoded in JSX. Square IDs (squareCatalogId, squareVariationId) are
 * populated by running POST /api/square/sync-catalog, which upserts each
 * item into Square and writes the returned IDs here (or into
 * lib/catalog-id-map.ts if you prefer a generated file).
 *
 * Prices:
 *   priceCents — authoritative. If Square diverges, sync overwrites Square.
 *
 * Slugs:
 *   URL-safe, kebab-case, stable. Used as cart item IDs, checkout refs,
 *   and Square catalog item names via the sync script.
 *
 * Category:
 *   "box"     — curated vegetable box (Starter, Family)
 *   "produce" — individual produce item / add-on
 *
 * Task: UPAEC catalog implementation
 */

export type ProductCategory = "box" | "produce";

export interface CatalogProduct {
  /** Stable kebab-case identifier — used in cart, checkout, and Square catalog */
  slug: string;
  /** Display name */
  name: string;
  /** Price in cents */
  priceCents: number;
  /** Formatted display price */
  priceDisplay: string;
  /** Category for UI grouping */
  category: ProductCategory;
  /** Square Catalog Item ID — null until synced via /api/square/sync-catalog */
  squareCatalogId: string | null;
  /** Square Catalog Item Variation ID — null until synced */
  squareVariationId: string | null;
}

/**
 * CANONICAL UPAEC PRODUCT LIST
 * Edit this array to add, remove, or reprice items.
 * Run POST /api/square/sync-catalog after any change to push to Square.
 */
export const CATALOG: CatalogProduct[] = [
  // ── Boxes ──────────────────────────────────────────────────────────────────
  {
    slug: "starter-box",
    name: "Starter Box",
    priceCents: 2500,
    priceDisplay: "$25",
    category: "box",
    squareCatalogId: null,
    squareVariationId: null,
  },
  {
    slug: "family-box",
    name: "Family Box",
    priceCents: 3500,
    priceDisplay: "$35",
    category: "box",
    squareCatalogId: null,
    squareVariationId: null,
  },

  // ── Individual produce items / add-ons ────────────────────────────────────
  {
    slug: "bell-peppers-2",
    name: "2 Bell Peppers",
    priceCents: 200,
    priceDisplay: "$2",
    category: "produce",
    squareCatalogId: null,
    squareVariationId: null,
  },
  {
    slug: "large-onions-2",
    name: "2 Large Onions",
    priceCents: 300,
    priceDisplay: "$3",
    category: "produce",
    squareCatalogId: null,
    squareVariationId: null,
  },
  {
    slug: "hibiscus-sorelle-2lb",
    name: "2 lb Hibiscus / Sorelle Calac",
    priceCents: 500,
    priceDisplay: "$5",
    category: "produce",
    squareCatalogId: null,
    squareVariationId: null,
  },
  {
    slug: "potatoes-2",
    name: "2 Potatoes",
    priceCents: 100,
    priceDisplay: "$1",
    category: "produce",
    squareCatalogId: null,
    squareVariationId: null,
  },
  {
    slug: "beets-3",
    name: "3 Beets",
    priceCents: 300,
    priceDisplay: "$3",
    category: "produce",
    squareCatalogId: null,
    squareVariationId: null,
  },
  {
    slug: "potatoes-4",
    name: "4 Potatoes",
    priceCents: 400,
    priceDisplay: "$4",
    category: "produce",
    squareCatalogId: null,
    squareVariationId: null,
  },
  {
    slug: "curly-mustard-5lb",
    name: "5 lb Curly Mustard",
    priceCents: 500,
    priceDisplay: "$5",
    category: "produce",
    squareCatalogId: null,
    squareVariationId: null,
  },
  {
    slug: "egyptian-spinach-5lb",
    name: "5 lb Egyptian Spinach",
    priceCents: 500,
    priceDisplay: "$5",
    category: "produce",
    squareCatalogId: null,
    squareVariationId: null,
  },
  {
    slug: "giant-fordhook-chard-5lb",
    name: "5 lb Giant Ford Hook Chard",
    priceCents: 500,
    priceDisplay: "$5",
    category: "produce",
    squareCatalogId: null,
    squareVariationId: null,
  },
  {
    slug: "kale-5lb",
    name: "5 lb Kale",
    priceCents: 500,
    priceDisplay: "$5",
    category: "produce",
    squareCatalogId: null,
    squareVariationId: null,
  },
  {
    slug: "malabar-spinach-5lb",
    name: "5 lb Malabar Spinach",
    priceCents: 500,
    priceDisplay: "$5",
    category: "produce",
    squareCatalogId: null,
    squareVariationId: null,
  },
  {
    slug: "okra-5lb",
    name: "5 lb Okra",
    priceCents: 500,
    priceDisplay: "$5",
    category: "produce",
    squareCatalogId: null,
    squareVariationId: null,
  },
  {
    slug: "onions-5lb",
    name: "5 lb Onions",
    priceCents: 500,
    priceDisplay: "$5",
    category: "produce",
    squareCatalogId: null,
    squareVariationId: null,
  },
];

// ── Derived lookups ──────────────────────────────────────────────────────────

/** O(1) lookup by slug. */
export function getCatalogItem(slug: string): CatalogProduct | undefined {
  return CATALOG.find((p) => p.slug === slug);
}

/** All box products (Starter, Family). */
export const CATALOG_BOXES: CatalogProduct[] = CATALOG.filter(
  (p) => p.category === "box"
);

/** All individual produce add-ons. */
export const CATALOG_PRODUCE: CatalogProduct[] = CATALOG.filter(
  (p) => p.category === "produce"
);

/**
 * Resolve the Square variation ID for a slug.
 * Returns the squareVariationId when synced, or null when not yet synced.
 * Callers must gate on null and fall back to slug-based display-only mode.
 */
export function getSquareVariationId(slug: string): string | null {
  return getCatalogItem(slug)?.squareVariationId ?? null;
}

/**
 * Return all catalog products with a valid Square variation ID.
 * Used by the sync script to skip items that are already synced.
 */
export function syncedProducts(): CatalogProduct[] {
  return CATALOG.filter(
    (p) => p.squareCatalogId !== null && p.squareVariationId !== null
  );
}

/**
 * Return all catalog products that need a Square sync.
 */
export function unsyncedProducts(): CatalogProduct[] {
  return CATALOG.filter(
    (p) => p.squareCatalogId === null || p.squareVariationId === null
  );
}
