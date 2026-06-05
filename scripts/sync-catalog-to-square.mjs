#!/usr/bin/env node
/**
 * scripts/sync-catalog-to-square.mjs
 *
 * Syncs the UPAEC canonical catalog (lib/catalog.ts) to the Square Catalog API.
 * After running, prints a patch block that you paste into lib/catalog.ts to
 * record the Square IDs.
 *
 * Usage:
 *   # Option A — call the deployed route (simplest; no local deps needed):
 *   SQUARE_SYNC_SECRET=<secret> SITE_URL=https://7ggreens.vercel.app \
 *     node scripts/sync-catalog-to-square.mjs
 *
 *   # Option B — call a local dev server:
 *   SQUARE_SYNC_SECRET=<secret> SITE_URL=http://localhost:3000 \
 *     node scripts/sync-catalog-to-square.mjs
 *
 *   # Option C — run Square API calls directly (bypasses the HTTP route):
 *   SQUARE_ACCESS_TOKEN=<token> SQUARE_ENVIRONMENT=production \
 *     node scripts/sync-catalog-to-square.mjs --direct
 *
 * Required env vars:
 *   SQUARE_SYNC_SECRET  — Authorization bearer secret for the /api/square/sync-catalog route
 *   SITE_URL            — Base URL of the deployed or local app (no trailing slash)
 *
 *   For --direct mode:
 *   SQUARE_ACCESS_TOKEN — Square API token
 *   SQUARE_ENVIRONMENT  — "sandbox" | "production" (default: sandbox)
 *
 * Output:
 *   Prints the sync results and a paste-ready update block for lib/catalog.ts.
 *
 * IMPORTANT: After running, paste the squareCatalogId / squareVariationId values
 * into lib/catalog.ts and redeploy so checkout uses real Square variation IDs.
 */

import { createHmac } from "crypto";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

// ── Mode: HTTP route (default) or direct Square API ──────────────────────────

const DIRECT_MODE = process.argv.includes("--direct");

// ── Option A/B: Call the deployed HTTP route ──────────────────────────────────

