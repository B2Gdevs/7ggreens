"use client";

/**
 * /sso-callback — OAuth (Google) redirect landing.
 *
 * CustomSignIn's "Continue with Google" button redirects the browser to
 * `${origin}/sso-callback`. This page hands control back to headless Clerk via
 * <AuthenticateWithRedirectCallback/>, which completes the OAuth handshake and
 * forwards the user on (falling back to "/" for both sign-in and sign-up).
 *
 * Only meaningful when Clerk is configured (ClerkProvider mounted); when it
 * isn't we show a neutral splash rather than mounting a Clerk component that
 * would throw outside a provider.
 *
 * VCS cid: auth.sso-callback
 *
 * Task: GLOBAL-T-413-07
 */

import { AuthenticateWithRedirectCallback } from "@clerk/nextjs";
import { cid } from "@/lib/vcs/cid";

const CLERK_CONFIGURED = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

export default function SSOCallbackPage() {
  return (
    <div
      data-cid={cid("auth.sso-callback")}
      className="flex min-h-[60vh] flex-col items-center justify-center gap-5 px-[var(--section-px)] py-[var(--section-py)] text-center"
    >
      {CLERK_CONFIGURED && (
        <AuthenticateWithRedirectCallback
          signInFallbackRedirectUrl="/"
          signUpFallbackRedirectUrl="/"
        />
      )}
      <div
        className="h-9 w-9 animate-spin rounded-full border-2 border-[var(--color-border-strong)] border-t-[var(--color-sage-deep)]"
        aria-hidden="true"
      />
      <p className="font-display text-lg text-[var(--color-charcoal)]">
        Signing you in…
      </p>
      <p className="text-sm text-[var(--color-charcoal-muted)]">
        One moment while we finish connecting your account.
      </p>
    </div>
  );
}
