/**
 * BoxCard — store browse product card.
 *
 * Primary CTA: AddToCartButton (adds to cart store; user checks out from CartDrawer).
 * Secondary CTA: "Buy now" link — direct to checkout for single-item fast path.
 *
 * VCS: data-cid applied to the article root so the canonical
 * ContextSheet inspector can address each card by box id.
 *
 * Task: UPAEC-T-272-11 (add-to-cart UX) / 272-02 / 272-04
 */

"use client";

import Link from "next/link";
import { Check, Leaf, Zap } from "lucide-react";
import type { BoxItem } from "@/lib/square/client";
import { cid } from "@/lib/vcs/cid";
import { AddToCartButton } from "@/components/store/AddToCartButton";

interface BoxCardProps {
  box: BoxItem;
  source: "square" | "fallback";
  /** index used for stagger animation class */
  index: number;
}

export function BoxCard({ box, source, index }: BoxCardProps) {
  const isStarter = box.name.toLowerCase().includes("starter");
  const accentClass = isStarter
    ? "bg-[var(--color-sage-deep)]"
    : "bg-[var(--color-tan-deep)]";

  // Unused but kept for future stagger CSS use
  void index;

  return (
    <article
      data-cid={cid(`store.browse.box.${box.id}`)}
      className="group relative flex flex-col rounded-[28px] border border-[var(--color-border)] bg-[var(--color-cream)] p-8 md:p-10 transition-shadow duration-300 hover:shadow-lg"
    >
      {/* Source badge */}
      <div className="absolute right-6 top-6">
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest text-[var(--color-cream)] ${accentClass} opacity-80`}
          aria-label={source === "square" ? "Live catalog" : "Preview pricing"}
        >
          <Leaf size={9} aria-hidden="true" />
          {source === "square" ? "Live" : "Preview"}
        </span>
      </div>

      {/* Header */}
      <div className="flex flex-col gap-1">
        <p className="eyebrow">{isStarter ? "Solo or pair" : "Household"}</p>
        <h2
          className="font-display mt-1 leading-[1.05] text-[var(--color-charcoal)]"
          style={{ fontSize: "clamp(2rem, 4vw, 3rem)" }}
        >
          {box.name}
        </h2>
      </div>

      {/* Price block */}
      <div className="mt-4 flex items-baseline gap-3">
        <span
          className="font-display tabular-nums text-[var(--color-sage-deep)]"
          style={{ fontSize: "clamp(2.5rem, 5vw, 3.75rem)" }}
        >
          {box.priceDisplay}
        </span>
        {box.portion && (
          <span className="text-xs text-[var(--color-charcoal-muted)]">
            {box.portion}
          </span>
        )}
      </div>

      {/* Item count */}
      <p className="mt-1 text-sm text-[var(--color-charcoal-muted)]">
        {box.itemCount} items included
      </p>

      {/* Item list */}
      <ul
        className="mt-8 grid grid-cols-1 gap-x-6 gap-y-2 text-sm text-[var(--color-charcoal-soft)] sm:grid-cols-2"
        aria-label={`Items in ${box.name}`}
      >
        {box.items.map((item) => (
          <li key={item} className="flex items-baseline gap-2">
            <Check
              size={12}
              strokeWidth={2.4}
              className="mt-1 shrink-0 text-[var(--color-sage-deep)]"
              aria-hidden="true"
            />
            <span>{item}</span>
          </li>
        ))}
      </ul>

      {/* CTA row — primary: Add to cart; secondary: Buy now */}
      <div
        data-cid={cid(`store.browse.box.${box.id}.cta`)}
        className="mt-10 flex flex-wrap items-center gap-3"
      >
        {/* Primary: scalable add-to-cart pattern */}
        <AddToCartButton
          id={box.id}
          name={box.name}
          priceCents={box.priceCents}
          priceDisplay={box.priceDisplay}
          variant="primary"
          size="lg"
        />

        {/* Secondary: fast-path single-item checkout */}
        <Link
          href={`/store/checkout?id=${encodeURIComponent(box.id)}&name=${encodeURIComponent(box.name)}&price=${box.priceCents}`}
          className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-border-strong)] px-5 py-2.5 text-sm font-medium text-[var(--color-charcoal-soft)] hover:bg-[var(--color-cream-soft)] transition-colors"
          aria-label={`Buy ${box.name} now — skip to checkout`}
          data-cid={cid(`store.browse.box.${box.id}.buy-now`)}
        >
          <Zap size={13} aria-hidden="true" />
          Buy now
        </Link>
      </div>
    </article>
  );
}
