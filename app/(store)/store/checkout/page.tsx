/**
 * /store/checkout — Square Web Payments checkout page.
 *
 * Entry points:
 *   /store/checkout?id=<variationId>&name=<name>&price=<cents>
 *
 * The item parameters are passed via searchParams from the /store BoxCard.
 * All values are validated/clamped before rendering.
 *
 * VCS cids:
 *   checkout.page        — page root
 *   checkout.page.hero   — page header + item summary
 *   checkout.page.form   — form container
 *
 * Design: Heritage Modern — earthy cream/charcoal/sage palette.
 * Fraunces display + Plus Jakarta Sans body (from globals.css).
 *
 * Task: UPAEC-T-272-04
 */

import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";
import { cid } from "@/lib/vcs/cid";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Complete your 7G Greens box order. Secure payment via Square.",
};

// This page renders per-request (no revalidate) so searchParams are always fresh.
export const dynamic = "force-dynamic";

interface CheckoutPageProps {
  searchParams: Promise<{
    id?: string;
    name?: string;
    price?: string;
    variation?: string;
  }>;
}

function centsToDollars(cents: number): string {
  return `$${(cents / 100).toFixed(cents % 100 === 0 ? 0 : 2)}`;
}

export default async function CheckoutPage({ searchParams }: CheckoutPageProps) {
  const params = await searchParams;

  // Parse + sanitize searchParams
  const rawId = typeof params.id === "string" ? params.id.trim() : "";
  const rawName = typeof params.name === "string" ? decodeURIComponent(params.name).trim() : "";
  const rawPrice = typeof params.price === "string" ? parseInt(params.price, 10) : 0;
  const variationName =
    typeof params.variation === "string" ? decodeURIComponent(params.variation).trim() : "";

  // Fallback to preview item when params are missing
  const item = {
    id: rawId || "fallback-preview",
    name: rawName || "7G Greens Starter Box",
    priceDisplay: rawPrice > 0 ? centsToDollars(rawPrice) : "$45",
    priceCents: rawPrice > 0 ? rawPrice : 4500,
  };

  const isFallback = !rawId || rawPrice <= 0;

  return (
    <>
      {/* Skip nav */}
      <a
        href="#checkout-main"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:px-4 focus:py-2 focus:text-sm focus:bg-[var(--color-sage-deep)] focus:text-[var(--color-cream)]"
      >
        Skip to checkout
      </a>

      <div
        id="checkout-main"
        data-cid={cid("checkout.page")}
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

        <div className="mt-10 grid gap-12 lg:grid-cols-[1fr_480px] lg:gap-20">
          {/* Left — item hero */}
          <section
            data-cid={cid("checkout.page.hero")}
            aria-labelledby="checkout-heading"
          >
            <p className="eyebrow">Secure checkout</p>
            <h1
              id="checkout-heading"
              className="font-display mt-4 leading-[1.02] text-[var(--color-charcoal)]"
              style={{ fontSize: "var(--text-display-md)", textWrap: "balance" } as React.CSSProperties}
            >
              {item.name}
            </h1>

            {variationName && (
              <p className="mt-3 text-sm text-[var(--color-charcoal-muted)]">
                {variationName}
              </p>
            )}

            <div className="mt-6 flex items-baseline gap-3">
              <span
                className="font-display tabular-nums text-[var(--color-sage-deep)]"
                style={{ fontSize: "clamp(2.5rem, 5vw, 3.5rem)" }}
              >
                {item.priceDisplay}
              </span>
              <span className="text-sm text-[var(--color-charcoal-muted)]">one-time</span>
            </div>

            {isFallback && (
              <div
                role="status"
                aria-live="polite"
                className="mt-6 rounded-xl border border-[var(--color-tan-deep)]/20 bg-[var(--color-tan)]/8 px-4 py-3 text-xs text-[var(--color-tan-text)]"
              >
                Preview: no item was selected. Go back and choose a box to order.
              </div>
            )}

            {/* Trust signals */}
            <div className="mt-12 flex flex-col gap-4">
              {[
                { icon: ShieldCheck, text: "256-bit SSL encryption via Square" },
                { icon: ShieldCheck, text: "Card details never touch our servers" },
                { icon: ShieldCheck, text: "No subscription — one order, one charge" },
              ].map(({ icon: Icon, text }) => (
                <div
                  key={text}
                  className="flex items-center gap-3 text-sm text-[var(--color-charcoal-soft)]"
                >
                  <Icon
                    size={15}
                    className="shrink-0 text-[var(--color-sage-deep)]"
                    aria-hidden="true"
                  />
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Right — form */}
          <div
            data-cid={cid("checkout.page.form")}
            className="rounded-[28px] border border-[var(--color-border)] bg-[var(--color-cream)] p-8 md:p-10 shadow-sm"
          >
            <CheckoutForm item={item} />
          </div>
        </div>
      </div>
    </>
  );
}