async function syncViaHttpRoute() {
  const secret = process.env.SQUARE_SYNC_SECRET;
  const siteUrl = (process.env.SITE_URL ?? "").replace(/\/$/, "");

  if (!secret) {
    console.error("ERROR: SQUARE_SYNC_SECRET env var required");
    console.error("  Set it to the value of SQUARE_SYNC_SECRET in your Vercel project.");
    process.exit(1);
  }
  if (!siteUrl) {
    console.error("ERROR: SITE_URL env var required (e.g. https://7ggreens.vercel.app)");
    process.exit(1);
  }

  const url = `${siteUrl}/api/square/sync-catalog`;
  console.log(`\nCalling POST ${url} …\n`);

  let res;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${secret}`,
      },
    });
  } catch (err) {
    console.error("ERROR: Fetch failed:", err.message);
    process.exit(1);
  }

  if (!res.ok) {
    const text = await res.text();
    console.error(`ERROR: HTTP ${res.status} — ${text.slice(0, 400)}`);
    process.exit(1);
  }

  const data = await res.json();
  printSyncResults(data);
}

// ── Option C: Direct Square API calls ────────────────────────────────────────

async function syncDirectToSquare() {
  const token = process.env.SQUARE_ACCESS_TOKEN;
  const env = process.env.SQUARE_ENVIRONMENT ?? "sandbox";

  if (!token) {
    console.error("ERROR: SQUARE_ACCESS_TOKEN env var required for --direct mode");
    process.exit(1);
  }

  const baseUrl =
    env === "production"
      ? "https://connect.squareup.com"
      : "https://connect.squareupsandbox.com";

  console.log(`\nDirect Square API sync (${env}) via ${baseUrl} …\n`);

  // Dynamically import catalog (TS → we need the compiled JS or to use the JSON values)
  // Since this is an .mjs script running outside Next.js, we read catalog.ts as text
  // and extract the CATALOG array with a regex. This avoids needing a full TS compile.
  const catalogSrc = readFileSync(resolve(ROOT, "lib/catalog.ts"), "utf8");
  const products = parseCatalogFromSource(catalogSrc);

  if (!products || products.length === 0) {
    console.error("ERROR: Could not parse CATALOG from lib/catalog.ts");
    process.exit(1);
  }

  console.log(`Found ${products.length} products in lib/catalog.ts\n`);

  const synced = [];
  const errors = [];

  for (const product of products) {
    try {
      const result = await upsertProductDirect(baseUrl, token, product);
      synced.push({ slug: product.slug, name: product.name, ...result, action: "created" });
      process.stdout.write(`  ✓ ${product.slug}: catalogId=${result.catalogId.slice(0, 12)}… varId=${result.variationId.slice(0, 12)}…\n`);
    } catch (err) {
      errors.push({ slug: product.slug, name: product.name, error: err.message });
      process.stdout.write(`  ✗ ${product.slug}: ${err.message.slice(0, 80)}\n`);
    }
  }

  printSyncResults({
    ok: errors.length === 0,
    configured: true,
    synced,
    errors,
    id_map: Object.fromEntries(
      synced.map((r) => [r.slug, { squareCatalogId: r.catalogId, squareVariationId: r.variationId }])
    ),
    summary: {
      total: products.length,
      synced: synced.length,
      errors: errors.length,
      created: synced.length,
      updated: 0,
      unchanged: 0,
    },
  });
}

// ── Direct Square API: upsert one product ────────────────────────────────────

async function upsertProductDirect(baseUrl, token, product) {
  const idempotencyKey = `7ggreens-sync-${product.slug}-${Date.now()}`;
  const itemClientId = `#item-${product.slug}`;
  const varClientId = `#var-${product.slug}`;

  const body = {
    idempotency_key: idempotencyKey,
    batches: [
      {
        objects: [
          {
            type: "ITEM",
            id: itemClientId,
            item_data: {
              name: product.name,
              description: `UPAEC — ${product.name}. Slug: ${product.slug}.`,
              product_type: "REGULAR",
              variations: [
                {
                  type: "ITEM_VARIATION",
                  id: varClientId,
                  item_variation_data: {
                    name: "Standard",
                    pricing_type: "FIXED_PRICING",
                    price_money: {
                      amount: product.priceCents,
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
  };

  const res = await fetch(`${baseUrl}/v2/catalog/batch-upsert`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Square-Version": "2024-12-18",
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(body),
  });

  const text = await res.text();
  if (!res.ok) {
    throw new Error(`Square ${res.status}: ${text.slice(0, 300)}`);
  }

  const data = JSON.parse(text);
  const idMappings = data.id_mappings ?? [];
  const objects = data.objects ?? [];

  const catalogIdMapping = idMappings.find((m) => m.client_object_id === itemClientId);
  const variationIdMapping = idMappings.find((m) => m.client_object_id === varClientId);

  const existingItem = objects.find((o) => o.type === "ITEM");
  const existingVariation = objects.find((o) => o.type === "ITEM_VARIATION");

  const catalogId =
    catalogIdMapping?.object_id ??
    existingItem?.id ??
    `unknown-${product.slug}`;
  const variationId =
    variationIdMapping?.object_id ??
    existingVariation?.id ??
    existingItem?.item_data?.variations?.[0]?.id ??
    `unknown-var-${product.slug}`;

  return { catalogId, variationId };
}

// ── Catalog parser: extract products from lib/catalog.ts source ───────────────
// Minimal regex-based parser — handles the specific format of the catalog file.

function parseCatalogFromSource(src) {
  const products = [];
  // Match each object literal inside CATALOG: CatalogProduct[] = [...]
  const slugRe = /slug:\s*"([^"]+)"/g;
  const nameRe = /name:\s*"([^"]+)"/g;
  const priceRe = /priceCents:\s*(\d+)/g;

  // Extract all values in order — they align because CATALOG is a flat array
  const slugs = [...src.matchAll(/slug:\s*"([^"]+)"/g)].map((m) => m[1]);
  const names = [...src.matchAll(/(?<!\w)name:\s*"([^"]+)"/g)].map((m) => m[1]);
  const prices = [...src.matchAll(/priceCents:\s*(\d+)/g)].map((m) => parseInt(m[1], 10));

  // Align by index
  const count = Math.min(slugs.length, names.length, prices.length);
  for (let i = 0; i < count; i++) {
    products.push({ slug: slugs[i], name: names[i], priceCents: prices[i] });
  }
  return products;
}

// ── Print sync results + catalog.ts patch ────────────────────────────────────

function printSyncResults(data) {
  console.log("\n── SYNC RESULTS ──────────────────────────────────────\n");

  if (!data.configured) {
    console.error("Square is not configured — set SQUARE_ACCESS_TOKEN and SQUARE_ENVIRONMENT.");
    process.exit(1);
  }

  if (data.synced && data.synced.length > 0) {
    console.log("Synced:");
    for (const r of data.synced) {
      console.log(`  ${r.slug}: catalogId=${r.squareCatalogId ?? r.catalogId} varId=${r.squareVariationId ?? r.variationId} [${r.action}]`);
    }
  }

  if (data.errors && data.errors.length > 0) {
    console.log("\nErrors:");
    for (const e of data.errors) {
      console.log(`  ${e.slug}: ${e.error}`);
    }
  }

  if (data.summary) {
    const s = data.summary;
    console.log(`\nSummary: ${s.synced}/${s.total} synced, ${s.errors} errors, ${s.created} created, ${s.updated} updated, ${s.unchanged} unchanged`);
  }

  // Generate paste-ready catalog.ts patch
  if (data.id_map && Object.keys(data.id_map).length > 0) {
    console.log("\n── PASTE INTO lib/catalog.ts ────────────────────────\n");
    console.log("// Replace squareCatalogId and squareVariationId nulls for each product:\n");
    for (const [slug, ids] of Object.entries(data.id_map)) {
      const cid = ids.squareCatalogId;
      const vid = ids.squareVariationId;
      if (cid && vid && !cid.startsWith("unknown") && !vid.startsWith("unknown")) {
        console.log(`// ${slug}`);
        console.log(`squareCatalogId: "${cid}",`);
        console.log(`squareVariationId: "${vid}",`);
        console.log();
      }
    }
    console.log("// Alternatively, use the full id_map JSON below and update programmatically:");
    console.log(JSON.stringify(data.id_map, null, 2));
  }

  if (!data.ok) {
    process.exit(1);
  }
}

// ── Main ─────────────────────────────────────────────────────────────────────

if (DIRECT_MODE) {
  await syncDirectToSquare();
} else {
  await syncViaHttpRoute();
}
