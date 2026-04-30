import { COLD_CHAIN } from "@/lib/site/constants";
import { cid } from "@/lib/vcs/cid";
import { Snowflake, Truck, Box, Clock } from "lucide-react";

const STEPS = [
  { label: "Pick", body: "Harvested only after pre-order to reduce waste.", icon: Box },
  { label: "Cool", body: "Into the walk-in cooler within an hour.", icon: Snowflake },
  { label: "Pack", body: "PSA-certified packaging, sealed cold.", icon: Clock },
  { label: "Deliver", body: "Refrigerated truck to your pickup point.", icon: Truck },
];

export function ColdChain() {
  return (
    <section
      id="cold-chain"
      data-cid={cid("home.cold-chain")}
      className="grain-overlay relative overflow-hidden bg-[var(--color-soil)] text-[var(--color-cream)]"
    >
      <div aria-hidden className="pointer-events-none absolute inset-0 opacity-30">
        <div className="absolute top-0 left-1/4 h-96 w-96 rounded-full bg-[var(--color-tan)]/10 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-[var(--color-sage)]/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-[var(--content-max)] px-[var(--section-px)] py-[var(--section-py)]">
        <div className="grid gap-16 md:grid-cols-12 md:gap-8">
          <div className="md:col-span-5 reveal">
            <p className="eyebrow text-[var(--color-tan)]">From field to family</p>
            <h2
              className="font-display mt-4 leading-[1.02] text-[var(--color-cream)]"
              style={{ fontSize: "var(--text-display-lg)" }}
            >
              {COLD_CHAIN.headline}
            </h2>

            <div className="mt-8 space-y-4 text-base leading-relaxed text-[var(--color-cream)]/80">
              {COLD_CHAIN.body.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>

            <p className="mt-10 inline-flex rounded-full border border-[var(--color-tan)]/40 bg-[var(--color-tan)]/10 px-5 py-2 text-sm font-medium text-[var(--color-tan)]">
              {COLD_CHAIN.promise}
            </p>
          </div>

          <div className="md:col-span-7" data-cid={cid("home.cold-chain.steps")}>
            <div className="grid gap-6 sm:grid-cols-2 reveal-stagger">
              {STEPS.map((s, i) => {
                const Icon = s.icon;
                return (
                  <article
                    key={s.label}
                    className="rounded-3xl border border-[var(--color-cream)]/15 bg-[var(--color-cream)]/[0.04] p-6 backdrop-blur-sm"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-display text-[var(--color-tan)] text-3xl tabular-nums">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <Icon size={20} strokeWidth={1.4} className="text-[var(--color-cream)]/70" />
                    </div>
                    <h3 className="font-display mt-4 text-2xl text-[var(--color-cream)]">
                      {s.label}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-[var(--color-cream)]/65">
                      {s.body}
                    </p>
                  </article>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
