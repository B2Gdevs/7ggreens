/**
 * /sign-in — sign-in page.
 *
 * Uses our shared, fully-custom sign-in form (@gad/auth-surface) driven by
 * headless Clerk (@clerk/nextjs useSignIn/useSignUp) — NO Clerk <SignIn> drop-in,
 * no "Secured by Clerk" chrome. Themed to the 7G Greens green brand via the
 * `.auth-7g-theme` wrapper (maps --auth-* vars in globals.css).
 *
 * Rendered only when NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is set (ClerkProvider is
 * mounted by ClerkProviderWrapper). When Clerk is absent, this page shows a
 * friendly "Auth not configured" notice so the build always succeeds.
 *
 * VCS cids: auth.sign-in (root) · auth.sign-in.form (custom form)
 *
 * Task: GLOBAL-T-413-07
 */

import type { Metadata } from "next";
import { CustomSignIn } from "@gad/auth-surface/custom-signin-next";
import { cid } from "@/lib/vcs/cid";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to your 7G Greens account to manage orders and subscriptions.",
};

const CLERK_CONFIGURED = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

export default function SignInPage() {
  return (
    <div
      data-cid={cid("auth.sign-in")}
      className="flex min-h-[60vh] items-center justify-center px-[var(--section-px)] py-[var(--section-py)]"
    >
      {CLERK_CONFIGURED ? (
        <div
          data-cid={cid("auth.sign-in.form")}
          className="auth-7g-theme mx-auto w-full max-w-sm"
        >
          <CustomSignIn cidPrefix="7g.auth.sign-in" />
        </div>
      ) : (
        <div className="mx-auto max-w-sm rounded-[28px] border border-[var(--color-border)] bg-[var(--color-cream)] p-10 text-center">
          <p className="font-display text-xl text-[var(--color-charcoal)]">
            Sign-in unavailable
          </p>
          <p className="mt-3 text-sm text-[var(--color-charcoal-muted)]">
            Customer authentication is not configured yet. You can still browse and order — no account required.
          </p>
        </div>
      )}
    </div>
  );
}
