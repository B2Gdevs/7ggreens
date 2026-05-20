"use client";

/**
 * UserButton — shows Clerk UserButton when configured, else nothing.
 *
 * Graceful degradation: when NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is absent,
 * this renders null. The store still works without auth.
 *
 * When Clerk IS configured:
 *   - Signed-out: shows a "Sign in" link
 *   - Signed-in: shows the Clerk UserButton avatar/dropdown
 *
 * VCS cid: site.header.user-button
 *
 * Task: UPAEC-T-272-06
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { User } from "lucide-react";
import { cid } from "@/lib/vcs/cid";

// Only attempt to import Clerk when the publishable key is present
const CLERK_CONFIGURED = Boolean(
  typeof process !== "undefined" &&
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
);

// Module-level cache of Clerk components (populated once on first mount)
type ClerkComponents = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  UserButton: React.ComponentType<any>;
  useUser: () => { isSignedIn?: boolean; isLoaded?: boolean };
} | null;

let clerkCache: ClerkComponents = null;

function loadClerk(): ClerkComponents {
  if (!CLERK_CONFIGURED) return null;
  if (clerkCache) return clerkCache;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const clerk = require("@clerk/nextjs");
    clerkCache = { UserButton: clerk.UserButton, useUser: clerk.useUser };
    return clerkCache;
  } catch {
    return null;
  }
}

function SignedOutButton() {
  return (
    <Link
      href="/sign-in"
      data-cid={cid("site.header.user-button")}
      className="hidden md:inline-flex items-center gap-1.5 rounded-full border border-[var(--color-border-strong)] bg-[var(--color-cream)]/60 px-3.5 py-2 text-sm font-medium hover:bg-[var(--color-cream-soft)] transition-colors"
      aria-label="Sign in to your account"
    >
      <User size={14} strokeWidth={1.6} aria-hidden="true" />
      <span>Sign in</span>
    </Link>
  );
}

function ClerkAwareButton({ components }: { components: NonNullable<ClerkComponents> }) {
  const { isSignedIn, isLoaded } = components.useUser();

  if (!isLoaded) return null;

  if (!isSignedIn) {
    return <SignedOutButton />;
  }

  const CUserButton = components.UserButton;
  return (
    <div
      data-cid={cid("site.header.user-button")}
      className="hidden md:flex items-center"
    >
      <CUserButton afterSignOutUrl="/" />
    </div>
  );
}

export function UserButton() {
  const [mounted, setMounted] = useState(false);
  const [clerk, setClerk] = useState<ClerkComponents>(null);

  useEffect(() => {
    setMounted(true);
    setClerk(loadClerk());
  }, []);

  // Not mounted yet — avoid hydration mismatch
  if (!mounted) return null;

  // Clerk not configured — render nothing
  if (!CLERK_CONFIGURED || !clerk) {
    return null;
  }

  return <ClerkAwareButton components={clerk} />;
}
