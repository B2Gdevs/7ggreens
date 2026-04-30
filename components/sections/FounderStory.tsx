import { FOUNDER_NARRATIVE } from "@/lib/site/constants";
import { cid } from "@/lib/vcs/cid";

export function FounderStory() {
  return (
    <section
      id="story"
      data-cid={cid("home.story")}
      className="py-[var(--section-py)]"
    >
      <div className="mx-auto max-w-[var(--content-max)] px-[var(--section-px)]">
        <div className="grid gap-16 md:grid-cols-12 md:gap-12">
          {/* Asymmetric portrait — abstract since no founder photo */}
          <div className="md:col-span-5 reveal">
            <div className="relative aspect-[4/5] w-full max-w-md">
              <div className="absolute inset-2 rotate-1 rounded-3xl bg-[var(--color-tan)]/20" />
              <div className="absolute inset-0 -rotate-1 overflow-hidden rounded-3xl bg-gradient-to-br from-[var(--color-soil)] to-[var(--color-sage-deep)] shadow-[0_24px_60px_rgba(60,45,30,0.2)]">
                <div
                  aria-hidden
                  className="absolute inset-0 opacity-30"
                  style={{
                    backgroundImage: "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.15), transparent 50%)",
                  }}
                />
                <div className="absolute inset-0 flex flex-col justify-end p-10 text-[var(--color-cream)]">
                  <p className="eyebrow text-[var(--color-tan)]">Founded 2019</p>
                  <p className="font-display mt-3 text-4xl leading-tight">
                    Uncle Paul
                  </p>
                  <p className="mt-3 text-sm text-[var(--color-cream)]/80">
                    Fruit, vegetables, chickens, agri-logistics — and a lifetime spent watching the land give back.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="md:col-span-7 reveal">
            <p className="eyebrow">Our story</p>

            <blockquote className="font-display-soft mt-6 text-[var(--color-sage-deep)]" style={{ fontSize: "var(--text-display-md)", lineHeight: 1.05 }}>
              "{FOUNDER_NARRATIVE.pullQuote}"
            </blockquote>

            <div className="mt-10 space-y-5 text-base leading-relaxed text-[var(--color-charcoal-soft)] md:text-lg">
              {FOUNDER_NARRATIVE.body.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>

            <div className="mt-10 inline-block rounded-2xl border-l-2 border-[var(--color-sage-deep)] bg-[var(--color-cream-soft)] px-6 py-4">
              <p className="font-display italic text-lg text-[var(--color-charcoal)]">
                If we wouldn't eat it, we won't sell it.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
