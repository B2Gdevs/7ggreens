"use client";

/**
 * AddToCartButton — adds a box or add-on to the cart store.
 *
 * Uses useCartStore from lib/cart-store. Renders as a styled button
 * that briefly shows a "Added!" confirmation.
 *
 * Task: UPAEC-T-272-03
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
  /** "primary" = sage button (boxes), "secondary" = outlined (add-ons) */
  variant?: "primary" | "secondary";
  onAdded?: () => void;
}

export function AddToCartButton({
  id,
  name,
  priceCents,
  priceDisplay,
  variation,
  variant = "primary",
  onAdded,
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
  const baseClass = [
    "inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-all focus-visible:outline-2",
    isPrimary
      ? "bg-[var(--color-sage-deep)] text-[var(--color-cream)] hover:bg-[var(--color-sage)]"
      : "border border-[var(--color-border-strong)] bg-transparent text-[var(--color-charcoal-soft)] hover:bg-[var(--color-cream-soft)]",
    added ? "opacity-80" : "",
  ].join(" ");

  return (
    <button type="button" onClick={handleClick} className={baseClass} aria-live="polite">
      {added ? (
        <>
          <Check size={14} aria-hidden />
          Added!
        </>
      ) : (
        <>
          <ShoppingBag size={14} aria-hidden />
          Add to cart
        </>
      )}
    </button>
  );
}
