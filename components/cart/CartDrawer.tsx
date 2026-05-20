"use client";

/**
 * CartDrawer — slide-over cart panel.
 *
 * Shows cart items, delivery/pickup toggle, totals, and a proceed-to-checkout
 * CTA. Opens from the cart icon in SiteHeader.
 *
 * VCS cids:
 *   cart.drawer               — drawer root
 *   cart.drawer.items         — item list
 *   cart.drawer.delivery      — delivery/pickup toggle
 *   cart.drawer.total         — total + CTA
 *
 * Task: UPAEC-T-272-03
 */

import { useEffect, useRef } from "react";
import { X, ShoppingBag, Minus, Plus, Trash2, Truck, MapPin } from "lucide-react";
import { useCartStore, useCartTotal } from "@/lib/cart-store";
import { cid } from "@/lib/vcs/cid";
import Link from "next/link";

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
}

function centsToDollars(cents: number): string {
  return `$${(cents / 100).toFixed(cents % 100 === 0 ? 0 : 2)}`;
}

export function CartDrawer({ open, onClose }: CartDrawerProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const items = useCartStore((s) => s.items);
  const delivery = useCartStore((s) => s.delivery);
  const incrementItem = useCartStore((s) => s.incrementItem);
  const decrementItem = useCartStore((s) => s.decrementItem);
  const removeItem = useCartStore((s) => s.removeItem);
  const clearCart = useCartStore((s) => s.clearCart);
  const setDeliveryMode = useCartStore((s) => s.setDeliveryMode);
  const total = useCartTotal();

  // Trap focus + close on Escape
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  // Prevent body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Build checkout URL.
  // When the cart has exactly one item, use the legacy single-item query params
  // so the existing CheckoutForm picks it up cleanly.
  // When the cart has multiple items, pass cart=1 so the checkout page reads
  // from the cart store (client-side). The checkout page shows the first item's
  // price for the Square payment and notes multi-item in the order summary.
  const primaryItem = items[0];
  const checkoutHref = (() => {
    if (!primaryItem) return "/store";
    if (items.length === 1) {
      return `/store/checkout?id=${encodeURIComponent(primaryItem.id)}&name=${encodeURIComponent(primaryItem.name)}&price=${primaryItem.priceCents}${primaryItem.variation ? `&variation=${encodeURIComponent(primaryItem.variation)}` : ""}`;
    }
    // Multi-item: pass cart=1 flag; checkout page reads Zustand store for summary
    return `/store/checkout?cart=1`;
  })();

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          aria-hidden
          className="fixed inset-0 z-40 bg-[var(--color-charcoal)]/30 backdrop-blur-[2px]"
          onClick={onClose}
        />
      )}

      {/* Drawer panel */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
        data-cid={cid("cart.drawer")}
        className={[
          "fixed right-0 top-0 z-50 flex h-full w-full max-w-[420px] flex-col",
          "bg-[var(--color-cream)] shadow-2xl",
          "transition-transform duration-300 ease-in-out",
          open ? "translate-x-0" : "translate-x-full",
        ].join(" ")}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--color-border)] px-6 py-5">
          <div className="flex items-center gap-2">
            <ShoppingBag size={18} className="text-[var(--color-sage-deep)]" aria-hidden />
            <h2 className="font-display text-xl font-medium text-[var(--color-charcoal)]">
              Your Cart
            </h2>
            {items.length > 0 && (
              <span className="ml-1 rounded-full bg-[var(--color-sage-deep)] px-2 py-0.5 text-xs font-semibold text-[var(--color-cream)]">
                {items.reduce((s, i) => s + i.qty, 0)}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-[var(--color-charcoal-muted)] hover:bg-[var(--color-cream-soft)] transition-colors"
            aria-label="Close cart"
          >
            <X size={20} aria-hidden />
          </button>
        </div>

        {/* Delivery / Pickup toggle */}
        <div
          data-cid={cid("cart.drawer.delivery")}
          className="border-b border-[var(--color-border)] px-6 py-4"
        >
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-[var(--color-charcoal-muted)]">
            Fulfillment
          </p>
          <div
            role="group"
            aria-label="Delivery or pickup"
            className="flex gap-2"
          >
            <button
              type="button"
              onClick={() => setDeliveryMode("delivery")}
              aria-pressed={delivery.mode === "delivery"}
              className={[
                "flex flex-1 items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition-all",
                delivery.mode === "delivery"
                  ? "border-[var(--color-sage-deep)] bg-[var(--color-sage-deep)] text-[var(--color-cream)]"
                  : "border-[var(--color-border-strong)] bg-transparent text-[var(--color-charcoal-soft)] hover:bg-[var(--color-cream-soft)]",
              ].join(" ")}
            >
              <Truck size={15} aria-hidden />
              Delivery
            </button>
            <button
              type="button"
              onClick={() => setDeliveryMode("pickup")}
              aria-pressed={delivery.mode === "pickup"}
              className={[
                "flex flex-1 items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition-all",
                delivery.mode === "pickup"
                  ? "border-[var(--color-sage-deep)] bg-[var(--color-sage-deep)] text-[var(--color-cream)]"
                  : "border-[var(--color-border-strong)] bg-transparent text-[var(--color-charcoal-soft)] hover:bg-[var(--color-cream-soft)]",
              ].join(" ")}
            >
              <MapPin size={15} aria-hidden />
              Pickup
            </button>
          </div>
          {delivery.mode === "delivery" && delivery.zip && (
            <p className="mt-2 text-xs text-[var(--color-sage-text)]">
              Delivering to ZIP: <span className="font-semibold">{delivery.zip}</span>
            </p>
          )}
          {delivery.mode === "delivery" && !delivery.zip && (
            <p className="mt-2 text-xs text-[var(--color-charcoal-muted)]">
              Enter your ZIP on the homepage to confirm delivery availability.
            </p>
          )}
        </div>

        {/* Items */}
        <div
          data-cid={cid("cart.drawer.items")}
          className="flex-1 overflow-y-auto px-6 py-4"
        >
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <ShoppingBag
                size={36}
                strokeWidth={1.2}
                className="text-[var(--color-charcoal-muted)]/40"
                aria-hidden
              />
              <p className="mt-4 font-display text-lg text-[var(--color-charcoal)]">
                Your cart is empty
              </p>
              <p className="mt-1 text-sm text-[var(--color-charcoal-muted)]">
                Add a box from the store to get started.
              </p>
              <Link
                href="/store"
                onClick={onClose}
                className="mt-6 rounded-xl bg-[var(--color-sage-deep)] px-5 py-2.5 text-sm font-semibold text-[var(--color-cream)] hover:bg-[var(--color-sage)] transition-colors"
              >
                Browse the store
              </Link>
            </div>
          ) : (
            <ul className="flex flex-col gap-4" aria-label="Cart items">
              {items.map((item) => (
                <li
                  key={item.id}
                  className="flex items-start gap-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-cream-soft)] p-4"
                >
                  {/* Icon */}
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--color-sage-deep)]/10">
                    <ShoppingBag size={16} className="text-[var(--color-sage-deep)]" aria-hidden />
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-[var(--color-charcoal)] leading-tight truncate">
                      {item.name}
                    </p>
                    {item.variation && (
                      <p className="mt-0.5 text-xs text-[var(--color-charcoal-muted)] truncate">
                        {item.variation}
                      </p>
                    )}
                    <p className="mt-1 text-sm font-semibold text-[var(--color-sage-deep)]">
                      {centsToDollars(item.priceCents * item.qty)}
                    </p>
                  </div>

                  {/* Qty controls */}
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => decrementItem(item.id)}
                      aria-label={`Decrease ${item.name} quantity`}
                      className="flex h-7 w-7 items-center justify-center rounded-lg border border-[var(--color-border-strong)] text-[var(--color-charcoal-muted)] hover:bg-[var(--color-cream)] transition-colors"
                    >
                      <Minus size={12} aria-hidden />
                    </button>
                    <span
                      className="w-6 text-center text-sm font-semibold tabular-nums text-[var(--color-charcoal)]"
                      aria-label={`Quantity: ${item.qty}`}
                    >
                      {item.qty}
                    </span>
                    <button
                      type="button"
                      onClick={() => incrementItem(item.id)}
                      aria-label={`Increase ${item.name} quantity`}
                      className="flex h-7 w-7 items-center justify-center rounded-lg border border-[var(--color-border-strong)] text-[var(--color-charcoal-muted)] hover:bg-[var(--color-cream)] transition-colors"
                    >
                      <Plus size={12} aria-hidden />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      aria-label={`Remove ${item.name} from cart`}
                      className="ml-1 flex h-7 w-7 items-center justify-center rounded-lg text-[var(--color-tomato)]/60 hover:bg-[var(--color-tomato)]/8 transition-colors"
                    >
                      <Trash2 size={13} aria-hidden />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer — total + CTA */}
        {items.length > 0 && (
          <div
            data-cid={cid("cart.drawer.total")}
            className="border-t border-[var(--color-border)] px-6 py-5"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm text-[var(--color-charcoal-muted)]">Subtotal</p>
              <p className="font-display text-xl font-medium text-[var(--color-charcoal)]">
                {centsToDollars(total)}
              </p>
            </div>
            <p className="mt-1 text-xs text-[var(--color-charcoal-muted)]">
              Delivery fees calculated at checkout.
            </p>

            <div className="mt-4 flex flex-col gap-2">
              <Link
                href={checkoutHref}
                onClick={onClose}
                className="w-full rounded-xl bg-[var(--color-sage-deep)] px-5 py-3.5 text-center text-sm font-semibold text-[var(--color-cream)] hover:bg-[var(--color-sage)] transition-colors focus-visible:outline-2"
              >
                Proceed to checkout
              </Link>
              <button
                type="button"
                onClick={clearCart}
                className="w-full rounded-xl border border-[var(--color-border-strong)] px-5 py-2.5 text-center text-sm font-medium text-[var(--color-charcoal-muted)] hover:bg-[var(--color-cream-soft)] transition-colors"
              >
                Clear cart
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
