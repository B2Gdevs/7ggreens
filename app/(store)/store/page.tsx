/**
 * Store browse page — /store (Next.js App Router route group).
 *
 * Server component: fetches the full Square catalog at render time.
 * Falls back gracefully when SQUARE_ACCESS_TOKEN is absent.
 *
 * Sections (VCS cids):
 *   store.hero          — page header + subtitle
 *   store.browse.boxes  — box product grid
 *   store.browse.addons — per-item add-on grid
 *   store.source-badge  — data-source indicator strip
 *
 * Design: Heritage Modern — earthy cream/charcoal/sage palette from
 * globals.css. Fraunces display + Plus Jakarta Sans body.
 *
 * Task: UPAEC-T-272-02
 */

import Link from "next/link";
import { ArrowRight, PackageOpen, Leaf, AlertCircle } from "lucide-react";
import { fetchFullCatalog } from "@/lib/square/catalog";
import { BoxCard } from "@/components/store/BoxCard";
import { cid } from "@/lib/vcs/cid";

export const metadata = {
  title: "Store",
  description:
    "Order field-fresh 7G Greens vegetable boxes. Starter and Family sizes, with produce add-ons by the pound. No subscription required.",
};

// Revalidate every 60 s so catalog changes propagate without a redeploy.
export const revalidate = 60;

