/**
 * GET /api/health — Square + Supabase configuration health check.
 *
 * Returns a JSON report showing which Square and Supabase env vars are set,
 * whether Square is in sandbox vs production mode, and whether the catalog
 * has been synced. Does NOT make any external API calls — reads only from
 * process.env and the static catalog.
 *
 * No authentication required. Do NOT expose payment secrets or tokens in
 * the response — only report whether each var is set (boolean), never the value.
 *
 * Response shape:
 * {
 *   square: {
 *     serverConfigured: boolean,    // SQUARE_ACCESS_TOKEN set
 *     environment: "sandbox"|"production",
 *     appId: { set: boolean, source: string|null },
 *     locationId: { set: boolean, source: string|null },
 *     webhookKeySet: boolean,
 *     syncSecretSet: boolean,
 *   },
 *   supabase: {
 *     configured: boolean,
 *     urlSet: boolean,
 *     serviceRoleKeySet: boolean,
 *     anonKeySet: boolean,
 *   },
 *   catalog: {
 *     total: number,
 *     synced: number,
 *     unsynced: number,
 *     syncStatus: "fully-synced" | "partial" | "not-synced",
 *   },
 *   summary: string[],  // human-readable status lines
 * }
 *
 * Task: UPAEC config health (operator diagnostics)
 */

import { NextResponse } from "next/server";
import { squareConfigHealth } from "@/lib/square/config";
import { CATALOG, syncedProducts, unsyncedProducts } from "@/lib/catalog";

export async function GET() {
  const health = squareConfigHealth();

  // Supabase
  const urlSet = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL?.trim());
  const serviceRoleKeySet = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY?.trim());
  const anonKeySet = Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim());
  const supabaseConfigured = urlSet && serviceRoleKeySet;

  // Catalog sync state
  const synced = syncedProducts();
  const unsynced = unsyncedProducts();
  const catalogTotal = CATALOG.length;
  const catalogSyncStatus =
    unsynced.length === 0
      ? "fully-synced"
      : synced.length === 0
      ? "not-synced"
      : "partial";

  // Build summary lines
  const summary: string[] = [...health.summary];

  if (!supabaseConfigured) {
    summary.push("MISSING: Supabase not configured — order persistence and /orders page broken");
  } else {
    summary.push("OK: Supabase configured");
  }

  if (catalogSyncStatus === "not-synced") {
    summary.push(
      `CATALOG: 0/${catalogTotal} items synced — run POST /api/square/sync-catalog to populate Square IDs`
    );
  } else if (catalogSyncStatus === "partial") {
    summary.push(
      `CATALOG: ${synced.length}/${catalogTotal} items synced — run POST /api/square/sync-catalog to sync remaining`
    );
  } else {
    summary.push(`CATALOG: all ${catalogTotal} items synced`);
  }

  return NextResponse.json(
    {
      square: {
        serverConfigured: health.serverConfigured,
        environment: health.environment,
        appId: {
          set: health.client.configured,
          source: health.client.appIdSource,
        },
        locationId: {
          set: Boolean(health.client.locationId),
          source: health.client.locationIdSource,
        },
        webhookKeySet: health.webhookKeySet,
        syncSecretSet: health.syncSecretSet,
      },
      supabase: {
        configured: supabaseConfigured,
        urlSet,
        serviceRoleKeySet,
        anonKeySet,
      },
      catalog: {
        total: catalogTotal,
        synced: synced.length,
        unsynced: unsynced.length,
        syncStatus: catalogSyncStatus,
        unsyncedSlugs: unsynced.map((p) => p.slug),
      },
      summary,
    },
    { status: 200 }
  );
}
