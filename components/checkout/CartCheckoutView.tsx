"use client";

/**
 * CartCheckoutView — multi-item cart checkout wrapper.
 *
 * Rendered by /store/checkout when ?cart=1 is in the URL.
 * Reads the Zustand cart store on the client and displays all items
 * in the order summary. Passes the aggregated total + a synthetic
 * "Cart Checkout" item to CheckoutForm for Square payment.
 *
 * Gap note: Square Web Payments SDK processes a single charge.
 * Multi-item orders are sent as one combined payment (total of all items).
 * Individual item line-items are recorded in the order summary display only;
 * the payment amount equals the cart total.
 *
 * VCS cids:
 *   checkout.cart-view             — root
 *   checkout.cart-view.summary     — line-item list
 *   checkout.cart-view.form        — form container
 *
 * Task: UPAEC-T-272-11
 */

import { useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, ShoppingBag, ShieldCheck } from "lucide-react";
import { useCartStore, useCartTotal } from "@/lib/cart-store";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";
import { cid } from "@/lib/vcs/cid";

function centsToDollars(cents: number): string {
  return `$${(cents / 100).toFixed(cents % 100 === 0 ? 0 : 2)}`;
}

interface CartCheckoutViewProps {
  /** Passed from the server component so checkout works with any Vercel var name */
  squareAppId?: string;
  squareLocationId?: string;
  squareEnvironment?: "sandbox" | "production";
}

export function CartCheckoutView({
  squareAppId,
  squareLocationId,
  squareEnvironment,
}: CartCheckoutViewProps = {}) {
  const items = useCartStore((s) => s.items);
  const total = useCartTotal();

  // Synthetic item for CheckoutForm — represents the full cart charge
  const cartItem = useMemo(
    () => ({
      id: "cart-checkout",
      name: items.length === 1 ? items[0].name : `Cart (${items.reduce((s, i) => s + i.qty, 0)} items)`,
      priceDisplay: centsToDollars(total),
      priceCents: total,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [total, items.length]
  );

  // Empty cart — redirect hint
  if (items.length === 0) {
    return (
      <div
        data-cid={cid("checkout.cart-view")}
        className="mx-auto max-w-[var(--content-max)] px-[var(--section-px)] py-[var(--section-py)] text-center"
      >
        <ShoppingBag
          size={40}
          strokeWidth={1.2}
          className="mx-auto mb-4 text-[var(--color-charcoal-muted)]/40"
          aria-hidden
        />
        <p className="font-display text-2xl text-[var(--color-charcoal)]">
          Your cart is empty
        </p>
        <p className="mt-2 text-sm text-[var(--color-charcoal-muted)]">
          Add items from the store before checking out.
        </p>
        <Link
          href="/store"
          className="btn-primary mt-8 inline-flex"
        >
          Browse the store
        </Link>
      </div>
    );
  }

  return (
    <div
      data-cid={cid("checkout.cart-view")}
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
        {/* Left — order summary */}
        <section
          data-cid={cid("checkout.cart-view.summary")}
          aria-labelledby="cart-checkout-heading"
        >
          <p className="eyebrow">Secure checkout</p>
          <h1
            id="cart-checkout-heading"
            className="font-display mt-4 leading-[1.02] text-[var(--color-charcoal)]"
            style={{ fontSize: "var(--text-display-md)", textWrap: "balance" } as React.CSSProperties}
          >
            Your order
          </h1>

          {/* Line items */}
          <ul
            className="mt-8 flex flex-col gap-3"
            aria-label="Items in your cart"
          >
            {items.map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between rounded-2xl border border-[var(--color-border)] bg-[var(--color-cream-soft)] px-5 py-4"
              >
                <div className="flex flex-col gap-0.5 min-w-0">
                  <span className="font-medium text-[var(--color-charcoal)] truncate">
                    {item.name}
                  </span>
                  {item.variation && (
                    <span className="text-xs text-[var(--color-charcoal-muted)]">
                      {item.variation}
                    </span>
                  )}
                  {item.qty > 1 && (
                    <span className="text-xs text-[var(--color-charcoal-muted)]">
                      Qty: {item.qty}
                    </span>
                  )}
                </div>
                <span className="ml-4 shrink-0 tabular-nums font-medium text-[var(--color-sage-deep)]">
                  {centsToDollars(item.priceCents * item.qty)}
                </span>
              </li>
            ))}
          </ul>

          {/* Total */}
          <div className="mt-4 flex items-center justify-between border-t border-[var(--color-border)] pt-4">
            <span className="font-medium text-[var(--color-charcoal)]">Total</span>
            <span
              className="font-display tabular-nums text-[var(--color-sage-deep)]"
              style={{ fontSize: "clamp(1.75rem, 3vw, 2.25rem)" }}
            >
              {centsToDollars(total)}
            </span>
          </div>

          {/* Trust signals */}
          <div className="mt-12 flex flex-col gap-4">
            {[
              "256-bit SSL encryption via Square",
              "Card details never touch our servers",
              "One combined charge for all items",
            ].map((text) => (
              <div
                key={text}
                className="flex items-center gap-3 text-sm text-[var(--color-charcoal-soft)]"
              >
                <ShieldCheck
                  size={15}
                  className="shrink-0 text-[var(--color-sage-deep)]"
                  aria-hidden="true"
                />
                <span>{text}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Right — payment form */}
        <div
          data-cid={cid("checkout.cart-view.form")}
          className="rounded-[28px] border border-[var(--color-border)] bg-[var(--color-cream)] p-8 md:p-10 shadow-sm"
        >
          <CheckoutForm
            item={cartItem}
            squareAppId={squareAppId}
            squareLocationId={squareLocationId}
            squareEnvironment={squareEnvironment}
          />
        </div>
      </div>
    </div>
  );
}
