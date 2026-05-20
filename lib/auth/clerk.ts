/**
 * Clerk auth helpers — server + client safe.
 *
 * Graceful degradation: when NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is absent,
 * `isClerkConfigured()` returns false and callers skip auth.
 *
 * Task: UPAEC-T-272-06
 */

/** Returns true when Clerk keys are present at runtime. */
export function isClerkConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);
}

/**
 * Build the Clerk user metadata that should be attached to a Square customer.
 * Returns null when Clerk is not configured.
 *
 * Used server-side in api/checkout to link Square customer → Clerk user.
 */
export interface ClerkLinkPayload {
  clerkUserId: string;
  clerkEmail: string | null;
}
