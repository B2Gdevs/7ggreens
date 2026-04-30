"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ShoppingBag, Menu, X } from "lucide-react";
import { NAV, SITE } from "@/lib/site/constants";
import { useCartCount } from "@/lib/cart-store";
import { cid } from "@/lib/vcs/cid";
import { cn } from "@/lib/cn";

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const cartCount = useCartCount();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      data-cid={cid("site.header")}
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        scrolled
          ? "bg-[var(--color-cream)]/85 backdrop-blur-md border-b border-[var(--color-border)]"
          : "bg-transparent"
      )}
    >
      <div className="mx-auto flex max-w-[var(--content-max)] items-center justify-between px-[var(--section-px)] py-4">
        <Link
          href="/"
          data-cid={cid("site.header.brand")}
          className="font-display text-2xl font-medium tracking-tight"
        >
          <span className="text-[var(--color-sage-deep)]">7</span>
          <span>Greens</span>
        </Link>

        <nav
          data-cid={cid("site.header.nav")}
          className="hidden items-center gap-8 md:flex"
        >
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-[var(--color-charcoal-soft)] hover:text-[var(--color-sage-deep)] transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/boxes"
            data-cid={cid("site.header.cart")}
            className="hidden md:inline-flex items-center gap-2 rounded-full border border-[var(--color-border-strong)] bg-[var(--color-cream)]/60 px-4 py-2 text-sm font-medium hover:bg-[var(--color-cream-soft)]"
            aria-label={`Cart, ${cartCount} items`}
          >
            <ShoppingBag size={16} strokeWidth={1.6} />
            <span className="text-xs tabular-nums">{cartCount}</span>
          </Link>

          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            className="md:hidden rounded-full border border-[var(--color-border-strong)] p-2"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {open && (
        <div
          data-cid={cid("site.header.mobile")}
          className="md:hidden border-t border-[var(--color-border)] bg-[var(--color-cream)]"
        >
          <div className="flex flex-col gap-1 px-[var(--section-px)] py-4">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-3 text-base font-medium hover:bg-[var(--color-cream-soft)]"
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/boxes"
              onClick={() => setOpen(false)}
              className="mt-2 rounded-lg bg-[var(--color-sage-deep)] px-3 py-3 text-center text-base font-medium text-[var(--color-cream)]"
            >
              Order a box →
            </Link>
            <p className="mt-4 px-3 text-xs text-[var(--color-charcoal-muted)]">
              {SITE.phones[0]} · {SITE.address.city}, {SITE.address.state}
            </p>
          </div>
        </div>
      )}
    </header>
  );
}
