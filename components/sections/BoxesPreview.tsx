import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { fetchCatalog } from "@/lib/square/client";
import { cid } from "@/lib/vcs/cid";

export async function BoxesPreview() {
  const catalog = await fetchCatalog();
  const boxes = [catalog.starter, catalog.family];

  return (
    <section
      id="boxes"
      data-cid={cid("home.boxes")}
      className="py-[var(--section-py)]"
    >
      <div className="mx-auto max-w-[var(--content-max)] px-[var(--section-px)]">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <p className="eyebrow">No subscription. No commitment.</p>
            <h2
              className="font-display mt-4 leading-[1.05] text-[var(--color-charcoal)]"
              style={{ fontSize: "var(--text-display-lg)" }}
            >
              Order what you want, when you want it.
            </h2>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-[var(--color-charcoal-soft)] md:text-lg">
              Two ways to start. Add extras at $5 / lb. Picked after you order, sealed cold within the hour.
            </p>
          </div>
          <Link href="/boxes" className="btn-secondary self-start md:self-end">
            See full catalog
            <ArrowUpRight size={16} />
          </Link>
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-2">
          {boxes.map((box, i) => (
            <article
              key={box.id}
              data-cid={cid(`home.boxes.${i === 0 ? "starter" : "family"}`)}
              className="group relative overflow-hidden rounded-[28px] border border-[var(--color-border)] bg-[var(--color-cream)] p-8 transition-all hover:shadow-[0_30px_70px_rgba(60,55,40,0.12)]"
            >
              <div className="flex items-baseline justify-between">
                <h3 className="font-display text-3xl tracking-tight md:text-4xl">{box.name}</h3>
                <span
                  className="font-display tabular-nums text-[var(--color-sage-deep)]"
                  style={{ fontSize: "clamp(2rem, 4vw, 3rem)" }}
                >
                  {box.priceDisplay}
                </span>
              </div>

              <p className="mt-2 text-sm text-[var(--color-charcoal-muted)]">
                {box.itemCount} items · {box.portion}
              </p>

              <ul className="mt-6 grid grid-cols-1 gap-1 text-sm text-[var(--color-charcoal-soft)] sm:grid-cols-2">
                {box.items.slice(0, 8).map((item) => (
                  <li key={item} className="flex items-baseline gap-2">
                    <span aria-hidden className="text-[var(--color-sage)]">·</span>
                    <span>{item}</span>
                  </li>
                ))}
                {box.items.length > 8 && (
                  <li className="text-[var(--color-charcoal-muted)] italic">
                    + {box.items.length - 8} more
                  </li>
                )}
              </ul>

              <div className="mt-8 flex items-center justify-between">
                <Link
                  href="/boxes"
                  className="inline-flex items-center gap-2 text-sm font-medium text-[var(--color-sage-deep)] hover:text-[var(--color-sage)]"
                >
                  View this box
                  <ArrowUpRight size={14} />
                </Link>
                {catalog.source === "fallback" && (
                  <span className="text-[10px] uppercase tracking-widest text-[var(--color-charcoal-muted)]">
                    placeholder · live data when Square connects
                  </span>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