export default async function StorePage() {
  const catalog = await fetchFullCatalog();

  return (
    <>
      {/* Skip to main content */}
      <a
        href="#store-main"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:px-4 focus:py-2 focus:text-sm focus:bg-[var(--color-sage-deep)] focus:text-[var(--color-cream)]"
      >
        Skip to store
      </a>

      <main id="store-main">
        {/* ── Hero ───────────────────────────────────────────────────────── */}
        <section
          data-cid={cid("store.hero")}
          className="grain-overlay relative bg-[var(--color-cream-soft)] py-[var(--section-py)]"
        >
          {/* Decorative orbs */}
          <div
            aria-hidden="true"
            className="hero-orb hero-orb-sage pointer-events-none absolute left-[5%] top-[15%] h-[480px] w-[480px] rounded-full opacity-[0.07]"
            style={{ background: "radial-gradient(circle, var(--color-sage) 0%, transparent 70%)" }}
          />
          <div
            aria-hidden="true"
            className="hero-orb hero-orb-tan pointer-events-none absolute bottom-[10%] right-[8%] h-[360px] w-[360px] rounded-full opacity-[0.06]"
            style={{ background: "radial-gradient(circle, var(--color-tan) 0%, transparent 70%)" }}
          />

          <div className="relative mx-auto max-w-[var(--content-max)] px-[var(--section-px)]">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm font-medium text-[var(--color-charcoal-muted)] hover:text-[var(--color-sage-deep)] transition-colors focus-visible:outline-2"
            >
              ← Back home
            </Link>

            <p className="eyebrow mt-8">7G Greens — field to family</p>

            <h1
              className="font-display mt-4 max-w-3xl leading-[1.02] text-[var(--color-charcoal)]"
              style={{ fontSize: "var(--text-display-lg)", textWrap: "balance" } as React.CSSProperties}
            >
              Real food.<br />
              <em className="font-display-soft">Your table.</em>
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-relaxed text-[var(--color-charcoal-soft)] md:text-lg">
              Choose a box size — Starter or Family. Layer in extra pounds of produce at&nbsp;$5/lb.
              No subscription, no commitment. Order what you want, when you want it.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <a href="#boxes" className="btn-primary">
                <PackageOpen size={16} aria-hidden="true" />
                Browse boxes
              </a>
              <a href="#add-ons" className="btn-secondary">
                Add-ons <ArrowRight size={14} aria-hidden="true" />
              </a>
            </div>
          </div>
        </section>

        {/* ── Source indicator ───────────────────────────────────────────── */}
        {catalog.source === "fallback" && (
          <div
            data-cid={cid("store.source-badge")}
            role="status"
            aria-live="polite"
            className="border-y border-[var(--color-border)] bg-[var(--color-cream-muted)] py-3"
          >
            <div className="mx-auto flex max-w-[var(--content-max)] items-center gap-2 px-[var(--section-px)] text-xs text-[var(--color-charcoal-muted)]">
              <AlertCircle size={13} aria-hidden="true" className="shrink-0" />
              <span>
                Showing preview pricing — Square catalog connects once{" "}
                <code className="font-mono">SQUARE_ACCESS_TOKEN</code> is set in Vercel.
              </span>
            </div>
          </div>
        )}

        {catalog.source === "square" && (
          <div
            data-cid={cid("store.source-badge")}
            role="status"
            aria-live="polite"
            className="border-y border-[var(--color-border)] bg-[var(--color-cream)] py-3"
          >
            <div className="mx-auto flex max-w-[var(--content-max)] items-center gap-2 px-[var(--section-px)] text-xs text-[var(--color-charcoal-muted)]">
              <Leaf size={13} aria-hidden="true" className="shrink-0 text-[var(--color-sage-deep)]" />
              <span>
                Prices live from Square catalog
                {catalog.squareCount > 0 && ` · ${catalog.squareCount} items`}.
              </span>
            </div>
          </div>
        )}

        {/* ── Box products ───────────────────────────────────────────────── */}
        <section
          id="boxes"
          data-cid={cid("store.browse.boxes")}
          className="py-[var(--section-py)]"
          aria-labelledby="boxes-heading"
        >
          <div className="mx-auto max-w-[var(--content-max)] px-[var(--section-px)]">
            <div className="mb-12">
              <p className="eyebrow">Choose your box</p>
              <h2
                id="boxes-heading"
                className="font-display mt-3 leading-tight text-[var(--color-charcoal)]"
                style={{ fontSize: "var(--text-display-sm)", textWrap: "balance" } as React.CSSProperties}
              >
                Two sizes. One promise.
              </h2>
              <p className="mt-4 max-w-xl text-sm leading-relaxed text-[var(--color-charcoal-soft)]">
                Both boxes contain chemical-free, non-GMO produce harvested the same week.
                The Family box scales portions for a household of&nbsp;4+.
              </p>
            </div>

            {catalog.boxes.length === 0 ? (
              <div
                data-cid={cid("store.browse.boxes.empty")}
                className="rounded-2xl border border-dashed border-[var(--color-border-strong)] p-12 text-center"
              >
                <PackageOpen size={32} className="mx-auto mb-4 text-[var(--color-charcoal-muted)]" aria-hidden="true" />
                <p className="text-sm text-[var(--color-charcoal-muted)]">
                  Box listings will appear here once the Square catalog is connected.
                </p>
              </div>
            ) : (
              <ul
                className="reveal-stagger grid gap-8 md:grid-cols-2"
                aria-label="Available box sizes"
              >
                {catalog.boxes.map((box, i) => (
                  <li key={box.id}>
                    <BoxCard box={box} source={catalog.source} index={i} />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        {/* ── Add-ons / produce items ─────────────────────────────────────── */}
        <section
          id="add-ons"
          data-cid={cid("store.browse.addons")}
          className="bg-[var(--color-cream-soft)] py-[var(--section-py)]"
          aria-labelledby="addons-heading"
        >
          <div className="mx-auto max-w-[var(--content-max)] px-[var(--section-px)]">
            <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="eyebrow">Order extra</p>
                <h2
                  id="addons-heading"
                  className="font-display mt-3 leading-tight text-[var(--color-charcoal)]"
                  style={{ fontSize: "var(--text-display-md)", textWrap: "balance" } as React.CSSProperties}
                >
                  Add by the pound — $5&nbsp;/&nbsp;lb.
                </h2>
              </div>
              <p className="max-w-md text-sm text-[var(--color-charcoal-soft)]">
                Bulk add-ons priced flat. Mix into any box. Perfect for meal-prepping or sharing with neighbors.
              </p>
            </div>

            {catalog.items.length === 0 ? (
              <div
                data-cid={cid("store.browse.addons.empty")}
                className="mt-12 rounded-2xl border border-dashed border-[var(--color-border-strong)] p-12 text-center"
              >
                <Leaf size={28} className="mx-auto mb-4 text-[var(--color-charcoal-muted)]" aria-hidden="true" />
                <p className="text-sm text-[var(--color-charcoal-muted)]">
                  Add-on listings will appear here once the Square catalog is connected.
                </p>
              </div>
            ) : (
              <ul
                data-cid={cid("store.browse.addons.grid")}
                className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
                aria-label="Produce add-ons"
              >
                {catalog.items.map((item) => (
                  <li
                    key={item.id}
                    data-cid={cid(`store.browse.addons.item.${item.id}`)}
                    className="group flex items-center justify-between rounded-2xl border border-[var(--color-border)] bg-[var(--color-cream)] px-5 py-4 transition-colors hover:border-[var(--color-sage-deep)]/30 hover:bg-[var(--color-cream-soft)]"
                  >
                    <div className="flex flex-col gap-0.5 min-w-0">
                      <span className="truncate text-sm font-medium text-[var(--color-charcoal)]">
                        {item.name}
                      </span>
                      {item.description && (
                        <span className="truncate text-[11px] text-[var(--color-charcoal-muted)]">
                          {item.description}
                        </span>
                      )}
                    </div>
                    <span className="ml-4 shrink-0 tabular-nums text-sm font-medium text-[var(--color-sage-deep)]">
                      {item.priceDisplay}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        {/* ── FAQ / reassurance strip ─────────────────────────────────────── */}
        <section
          data-cid={cid("store.faq")}
          className="py-[var(--section-py-tight)]"
          aria-labelledby="faq-heading"
        >
          <div className="mx-auto max-w-[var(--content-max)] px-[var(--section-px)]">
            <h2 id="faq-heading" className="sr-only">
              Frequently asked questions
            </h2>
            <dl className="grid gap-6 md:grid-cols-3">
              {[
                {
                  q: "No subscription?",
                  a: "None. Order this week, skip the next — no lock-in, no penalty.",
                },
                {
                  q: "How does delivery work?",
                  a: "Cold-chain refrigerated truck from Tyler, TX to East Texas and DFW pickup points.",
                },
                {
                  q: "Can I customize my box?",
                  a: "Add extra pounds of any produce item at $5/lb. Mix and match to your week.",
                },
              ].map(({ q, a }) => (
                <div
                  key={q}
                  data-cid={cid(`store.faq.${q.replace(/[^a-z]/gi, "-").toLowerCase()}`)}
                  className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-cream-soft)] p-6"
                >
                  <dt className="font-display text-lg font-medium text-[var(--color-charcoal)]">
                    {q}
                  </dt>
                  <dd className="mt-2 text-sm leading-relaxed text-[var(--color-charcoal-soft)]">
                    {a}
                  </dd>
                </div>
              ))}
            </dl>

            <div className="mt-12 text-center">
              <Link href="/#contact" className="btn-secondary">
                Questions? Get in touch
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
