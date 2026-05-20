/**
 * /sign-in — Clerk sign-in page.
 *
 * Rendered only when NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is set.
 * When Clerk is absent, this page shows a friendly "Auth not configured" notice
 * so the build always succeeds.
 *
 * VCS cid: auth.sign-in
 *
 * Task: UPAEC-T-272-06
 */

import type { Metadata } from "next";
import { cid } from "@/lib/vcs/cid";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to your 7G Greens account to manage orders and subscriptions.",
};

const CLERK_CONFIGURED = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

// Conditionally import SignIn component
async function getSignInComponent() {
  if (!CLERK_CONFIGURED) return null;
  try {
    const { SignIn } = await import("@clerk/nextjs");
    return SignIn;
  } catch {
    return null;
  }
}

export default async function SignInPage() {
  const SignIn = await getSignInComponent();

  return (
    <div
      data-cid={cid("auth.sign-in")}
      className="flex min-h-[60vh] items-center justify-center px-[var(--section-px)] py-[var(--section-py)]"
    >
      {SignIn ? (
        <SignIn
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "shadow-none border border-[var(--color-border)] rounded-[28px] bg-[var(--color-cream)]",
              headerTitle: "font-display text-2xl text-[var(--color-charcoal)]",
              headerSubtitle: "text-[var(--color-charcoal-muted)]",
              formButtonPrimary:
                "bg-[var(--color-sage-deep)] hover:bg-[var(--color-sage)] text-[var(--color-cream)] rounded-xl",
              footerActionLink: "text-[var(--color-sage-deep)] hover:text-[var(--color-sage)]",
            },
          }}
        />
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
