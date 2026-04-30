import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Identified } from "gad-visual-context";
import { SITE } from "@/lib/site/constants";

export function Hero() {
  return (
    <Identified
      as="hero"
      cid="home.hero"
      tag="section"
      className="grain-overlay relative overflow-hidden"
    >
      {/* Decorative asymmetric backdrop */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="hero-orb hero-orb-sage absolute -top-40 -right-32 h-[640px] w-[640px] rounded-full bg-[var(--color-sage)]/12 blur-3xl" />
        <div className="hero-orb hero-orb-tan absolute top-40 -left-24 h-[420px] w-[420px] rounded-full bg-[var(--color-tan)]/12 blur-3xl" />
        <svg
          className="absolute bottom-0 left-0 right-0 w-full"
          viewBox="0 0 1440 120"
          preserveAspectRatio="none"
          aria-hidden
        >
          <path
            d="M0,60 C240,100 480,20 720,40 C960,60 1200,100 1440,40 L1440,120 L0,120 Z"
            fill="var(--color-cream-soft)"
          />
        </svg>
      </div>

      <div className="mx-auto grid max-w-[var(--content-max)] gap-12 px-[var(--section-px)] py-[var(--section-py)] md:grid-cols-12 md:gap-8 md:py-32">
        <div className="md:col-span-7 lg:col-span-7" data-cid="home.hero.headline">
          <p className="eyebrow reveal">Field to family - Tyler, Texas</p>

          <h1
            className="font-display mt-6 leading-[0.95] text-[var(--color-charcoal)] reveal"
            style={{ fontSize: "var(--text-display-xl)" }}
          >
            Healthy Land.
            <br />
            <span className="font-display-soft text-[var(--color-sage-deep)]">Healthy Greens.</span>
            <br />
            Healthy People.
          </h1>

          <p className="mt-8 max-w-xl text-lg leading-relaxed text-[var(--color-charcoal-soft)] reveal">
            Chemical-free, non-GMO vegetable boxes from a working farm in East Texas - picked after you order, cold-chain delivered to your pickup point. No subscription, no commitment.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-4 reveal">
            <Link href="/boxes" className="btn-primary">
              Order a box
              <ArrowRight size={16} strokeWidth={2} />
            </Link>
            <Link href="#cold-chain" className="btn-secondary">
              How it works
            </Link>
          </div>

          <p className="mt-12 max-w-md text-sm text-[var(--color-charcoal-muted)] reveal">
            Season runs <span className="font-medium">{SITE.season}</span>. Serving {SITE.serviceArea}.
          </p>
        </div>

        <div className="md:col-span-5 lg:col-span-5 reveal" data-cid="home.hero.visual">
          <HeroPhotoStack />
        </div>
      </div>
    </Identified>
  );
}

function HeroPhotoStack() {
  return (
    <div className="hero-photo-stack relative aspect-[4/5] w-full">
      <div className="absolute inset-x-8 inset-y-4 -rotate-3 rounded-2xl bg-[var(--color-sage)]/15 ring-1 ring-[var(--color-sage)]/20" />
      <div className="absolute inset-x-4 top-12 bottom-2 rotate-2 overflow-hidden rounded-2xl shadow-[0_24px_60px_rgba(60,55,40,0.18)] ring-1 ring-black/10">
        <img
          src="/photos/produce/web-photos-03.jpeg"
          alt="Fresh hibiscus and curly mustard greens"
          className="hero-photo-stack__photo h-full w-full object-cover"
        />
      </div>
      <div className="absolute right-0 bottom-8 h-2/3 w-2/3 -rotate-1 overflow-hidden rounded-2xl shadow-[0_28px_70px_rgba(60,55,40,0.22)] ring-1 ring-black/10">
        <img
          src="/photos/brand/field-to-family-01.jpeg"
          alt="Field-to-family cold chain"
          className="hero-photo-stack__photo hero-photo-stack__photo-front h-full w-full object-cover"
        />
      </div>
      <div className="absolute -left-2 top-2 rounded-full bg-[var(--color-cream)] px-4 py-2 shadow-md ring-1 ring-black/10">
        <span className="eyebrow">PSA-certified - cold-chain</span>
      </div>
    </div>
  );
}
