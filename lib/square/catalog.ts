/**
 * Square Catalog API — server-side only (Node runtime).
 *
 * Uses the official Square Node SDK (SquareClient).
 * Reads credentials from env:
 *   SQUARE_ACCESS_TOKEN  — required for live calls
 *   SQUARE_ENVIRONMENT   — "sandbox" | "production" (default: "sandbox")
 *   SQUARE_LOCATION_ID   — not needed for catalog list; reserved for order creation
 *
 * Falls back gracefully to static BOX_FALLBACKS when env is absent or
 * any SDK call fails, so builds remain clean with no credentials.
 *
 * Task: UPAEC-T-272-01
 */

import { SquareClient, SquareEnvironment, SquareError } from "square";
import type { CatalogObject } from "square";
import {
  BOX_FALLBACKS,
  PRODUCT_CATALOG_FALLBACK,
} from "@/lib/site/constants";
import type { BoxItem, CatalogResult } from "./client";

// ── Types for the richer catalog output used by the browse UI ────────────────

export interface CatalogVariation {
  id: string;
  name: string;
  priceCents: number;
  priceDisplay: string;
  sku?: string;
}

export interface CatalogItemEntry {
  id: string;
  name: string;
  description?: string;
  category?: string;
  variations: CatalogVariation[];
  /** Primary variation price for display / sorting */
  priceCents: number;
  priceDisplay: string;
}

export interface FullCatalogResult {
  source: "square" | "fallback";
  /** Box products (Starter, Family…) */
  boxes: BoxItem[];
  /** Individual produce items / add-ons */
  items: CatalogItemEntry[];
  /** Raw catalog object count returned by Square (0 when fallback) */
  squareCount: number;
}

// ── SDK client factory ───────────────────────────────────────────────────────

function buildClient(): SquareClient | null {
  const token = process.env.SQUARE_ACCESS_TOKEN;
  if (!token) return null;

  const envStr = process.env.SQUARE_ENVIRONMENT ?? "sandbox";
  const environment =
    envStr === "production"
      ? SquareEnvironment.Production
      : SquareEnvironment.Sandbox;

  return new SquareClient({ token, environment });
}

// ── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Square Money amounts are bigint in the new SDK.
 * Convert to a number (cents) for JSON-safe storage.
 */
function bigintToCents(v: bigint | number | null | undefined): number {
  if (v == null) return 0;
  return typeof v === "bigint" ? Number(v) : v;
}

function centsToDisplay(cents: number): string {
  if (cents === 0) return "—";
  return `$${(cents / 100).toFixed(cents % 100 === 0 ? 0 : 2)}`;
}

/**
 * Identify box products by name keyword so we can split them from
 * per-item produce add-ons.
 */
const BOX_KEYWORDS = ["box", "bundle", "basket", "share", "csa"];

function isBoxProduct(name: string): boolean {
  const lower = name.toLowerCase();
  return BOX_KEYWORDS.some((kw) => lower.includes(kw));
}

// ── Fallback assembly ────────────────────────────────────────────────────────

function buildFallbackBoxes(): BoxItem[] {
  return [
    { ...BOX_FALLBACKS.starter, items: [...BOX_FALLBACKS.starter.items] },
    { ...BOX_FALLBACKS.family, items: [...BOX_FALLBACKS.family.items] },
  ];
}

function buildFallbackItems(): CatalogItemEntry[] {
  return PRODUCT_CATALOG_FALLBACK.map((p) => ({
    id: `fallback-${p.sku}`,
    name: p.name,
    variations: [
      {
        id: `fallback-${p.sku}-v1`,
        name: "Standard",
        priceCents: 500,
        priceDisplay: "$5/lb",
        sku: p.sku,
      },
    ],
    priceCents: 500,
    priceDisplay: "$5/lb",
    category: "Produce",
  }));
}

function buildFallbackResult(): FullCatalogResult {
  return {
    source: "fallback",
    boxes: buildFallbackBoxes(),
    items: buildFallbackItems(),
    squareCount: 0,
  };
}

// ── Type guard: narrow CatalogObject to ITEM_VARIATION subtype ───────────────

