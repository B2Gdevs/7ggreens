/**
 * Square client-side configuration resolver — server-only.
 *
 * Resolves the Square Application ID and Location ID for the Web Payments
 * SDK, accepting EITHER the NEXT_PUBLIC_* prefix form (correct Vercel name)
 * OR the bare SQUARE_* form (the wrong name found in the Vercel dashboard as
 * of 2026-06-02). This makes checkout robust to whichever name is set.
 *
 * Resolution order (first non-empty wins):
 *   appId:       NEXT_PUBLIC_SQUARE_APPLICATION_ID → SQUARE_APPLICATION_ID
 *   locationId:  NEXT_PUBLIC_SQUARE_LOCATION_ID    → SQUARE_LOCATION_ID
 *   environment: NEXT_PUBLIC_SQUARE_ENVIRONMENT    → SQUARE_ENVIRONMENT (→ "sandbox")
 *
 * Usage: call resolveSquareClientConfig() inside a server component or
 * route handler, then pass the result as props to the client checkout form.
 * This avoids requiring NEXT_PUBLIC_ vars while still working correctly when
 * they ARE set.
 *
 * Task: UPAEC checkout env-var resilience
 */

export type SquareClientEnv = "sandbox" | "production";

export interface SquareClientConfig {
  /** Square Application ID for the Web Payments SDK */
  appId: string;
  /** Square Location ID for the Web Payments SDK */
  locationId: string;
  /** "sandbox" | "production" — controls which Square CDN script URL loads */
  environment: SquareClientEnv;
  /** True when appId is present (non-empty) */
  configured: boolean;
  /** Which env var name provided the appId — useful for health reporting */
  appIdSource: string | null;
  /** Which env var name provided the locationId */
  locationIdSource: string | null;
}

/**
 * Resolve Square Web Payments SDK configuration from environment variables.
 *
 * Must be called server-side only (reads process.env).
 * Returns a config object safe to pass as props to a "use client" component.
 */
export function resolveSquareClientConfig(): SquareClientConfig {
  // Application ID — try NEXT_PUBLIC_ first, then bare SQUARE_ variant
  const appId =
    process.env.NEXT_PUBLIC_SQUARE_APPLICATION_ID?.trim() ||
    process.env.SQUARE_APPLICATION_ID?.trim() ||
    "";

  const appIdSource = process.env.NEXT_PUBLIC_SQUARE_APPLICATION_ID?.trim()
    ? "NEXT_PUBLIC_SQUARE_APPLICATION_ID"
    : process.env.SQUARE_APPLICATION_ID?.trim()
    ? "SQUARE_APPLICATION_ID"
    : null;

  // Location ID — try NEXT_PUBLIC_ first, then bare SQUARE_ variant
  const locationId =
    process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID?.trim() ||
    process.env.SQUARE_LOCATION_ID?.trim() ||
    "";

  const locationIdSource = process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID?.trim()
    ? "NEXT_PUBLIC_SQUARE_LOCATION_ID"
    : process.env.SQUARE_LOCATION_ID?.trim()
    ? "SQUARE_LOCATION_ID"
    : null;

  // Environment — try NEXT_PUBLIC_ first, then bare SQUARE_ variant
  const rawEnv =
    process.env.NEXT_PUBLIC_SQUARE_ENVIRONMENT?.trim() ||
    process.env.SQUARE_ENVIRONMENT?.trim() ||
    "sandbox";

  const environment: SquareClientEnv =
    rawEnv === "production" ? "production" : "sandbox";

  return {
    appId,
    locationId,
    environment,
    configured: Boolean(appId),
    appIdSource,
    locationIdSource,
  };
}

/**
 * Config health report — for /api/health and operator diagnostics.
 * Returns a human-readable summary of which Square env vars are set.
 */
export function squareConfigHealth(): {
  client: SquareClientConfig;
  serverConfigured: boolean;
  locationIdServerSet: boolean;
  webhookKeySet: boolean;
  syncSecretSet: boolean;
  environment: SquareClientEnv;
  summary: string[];
} {
  const client = resolveSquareClientConfig();
  const serverConfigured = Boolean(process.env.SQUARE_ACCESS_TOKEN?.trim());
  const locationIdServerSet = Boolean(
    process.env.SQUARE_LOCATION_ID?.trim() ||
      process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID?.trim()
  );
  const webhookKeySet = Boolean(process.env.SQUARE_WEBHOOK_SIGNATURE_KEY?.trim());
  const syncSecretSet = Boolean(process.env.SQUARE_SYNC_SECRET?.trim());

  const rawEnv =
    process.env.NEXT_PUBLIC_SQUARE_ENVIRONMENT?.trim() ||
    process.env.SQUARE_ENVIRONMENT?.trim() ||
    "sandbox";
  const environment: SquareClientEnv =
    rawEnv === "production" ? "production" : "sandbox";

  const summary: string[] = [];

  if (!serverConfigured) summary.push("MISSING: SQUARE_ACCESS_TOKEN (server payments broken)");
  else summary.push(`OK: SQUARE_ACCESS_TOKEN set (${environment} mode)`);

  if (!client.configured) {
    summary.push(
      "MISSING: Application ID — set NEXT_PUBLIC_SQUARE_APPLICATION_ID or SQUARE_APPLICATION_ID (checkout broken)"
    );
  } else {
    summary.push(`OK: appId resolved from ${client.appIdSource}`);
  }

  if (!client.locationId) {
    summary.push(
      "MISSING: Location ID — set NEXT_PUBLIC_SQUARE_LOCATION_ID or SQUARE_LOCATION_ID (subscriptions may fail)"
    );
  } else {
    summary.push(`OK: locationId resolved from ${client.locationIdSource}`);
  }

  if (!webhookKeySet) summary.push("MISSING: SQUARE_WEBHOOK_SIGNATURE_KEY (webhook validation disabled)");
  else summary.push("OK: SQUARE_WEBHOOK_SIGNATURE_KEY set");

  if (!syncSecretSet) summary.push("MISSING: SQUARE_SYNC_SECRET (catalog sync locked out)");
  else summary.push("OK: SQUARE_SYNC_SECRET set");

  summary.push(`Environment: ${environment}`);

  return {
    client,
    serverConfigured,
    locationIdServerSet,
    webhookKeySet,
    syncSecretSet,
    environment,
    summary,
  };
}
