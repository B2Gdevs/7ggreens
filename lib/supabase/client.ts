/**
 * Supabase server client — service-role access (bypasses RLS).
 *
 * Used exclusively in server-side code (route handlers, Server Actions).
 * NEVER import this in client components.
 *
 * Env vars:
 *   NEXT_PUBLIC_SUPABASE_URL       — project URL
 *   SUPABASE_SERVICE_ROLE_KEY      — service role secret (server-only)
 *
 * Graceful degradation: when either key is absent, `buildSupabaseClient()`
 * returns null. Callers must handle null gracefully (skip persistence, warn).
 *
 * Task: UPAEC-T-272-07
 */

import { createClient, SupabaseClient } from "@supabase/supabase-js";

export type { SupabaseClient };

/** Build a service-role Supabase client. Returns null when env vars are absent. */
export function buildSupabaseClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    return null;
  }

  return createClient(url, key, {
    auth: {
      // Service-role clients don't need session management.
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

/** Returns true when Supabase is configured (both URL + service key present). */
export function supabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}
