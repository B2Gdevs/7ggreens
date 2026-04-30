import Link from "next/link";
import { ArrowLeft, Check } from "lucide-react";
import { fetchCatalog } from "@/lib/square/client";
import { BOX_FALLBACKS, PRODUCT_CATALOG_FALLBACK } from "@/lib/site/constants";
import { cid } from "@/lib/vcs/cid";

export const metadata = {
  title: "Boxes",
  description:
    "Starter and Family vegetable boxes from 7Greens — order what you want, when you want it. No subscription.",
};

export default async function BoxesPage() {
  const catalog = await fetchCatalog();

  return (
    <>
      {/* Page hero */}
      <section
        data-cid={cid("boxes.hero")}
        className="grain-overlay relative bg-[var(--color-cream-soft)] py-[var(--section-py)]"
      >
        <div className="mx-auto max-w-[var(--content-max)] px-[var(--section-px)]">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-[var(--color-charcoal-muted)] hover:text-[var(--color-sage-deep)]"
          >
            <ArrowLeft size={14} />
            Back home
          </Link>
          <p className="eyebrow mt-8">Order-as-needed boxes</p>
          <h1
            className="font-display mt-4 leading-[1.02] text-[var(--color-charcoal)]"
            style={{ fontSize: "var(--text-display-lg)" }}
          >
            Two box sizes. Add what you need.
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-[var(--color-charcoal-soft)] md:text-lg">
            Pick a Starter or Family box, then layer on $5/lb extras. No subscription, no commitment — order this week, skip the next, come back the week after.
          </p>
        </div>
      </section>

      {/* Box cards */}
      <section data-cid={cid("boxes.cards")} className="py-[var(--section-py)]">
        <div className="mx-auto max-w-[var(--content-max)] px-[var(--section-px)]">
          <div className="grid gap-8 md:grid-cols-2">
            {[catalog.starter, catalog.family].map((box, i) => (
              <article
                key={box.id}
                data-cid={cid(`boxes.cards.${i === 0 ? "starter" : "family"}`)}
                className="rounded-[28px] border border-[var(--color-border)] bg-[var(--color-cream)] p-8 md:p-10"
              >
                <div className="flex items-baseline justify-between">
                  <div>
                    <p className="eyebrow">{i === 0 ? "Solo or pair" : "Household"}</p>
                    <h2 className="font-display mt-2 text-4xl tracking-tight md:text-5xl">
                      {box.name}
                    </h2>
                  </div>
                  <span
                    className="font-display tabular-nums text-[var(--color-sage-deep)]"
                    style={{ fontSize: "clamp(2.5rem, 5vw, 4rem)" }}
                  >
                    {box.priceDisplay}
                  </span>
                </div>
                <p className="mt-2 text-sm text-[var(--color-charcoal-muted)]">
                  {box.itemCount} items · {box.portion}
                </p>

                <ul className="mt-8 grid grid-cols-1 gap-x-6 gap-y-2 text-sm text-[var(--color-charcoal-soft)] sm:grid-cols-2">
                  {box.items.map((item) => (
                    <li key={item} className="flex items-baseline gap-2">
                      <Check size={12} strokeWidth={2.4} className="mt-1 shrink-0 text-[var(--color-sage-deep)]" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-10 flex items-center justify-between gap-4">
                  <button
                    type="button"
                    className="btn-primary"
                    aria-label={`Add ${box.name} to cart`}
                    disabled
                    title="Square checkout connects in Phase 04"
                  >
                    Order this box
                  </button>
                  {catalog.source === "fallback" && (
                    <span className="text-[10px] uppercase tracking-widest text-[var(--color-charcoal-muted)]">
                      checkout opens when Square connects
                    </span>
                  )}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Order extra */}
      <section
        id="extras"
        data-cid={cid("boxes.extras")}
        className="bg-[var(--color-cream-soft)] py-[var(--section-py)]"
      >
        <div className="mx-auto max-w-[var(--content-max)] px-[var(--section-px)]">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="eyebrow">Order Extra</p>
              <h2
                className="font-display mt-3 leading-tight"
                style={{ fontSize: "var(--text-display-md)" }}
              >
                Add by the pound — $5 / lb.
              </h2>
            </div>
            <p className="max-w-md text-sm text-[var(--color-charcoal-soft)]">
              Bulk add-ons priced flat. Mix into any box.
            </p>
          </div>

          <ul
            data-cid={cid("boxes.extras.grid")}
            className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
          >
            {BOX_FALLBACKS.extras.map((extra) => (
              <li
                key={extra.name}
                className="flex items-center justify-between rounded-2xl border border-[var(--color-border)] bg-[var(--color-cream)] px-5 py-4"
              >
                <span className="text-sm font-medium text-[var(--color-charcoal-soft)]">
                  {extra.name}
                </span>
                <span className="text-sm font-medium tabular-nums text-[var(--color-sage-deep)]">
                  {extra.priceDisplay}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Product gallery */}
      <section data-cid={cid("boxes.gallery")} className="py-[var(--section-py)]">
        <div className="mx-auto max-w-[var(--content-max)] px-[var(--section-px)]">
          <div className="max-w-2xl">
            <p className="eyebrow">What we grow</p>
            <h2
              className="font-display mt-3 leading-tight"
              style={{ fontSize: "var(--text-display-md)" }}
            >
              Every leaf, every root.
            </h2>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-[var(--color-charcoal-soft)]">
              Photos straight from the field. What's in your box rotates with the season.
            </p>
          </div>

          <ul
            data-cid={cid("boxes.gallery.grid")}
            className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4"
          >
            {PRODUCT_CATALOG_FALLBACK.slice(0, 24).map((p, idx) => {
              const photoIdx = (idx % 25) + 1;
              const padded = String(photoIdx).padStart(2, "0");
              const isPng = [11, 14, 18].includes(photoIdx);
              const ext = isPng ? "png" : "jpeg";
              return (
                <li
                  key={p.sku}
                  className="group overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-cream)]"
                >
                  <div className="aspect-square overflow-hidden bg-[var(--color-cream-soft)]">
                    <img
                      src={`/photos/produce/web-photos-${padded}.${ext}`}
                      alt={p.name}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                  <div className="px-4 py-3">
                    <p className="text-sm font-medium text-[var(--color-charcoal)]">{p.name}</p>
                    <p className="mt-1 text-[10px] uppercase tracking-widest text-[var(--color-charcoal-muted)]">
                      {p.sku}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </section>
    </>
  );
}
