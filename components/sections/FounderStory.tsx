import { Identified } from "gad-visual-context";
import { FOUNDER_NARRATIVE } from "@/lib/site/constants";

export function FounderStory() {
  return (
    <Identified
      as="founder-story"
      cid="home.story"
      tag="section"
      className="py-[var(--section-py)]"
    >
      <div className="mx-auto max-w-[var(--content-max)] px-[var(--section-px)]">
        <div className="grid gap-16 md:grid-cols-12 md:gap-12">
          <div className="md:col-span-5 reveal">
            <div className="relative mx-auto aspect-[4/5] w-full max-w-md">
              <div className="absolute inset-x-6 inset-y-5 rotate-[3deg] rounded-[2rem] bg-[var(--color-tan)]/18" />
              <div className="absolute left-2 top-10 h-[76%] w-[68%] -rotate-[5deg] overflow-hidden rounded-[2rem] shadow-[0_24px_70px_rgba(60,45,30,0.2)] ring-1 ring-black/10">
                <img
                  src="/photos/brand/field-to-family-01.jpeg"
                  alt="7Greens harvest team working the field"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="absolute right-0 top-0 h-[52%] w-[46%] rotate-[6deg] overflow-hidden rounded-[1.75rem] shadow-[0_18px_50px_rgba(60,45,30,0.18)] ring-1 ring-black/10">
                <img
                  src="/photos/brand/field-to-family-02.png"
                  alt="Fresh greens packaged for field-to-family delivery"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="absolute bottom-6 right-8 h-[28%] w-[38%] -rotate-[7deg] overflow-hidden rounded-[1.5rem] border-[6px] border-[var(--color-cream)] shadow-[0_18px_40px_rgba(60,45,30,0.16)]">
                <img
                  src="/photos/produce/web-photos-18.png"
                  alt="Close-up of fresh leafy greens"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="absolute left-6 top-3 rounded-full bg-[var(--color-cream)] px-4 py-2 shadow-md ring-1 ring-black/10">
                <span className="eyebrow">Founded 2019</span>
              </div>
              <div className="absolute bottom-0 left-10 max-w-[14rem] rounded-[1.5rem] bg-[rgba(250,246,238,0.92)] px-5 py-4 shadow-lg ring-1 ring-black/8 backdrop-blur-sm">
                <p className="font-display text-2xl leading-tight text-[var(--color-charcoal)]">
                  Uncle Paul
                </p>
                <p className="mt-2 text-sm leading-relaxed text-[var(--color-charcoal-soft)]">
                  Fruit, vegetables, chickens, agri-logistics, and a lifetime spent watching the land give back.
                </p>
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
    </Identified>
  );
}
