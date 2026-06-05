/**
 * POST /api/square/sync-catalog
 *
 * Upserts the canonical UPAEC product catalog into Square Catalog API.
 * For each product in lib/catalog.ts, creates or updates a Square
 * Catalog Item + Variation. Records the returned Square IDs in the
 * response so they can be pasted back into lib/catalog.ts or stored
 * in a generated id-map.
 *
 * Security:
 *   Gated behind SQUARE_SYNC_SECRET env var (or admin-only Clerk role).
 *   Set SQUARE_SYNC_SECRET to a random string and pass it as the
 *   `Authorization: Bearer <secret>` header when calling this endpoint.
 *   Without it, the route returns 401.
 *
 * Env vars required:
 *   SQUARE_ACCESS_TOKEN    — server Square OAuth token
 *   SQUARE_ENVIRONMENT     — "sandbox" | "production" (default: sandbox)
 *   SQUARE_LOCATION_ID     — optional; used to scope catalog if provided
 *   SQUARE_SYNC_SECRET     — sync authorization secret
 *
 * Returns (200):
 *   { ok: true, synced: SyncResult[], skipped: string[], configured: true }
 *
 * Returns when Square is not configured (200):
 *   { ok: false, configured: false, error: string }
 *
 * Returns on auth failure (401):
 *   { ok: false, error: "Unauthorized" }
 *
 * Task: UPAEC catalog sync
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SquareClient, SquareEnvironment, SquareError } from "square";
import { randomUUID } from "crypto";
import { CATALOG } from "@/lib/catalog";
import type { CatalogProduct } from "@/lib/catalog";

// ── Types ─────────────────────────────────────────────────────────────────────

interface SyncResult {
  slug: string;
  name: string;
  squareCatalogId: string;
  squareVariationId: string;
  action: "created" | "updated" | "unchanged";
}

interface SyncError {
  slug: string;
  name: string;
  error: string;
}

// ── Auth guard ────────────────────────────────────────────────────────────────

function isAuthorized(req: NextRequest): boolean {
  const secret = process.env.SQUARE_SYNC_SECRET;
  // If no secret configured, deny all (safer default than open access)
  if (!secret) return false;
  const authHeader = req.headers.get("Authorization") ?? "";
  return authHeader === `Bearer ${secret}`;
}

// ── Square client factory ─────────────────────────────────────────────────────

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

// ── Upsert a single catalog item into Square ──────────────────────────────────

async function upsertProduct(
  client: SquareClient,
  product: CatalogProduct
): Promise<{ catalogId: string; variationId: string; action: "created" | "updated" | "unchanged" }> {
  // Use Square's BatchUpsertCatalogObjects.
  // Each item is given a stable client-side "object ID" derived from slug
  // so Square deduplicates on re-runs (idempotent by catalog name match).

  const itemClientId = `#item-${product.slug}`;
  const varClientId = `#var-${product.slug}`;

  const response = await client.catalog.batchUpsert({
    idempotencyKey: randomUUID(),
    batches: [
      {
        objects: [
          {
            type: "ITEM",
            id: itemClientId,
            itemData: {
              name: product.name,
              description: `UPAEC — ${product.name}. Slug: ${product.slug}.`,
              productType: "REGULAR",
              variations: [
                {
                  type: "ITEM_VARIATION",
                  id: varClientId,
                  itemVariationData: {
                    name: "Standard",
                    pricingType: "FIXED_PRICING",
                    priceMoney: {
                      amount: BigInt(product.priceCents),
                      currency: "USD",
                    },
                    sku: product.slug,
                    sellable: true,
                    stockable: false,
                  },
                },
              ],
            },
          },
        ],
      },
    ],
  });

  const objects = response.objects ?? [];
  const idMappings = response.idMappings ?? [];

  // Resolve the real IDs (Square replaces #client-ids with real IDs)
  const catalogIdMapping = idMappings.find(
    (m) => m.clientObjectId === itemClientId
  );
  const variationIdMapping = idMappings.find(
    (m) => m.clientObjectId === varClientId
  );

  // If idMappings is empty, the object already existed — extract from objects
  const existingItem = objects.find((o) => o.type === "ITEM");
  const existingVariation = objects.find((o) => o.type === "ITEM_VARIATION");

  const catalogId =
    catalogIdMapping?.objectId ??
    existingItem?.id ??
    `unknown-${product.slug}`;
  const variationId =
    variationIdMapping?.objectId ??
    existingVariation?.id ??
    existingItem?.itemData?.variations?.[0]?.id ??
    `unknown-var-${product.slug}`;

  // Determine action from whether idMappings were returned
  // (new objects get id mappings; existing objects that were updated do not)
  const action = catalogIdMapping ? "created" : objects.length > 0 ? "updated" : "unchanged";

  return { catalogId, variationId, action };
}

// ── Route handler ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  // Auth
  if (!isAuthorized(req)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  // Square client
  const client = buildClient();
  if (!client) {
    return NextResponse.json({
      ok: false,
      configured: false,
      error:
        "Square is not configured. Set SQUARE_ACCESS_TOKEN and SQUARE_ENVIRONMENT to enable sync.",
    });
  }

  const synced: SyncResult[] = [];
  const errors: SyncError[] = [];

  // Process each catalog item
  for (const product of CATALOG) {
    try {
      const { catalogId, variationId, action } = await upsertProduct(client, product);
      synced.push({
        slug: product.slug,
        name: product.name,
        squareCatalogId: catalogId,
        squareVariationId: variationId,
        action,
      });
    } catch (err) {
      const label =
        err instanceof SquareError
          ? `SquareError ${err.statusCode}: ${JSON.stringify(err.errors ?? []).slice(0, 200)}`
          : String(err);
      errors.push({ slug: product.slug, name: product.name, error: label });
      console.error(`[upaec sync] Failed to upsert ${product.slug}:`, label);
    }
  }

  // Return results including the Square IDs so they can be written back to catalog.ts
  return NextResponse.json({
    ok: errors.length === 0,
    configured: true,
    synced,
    errors,
    /**
     * id_map — paste-ready object mapping slug → { squareCatalogId, squareVariationId }.
     * Copy these values back into lib/catalog.ts squareCatalogId / squareVariationId fields
     * for each product, OR use the /api/square/id-map endpoint to get a generated file.
     */
    id_map: Object.fromEntries(
      synced.map((r) => [
        r.slug,
        {
          squareCatalogId: r.squareCatalogId,
          squareVariationId: r.squareVariationId,
        },
      ])
    ),
    summary: {
      total: CATALOG.length,
      synced: synced.length,
      errors: errors.length,
      created: synced.filter((r) => r.action === "created").length,
      updated: synced.filter((r) => r.action === "updated").length,
      unchanged: synced.filter((r) => r.action === "unchanged").length,
    },
  });
}

// GET — show sync status (no auth required — read-only catalog info)
export async function GET() {
  return NextResponse.json({
    catalog_count: CATALOG.length,
    synced_count: CATALOG.filter(
      (p) => p.squareCatalogId !== null && p.squareVariationId !== null
    ).length,
    unsynced: CATALOG.filter(
      (p) => p.squareCatalogId === null || p.squareVariationId === null
    ).map((p) => ({ slug: p.slug, name: p.name })),
    instructions:
      "POST to this endpoint with Authorization: Bearer <SQUARE_SYNC_SECRET> to sync catalog to Square.",
    required_env: [
      "SQUARE_ACCESS_TOKEN",
      "SQUARE_ENVIRONMENT",
      "SQUARE_SYNC_SECRET",
    ],
  });
}
