"use client";

/**
 * UserButton — header auth control. Shows our shared custom user menu when
 * Clerk is configured + the visitor is signed in, a "Sign in" link when signed
 * out, and nothing at all when Clerk is not configured.
 *
 * Uses @gad/auth-surface <CustomUserMenu/> (headless @clerk/nextjs) — NO Clerk
 * <UserButton/> drop-in. Themed to the 7G Greens green brand via `.auth-7g-theme`.
 * The old dynamic/require() indirection existed only to lazy-load Clerk's UI
 * component; CustomUserMenu is a normal client import, so it's gone.
 *
 * Graceful degradation: when NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is absent,
 * ClerkProvider is not mounted (see ClerkProviderWrapper) and this renders null.
 * The store still works without auth.
 *
 * VCS cid: site.header.user-button
 *
 * Task: GLOBAL-T-413-07
 */

import Link from "next/link";
import { User } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { CustomUserMenu } from "@gad/auth-surface/custom-user-menu-next";
import { cid } from "@/lib/vcs/cid";

const CLERK_CONFIGURED = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

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

/** Renders only when ClerkProvider is mounted (CLERK_CONFIGURED). Reads the
 *  Clerk session and shows the custom menu (signed in) or the sign-in link. */
function ClerkAwareButton() {
  const { isSignedIn, isLoaded } = useUser();

  // Avoid a hydration flash before Clerk resolves the session.
  if (!isLoaded) return null;

  if (!isSignedIn) {
    return <SignedOutButton />;
  }

  return (
    <div
      data-cid={cid("site.header.user-button")}
      className="auth-7g-theme hidden md:flex items-center"
    >
      <CustomUserMenu afterSignOutUrl="/" cidPrefix="7g.user-menu" />
    </div>
  );
}

export function UserButton() {
  // Clerk not configured — render nothing (hooks below never run).
  if (!CLERK_CONFIGURED) return null;

  return <ClerkAwareButton />;
}
