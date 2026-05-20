/**
 * /store/subscribe — Square Subscriptions recurring box delivery page.
 *
 * Server component: fetches subscription plans from Square at render time.
 * Falls back gracefully when SQUARE_ACCESS_TOKEN is absent — renders the
 * unconfigured state so the build always succeeds with no keys.
 *
 * VCS cids:
 *   subscribe.page              — page root
 *   subscribe.page.hero         — page header + plan value prop
 *   subscribe.page.form         — form container
 *   subscribe.page.how-it-works — explainer steps
 *
 * Design: Heritage Modern — earthy cream/charcoal/sage palette.
 * Fraunces display + Plus Jakarta Sans body (from globals.css).
 *
 * Task: UPAEC-T-272-05
 */

import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Leaf, RefreshCw, ShieldCheck, Truck } from "lucide-react";
import { listSubscriptionPlans } from "@/lib/square/subscriptions";
import { SubscribeForm } from "@/components/subscribe/SubscribeForm";
import { cid } from "@/lib/vcs/cid";

export const metadata: Metadata = {
  title: "Subscribe",
  description:
    "Get fresh 7G Greens vegetable boxes on a recurring schedule — weekly or monthly. Set it and forget it.",
};

// Revalidate every 5 minutes so plan changes propagate without a redeploy.
export const revalidate = 300;

const HOW_IT_WORKS = [
  {
    icon: Leaf,
    title: "Pick your cadence",
    body: "Weekly or monthly — choose the rhythm that fits your household.",
  },
  {
    icon: ShieldCheck,
    title: "Set your card once",
    body: "Your payment is saved securely via Square. No re-entering details each cycle.",
  },
  {
    icon: Truck,
    title: "Fresh delivery, every time",
    body: "Cold-chain refrigerated from Tyler, TX to East Texas and DFW pickup points.",
  },
  {
    icon: RefreshCw,
    title: "Cancel any time",
    body: "No lock-in, no penalty. Reply to your confirmation email to manage or stop.",
  },
] as const;

export default async function SubscribePage() {
  const { plans, configured } = await listSubscriptionPlans();

  return (
    <>
      {/* Skip to main content */}
      <a
        href="#subscribe-main"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:px-4 focus:py-2 focus:text-sm focus:bg-[var(--color-sage-deep)] focus:text-[var(--color-cream)]"
      >
        Skip to subscribe
      </a>

      <div
        id="subscribe-main"
        data-cid={cid("subscribe.page")}
        className="grain-overlay mx-auto max-w-[var(--content-max)] px-[var(--section-px)] py-[var(--section-py)]"
      >
        {/* Back */}
        <Link
          href="/store"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--color-charcoal-muted)] hover:text-[var(--color-sage-deep)] transition-colors focus-visible:outline-2"
          aria-label="Back to store"
        >
          <ArrowLeft size={14} aria-hidden="true" />
          Back to store
        </Link>

        <div className="mt-10 grid gap-12 lg:grid-cols-[1fr_520px] lg:gap-20">
          {/* ── Left — hero + explainer ─────────────────────────────────── */}
          <section
            data-cid={cid("subscribe.page.hero")}
            aria-labelledby="subscribe-heading"
          >
            <p className="eyebrow">7G Greens — recurring delivery</p>

            <h1
              id="subscribe-heading"
              className="font-display mt-4 max-w-xl leading-[1.02] text-[var(--color-charcoal)]"
              style={{ fontSize: "var(--text-display-md)", textWrap: "balance" } as React.CSSProperties}
            >
              Fresh every{" "}
              <em className="font-display-soft">cycle.</em>
            </h1>

            <p className="mt-6 max-w-lg text-base leading-relaxed text-[var(--color-charcoal-soft)]">
              Subscribe and we'll handle the rest — same chemical-free, non-GMO produce
              delivered on your schedule. No thinking, no missing a week.
            </p>

            {/* How it works */}
            <section
              data-cid={cid("subscribe.page.how-it-works")}
              className="mt-12"
              aria-labelledby="how-it-works-heading"
            >
              <h2
                id="how-it-works-heading"
                className="mb-6 text-sm font-medium uppercase tracking-widest text-[var(--color-charcoal-muted)]"
              >
                How it works
              </h2>
              <ol className="flex flex-col gap-6" aria-label="Subscription steps">
                {HOW_IT_WORKS.map(({ icon: Icon, title, body }, i) => (
                  <li key={title} className="flex items-start gap-4">
                    <div
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[var(--color-border-strong)] bg-[var(--color-cream-soft)]"
                      aria-hidden="true"
                    >
                      <Icon size={15} className="text-[var(--color-sage-deep)]" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[var(--color-charcoal)]">
                        <span className="mr-2 tabular-nums text-[var(--color-charcoal-muted)]">
                          {i + 1}.
                        </span>
                        {title}
                      </p>
                      <p className="mt-1 text-sm leading-relaxed text-[var(--color-charcoal-soft)]">
                        {body}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </section>
          </section>

          {/* ── Right — form ────────────────────────────────────────────── */}
          <div
            data-cid={cid("subscribe.page.form")}
            className="rounded-[28px] border border-[var(--color-border)] bg-[var(--color-cream)] p-8 md:p-10 shadow-sm"
          >
            <p className="eyebrow mb-6">Start your subscription</p>
            <SubscribeForm
              plans={plans}
              plansConfigured={configured}
            />
          </div>
        </div>
      </div>
    </>
  );
}
