"use client";

/**
 * ClerkProviderWrapper — conditionally wraps children with Clerk's provider.
 *
 * Graceful degradation:
 *   - NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY absent → renders children directly, no Clerk
 *   - Clerk package present + key set → wraps with ClerkProvider
 *
 * This keeps the root layout clean while allowing opt-in auth.
 *
 * Task: UPAEC-T-272-06
 */

import { type ReactNode } from "react";

const CLERK_KEY = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

// Lazily import Clerk to avoid module-level error when keys are absent.
// We use a module-level side-effect-free conditional.
let ClerkProvider: React.ComponentType<{ publishableKey: string; children: ReactNode }> | null = null;

if (CLERK_KEY) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    ClerkProvider = require("@clerk/nextjs").ClerkProvider;
  } catch {
    // Clerk not available — degrade gracefully
  }
}

interface Props {
  children: ReactNode;
}

export function ClerkProviderWrapper({ children }: Props) {
  if (!CLERK_KEY || !ClerkProvider) {
    // No Clerk config — pass through
    return <>{children}</>;
  }

  return (
    <ClerkProvider publishableKey={CLERK_KEY}>
      {children}
    </ClerkProvider>
  );
}
