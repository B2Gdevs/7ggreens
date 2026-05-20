/**
 * /account — customer account page (Clerk-gated).
 *
 * Shows the signed-in customer's profile via Clerk <UserProfile />.
 * Links to /orders for order history.
 *
 * Graceful degradation:
 *   - Clerk not configured → friendly notice with store link.
 *   - Middleware redirects unauthenticated users to /sign-in before
 *     this page ever renders (when Clerk IS configured).
 *
 * VCS cids:
 *   account.page            — page root
 *   account.page.profile    — Clerk UserProfile embed
 *   account.page.orders-link — link to /orders
 *
 * Design: Heritage Modern — matches site palette (cream/charcoal/sage).
 *
 * Task: UPAEC-T-272-12
 */

import type { Metadata } from "next";
import Link from "next/link";
import { User, PackageOpen, LogIn } from "lucide-react";
import { cid } from "@/lib/vcs/cid";

export const metadata: Metadata = {
  title: "My Account",
  description: "Manage your 7G Greens account, profile, and order history.",
};

// Force dynamic so Clerk session is available at request time (no SSG prerender)
export const dynamic = "force-dynamic";

const CLERK_CONFIGURED = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

async function getUserProfileComponent() {
  if (!CLERK_CONFIGURED) return null;
  try {
    const { UserProfile } = await import("@clerk/nextjs");
    return UserProfile;
  } catch {
    return null;
  }
}

export default async function AccountPage() {
  const UserProfile = await getUserProfileComponent();

  // Clerk not configured — graceful prompt
  if (!UserProfile) {
    return (
      <div
        data-cid={cid("account.page")}
        className="grain-overlay mx-auto max-w-[var(--content-max)] px-[var(--section-px)] py-[var(--section-py)]"
      >
        <div className="mx-auto max-w-md text-center">
          <div
            className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full"
            style={{ background: "var(--color-cream-soft)", border: "1px solid var(--color-border-strong)" }}
          >
            <User size={28} className="text-[var(--color-charcoal-muted)]" aria-hidden />
          </div>
          <p className="eyebrow">Customer accounts</p>
          <h1
            className="font-display mt-4 leading-tight text-[var(--color-charcoal)]"
            style={{ fontSize: "var(--text-display-sm)" }}
          >
            Account not available
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-[var(--color-charcoal-soft)]">
            Customer authentication is not configured yet.
            You can still browse and order without an account — no sign-in required.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link href="/store" className="btn-primary">
              <PackageOpen size={15} aria-hidden />
              Browse the store
            </Link>
            <Link href="/" className="btn-secondary">
              Back home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Clerk configured — middleware already verified session.
  // UserProfile handles the rest.
  return (
    <div
      data-cid={cid("account.page")}
      className="grain-overlay mx-auto max-w-[var(--content-max)] px-[var(--section-px)] py-[var(--section-py)]"
    >
      {/* Page header */}
      <div className="mb-10">
        <p className="eyebrow">Your account</p>
        <h1
          className="font-display mt-3 leading-tight text-[var(--color-charcoal)]"
          style={{ fontSize: "var(--text-display-sm)", textWrap: "balance" } as React.CSSProperties}
        >
          Profile &amp; settings
        </h1>
      </div>

      {/* Quick link to orders */}
      <div
        data-cid={cid("account.page.orders-link")}
        className="mb-10 flex items-center gap-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-cream-soft)] px-6 py-5"
      >
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
          style={{ background: "var(--color-sage-deep)" }}
        >
          <PackageOpen size={18} className="text-[var(--color-cream)]" aria-hidden />
        </div>
        <div className="flex-1">
          <p className="font-medium text-[var(--color-charcoal)]">Order history</p>
          <p className="mt-0.5 text-sm text-[var(--color-charcoal-muted)]">
            View and track your past 7G Greens orders.
          </p>
        </div>
        <Link
          href="/orders"
          className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--color-border-strong)] px-4 py-2.5 text-sm font-medium text-[var(--color-charcoal-soft)] hover:bg-[var(--color-cream)] transition-colors"
          data-cid={cid("account.page.orders-link.cta")}
        >
          View orders
        </Link>
      </div>

      {/* Clerk UserProfile embed */}
      <div data-cid={cid("account.page.profile")}>
        <UserProfile
          appearance={{
            elements: {
              rootBox: "w-full",
              card: [
                "shadow-none",
                "border border-[var(--color-border)]",
                "rounded-[28px]",
                "bg-[var(--color-cream)]",
                "w-full",
              ].join(" "),
              navbar: "border-r border-[var(--color-border)]",
              navbarButton:
                "text-[var(--color-charcoal-soft)] hover:text-[var(--color-sage-deep)] hover:bg-[var(--color-cream-soft)]",
              navbarButtonIcon: "text-[var(--color-sage-deep)]",
              headerTitle: "font-display text-2xl text-[var(--color-charcoal)]",
              headerSubtitle: "text-[var(--color-charcoal-muted)]",
              formButtonPrimary:
                "bg-[var(--color-sage-deep)] hover:bg-[var(--color-sage)] text-[var(--color-cream)] rounded-xl",
              badge: "bg-[var(--color-sage-deep)]/10 text-[var(--color-sage-deep)]",
            },
          }}
        />
      </div>

      {/* Sign in hint — shown when Clerk configured but user somehow lands here unauthenticated */}
      <div className="mt-10 flex items-center justify-center gap-2 text-sm text-[var(--color-charcoal-muted)]">
        <LogIn size={14} aria-hidden />
        <span>
          Not you?{" "}
          <Link
            href="/sign-in"
            className="font-medium text-[var(--color-sage-deep)] underline-offset-2 hover:underline"
          >
            Sign in to a different account
          </Link>
        </span>
      </div>
    </div>
  );
}
