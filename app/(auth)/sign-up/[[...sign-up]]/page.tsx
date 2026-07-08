/**
 * /sign-up — sign-up page.
 *
 * Uses our shared custom sign-in form in signup mode (@gad/auth-surface) driven
 * by headless Clerk (@clerk/nextjs) — NO Clerk <SignUp> drop-in. Themed to the
 * 7G Greens green brand via the `.auth-7g-theme` wrapper.
 *
 * Rendered only when NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is set. When Clerk is
 * absent, this page shows a friendly "Auth not configured" notice.
 *
 * VCS cids: auth.sign-up (root) · auth.sign-up.form (custom form)
 *
 * Task: GLOBAL-T-413-07
 */

import type { Metadata } from "next";
import { CustomSignIn } from "@gad/auth-surface/custom-signin-next";
import { cid } from "@/lib/vcs/cid";

export const metadata: Metadata = {
  title: "Create Account",
  description: "Create your 7G Greens account to track orders and manage your box subscription.",
};

const CLERK_CONFIGURED = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

export default function SignUpPage() {
  return (
    <div
      data-cid={cid("auth.sign-up")}
      className="flex min-h-[60vh] items-center justify-center px-[var(--section-px)] py-[var(--section-py)]"
    >
      {CLERK_CONFIGURED ? (
        <div
          data-cid={cid("auth.sign-up.form")}
          className="auth-7g-theme mx-auto w-full max-w-sm"
        >
          <CustomSignIn mode="signup" cidPrefix="7g.auth.sign-up" />
        </div>
      ) : (
        <div className="mx-auto max-w-sm rounded-[28px] border border-[var(--color-border)] bg-[var(--color-cream)] p-10 text-center">
          <p className="font-display text-xl text-[var(--color-charcoal)]">
            Account creation unavailable
          </p>
          <p className="mt-3 text-sm text-[var(--color-charcoal-muted)]">
            Customer accounts are not configured yet. You can still browse and order without an account.
          </p>
        </div>
      )}
    </div>
  );
}
