import { Leaf, Snowflake, Package, Sprout } from "lucide-react";
import { DIFFERENTIATORS } from "@/lib/site/constants";
import { cid } from "@/lib/vcs/cid";

const ICONS = {
  Leaf,
  Snowflake,
  Package,
  Sprout,
} as const;

export function Differentiators() {
  return (
    <section
      data-cid={cid("home.diff")}
      className="bg-[var(--color-cream-soft)] py-[var(--section-py)]"
    >
      <div className="mx-auto max-w-[var(--content-max)] px-[var(--section-px)]">
        <div className="mx-auto max-w-2xl text-center">
          <p className="eyebrow">The 7Greens Difference</p>
          <h2
            className="font-display mt-4 leading-[1.05] text-[var(--color-charcoal)]"
            style={{ fontSize: "var(--text-display-md)" }}
          >
            Four promises we put on every box.
          </h2>
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-4 reveal-stagger">
          {DIFFERENTIATORS.map((d) => {
            const Icon = ICONS[d.icon];
            return (
              <article
                key={d.title}
                data-cid={cid(`home.diff.${d.title.toLowerCase().replace(/\s+/g, "-")}`)}
                className="group relative rounded-3xl border border-[var(--color-border)] bg-[var(--color-cream)]/60 p-8 backdrop-blur-sm transition-all hover:border-[var(--color-sage)]/40 hover:bg-[var(--color-cream)]"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--color-sage-deep)] text-[var(--color-cream)] transition-transform group-hover:scale-105 group-hover:rotate-[-4deg]">
                  <Icon size={22} strokeWidth={1.6} />
                </div>
                <h3 className="font-display mt-6 text-2xl leading-tight tracking-tight text-[var(--color-charcoal)]">
                  {d.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-[var(--color-charcoal-soft)]">
                  {d.body}
                </p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
