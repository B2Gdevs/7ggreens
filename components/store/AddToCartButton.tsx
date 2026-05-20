"use client";

/**
 * AddToCartButton — reusable "Add to cart" button wired to cart-store.
 *
 * Scalable pattern: use this everywhere a product appears —
 * BoxCard, product pages, add-on rows. Briefly shows "Added!" confirmation.
 *
 * Props:
 *   variant — "primary" (sage filled, for boxes) | "secondary" (outlined, for add-ons)
 *   size    — "lg" (BoxCard hero CTAs) | "sm" (add-on row inline)
 *   onAdded — optional callback (e.g. to open CartDrawer after add)
 *
 * VCS: callers apply data-cid on the surrounding container;
 * this component is intentionally cid-free to stay composable.
 *
 * Task: UPAEC-T-272-03 / 272-11
 */

import { useState } from "react";
import { ShoppingBag, Check } from "lucide-react";
import { useCartStore } from "@/lib/cart-store";

interface AddToCartButtonProps {
  id: string;
  name: string;
  priceCents: number;
  priceDisplay: string;
  variation?: string;
  /** "primary" = sage filled (boxes), "secondary" = outlined (add-ons) */
  variant?: "primary" | "secondary";
  /** "lg" = BoxCard hero CTA; "sm" = add-on row inline */
  size?: "lg" | "sm";
  /** Called after the item is added — e.g. open CartDrawer */
  onAdded?: () => void;
  /** Override button label (default: "Add to cart") */
  label?: string;
}

export function AddToCartButton({
  id,
  name,
  priceCents,
  priceDisplay,
  variation,
  variant = "primary",
  size = "sm",
  onAdded,
  label = "Add to cart",
}: AddToCartButtonProps) {
  const [added, setAdded] = useState(false);
  const addItem = useCartStore((s) => s.addItem);

  function handleClick() {
    addItem({ id, name, priceCents, priceDisplay, variation });
    setAdded(true);
    onAdded?.();
    setTimeout(() => setAdded(false), 1800);
  }

  const isPrimary = variant === "primary";
  const isLg = size === "lg";

  const baseClass = [
    "inline-flex items-center gap-2 rounded-full font-semibold transition-all focus-visible:outline-2",
    isLg ? "px-6 py-3 text-[0.9375rem]" : "px-5 py-2.5 text-sm",
    isPrimary
      ? "bg-[var(--color-sage-deep)] text-[var(--color-cream)] hover:bg-[var(--color-sage)] hover:-translate-y-px"
      : "border border-[var(--color-border-strong)] bg-transparent text-[var(--color-charcoal-soft)] hover:bg-[var(--color-cream-soft)]",
    added ? "opacity-80 scale-95" : "",
  ].join(" ");

  const iconSize = isLg ? 15 : 14;

  return (
    <button
      type="button"
      onClick={handleClick}
      className={baseClass}
      aria-live="polite"
      aria-label={added ? `${name} added to cart` : `${label} — ${name}`}
    >
      {added ? (
        <>
          <Check size={iconSize} aria-hidden />
          Added!
        </>
      ) : (
        <>
          <ShoppingBag size={iconSize} aria-hidden />
          {label}
        </>
      )}
    </button>
  );
}