function isItemVariation(
  obj: CatalogObject
): obj is CatalogObject & { type: "ITEM_VARIATION"; itemVariationData?: import("square").CatalogItemVariation } {
  return obj.type === "ITEM_VARIATION";
}

// ── Live Square catalog pull ─────────────────────────────────────────────────

/**
 * Fetch the full product catalog from Square using the Node SDK.
 *
 * Auto-paginates via the SDK's Page async iterator. On any error
 * (network, auth, missing env) returns a fallback result so the build
 * and server render never crash.
 */
export async function fetchFullCatalog(): Promise<FullCatalogResult> {
  const client = buildClient();

  if (!client) {
    if (process.env.NODE_ENV !== "production") {
      console.info(
        "[7greens] SQUARE_ACCESS_TOKEN not set — using catalog fallback"
      );
    }
    return buildFallbackResult();
  }

  try {
    const boxes: BoxItem[] = [];
    const items: CatalogItemEntry[] = [];
    let squareCount = 0;

    // catalog.list() returns a Page<CatalogObject> that auto-paginates.
    const page = await client.catalog.list({ types: "ITEM" });

    for await (const obj of page) {
      squareCount++;

      // Only process ITEM type objects (the filter ensures this but TS doesn't narrow it)
      if (obj.type !== "ITEM" || !obj.itemData) continue;

      const itemData = obj.itemData;
      const name = itemData.name ?? "Unnamed";
      const description = itemData.description ?? undefined;
      const rawVars: CatalogObject[] = itemData.variations ?? [];

      const variations: CatalogVariation[] = rawVars
        .filter(isItemVariation)
        .map((v) => {
          const vd = v.itemVariationData;
          const priceCents = bigintToCents(vd?.priceMoney?.amount);
          return {
            id: v.id,
            name: vd?.name ?? "Default",
            priceCents,
            priceDisplay: centsToDisplay(priceCents),
            sku: vd?.sku ?? undefined,
          };
        });

      if (variations.length === 0) continue;

      const primary = variations[0];

      if (isBoxProduct(name)) {
        boxes.push({
          id: obj.id,
          name,
          priceCents: primary.priceCents,
          priceDisplay: primary.priceDisplay,
          portion: description?.match(/\d+\s*(?:oz|lb)/i)?.[0] ?? "",
          itemCount: variations.length,
          items: variations.map((v) => v.name),
        });
      } else {
        items.push({
          id: obj.id,
          name,
          description,
          variations,
          priceCents: primary.priceCents,
          priceDisplay: primary.priceDisplay,
        });
      }
    }

    // Supplement with fallbacks when Square returns an empty catalog
    const finalBoxes = boxes.length > 0 ? boxes : buildFallbackBoxes();
    const finalItems = items.length > 0 ? items : buildFallbackItems();

    return {
      source: "square",
      boxes: finalBoxes,
      items: finalItems,
      squareCount,
    };
  } catch (err) {
    const label =
      err instanceof SquareError
        ? `SquareError ${err.statusCode}`
        : String(err);
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        `[7greens] Square catalog fetch failed (${label}) — using fallback`
      );
    }
    return buildFallbackResult();
  }
}

// ── CatalogResult shim (used by lib/square/client.ts fetchCatalog) ───────────

/**
 * Converts the full catalog to the two-box CatalogResult shape consumed
 * by the existing /boxes page (app/boxes/page.tsx).
 */
export async function fetchCatalogCompat(): Promise<CatalogResult> {
  const full = await fetchFullCatalog();

  const starter: BoxItem =
    full.boxes.find((b) => b.name.toLowerCase().includes("starter")) ??
    full.boxes[0] ?? {
      ...BOX_FALLBACKS.starter,
      items: [...BOX_FALLBACKS.starter.items],
    };

  const family: BoxItem =
    full.boxes.find((b) => b.name.toLowerCase().includes("family")) ??
    full.boxes[1] ?? {
      ...BOX_FALLBACKS.family,
      items: [...BOX_FALLBACKS.family.items],
    };

  return { source: full.source, starter, family };
}
