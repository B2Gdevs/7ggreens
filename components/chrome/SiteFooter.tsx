import Link from "next/link";
import { SITE, NAV } from "@/lib/site/constants";
import { cid } from "@/lib/vcs/cid";

export function SiteFooter() {
  return (
    <footer
      data-cid={cid("site.footer")}
      className="grain-overlay relative bg-[var(--color-soil)] text-[var(--color-cream)]"
    >
      <div className="mx-auto max-w-[var(--content-max)] px-[var(--section-px)] py-20">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <p className="font-display text-3xl tracking-tight">
              <span className="text-[var(--color-tan)]">7</span>Greens
            </p>
            <p className="mt-4 text-sm leading-relaxed text-[var(--color-cream)]/75 max-w-md">
              {SITE.legalName} — chemical-free, non-GMO produce from {SITE.address.city}, {SITE.address.state}. Cold-chain delivered to {SITE.serviceArea}.
            </p>
            <p className="mt-6 eyebrow text-[var(--color-tan)]">Season {SITE.season}</p>
          </div>

          <div className="md:col-span-3" data-cid={cid("site.footer.contact")}>
            <p className="eyebrow text-[var(--color-cream)]/60">Visit</p>
            <p className="mt-3 text-sm leading-relaxed">
              {SITE.address.street}
              <br />
              {SITE.address.city}, {SITE.address.state} {SITE.address.zip}
            </p>
            <p className="mt-4 eyebrow text-[var(--color-cream)]/60">Call</p>
            <ul className="mt-3 space-y-1 text-sm tabular-nums">
              {SITE.phones.map((p) => (
                <li key={p}>
                  <a href={`tel:${p.replace(/[^0-9]/g, "")}`} className="hover:text-[var(--color-tan)]">
                    {p}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-4" data-cid={cid("site.footer.nav")}>
            <p className="eyebrow text-[var(--color-cream)]/60">Explore</p>
            <ul className="mt-3 grid grid-cols-2 gap-2 text-sm">
              {NAV.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="hover:text-[var(--color-tan)]">
                    {item.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/boxes" className="hover:text-[var(--color-tan)]">
                  Order a box →
                </Link>
              </li>
            </ul>
            <p className="mt-8 eyebrow text-[var(--color-cream)]/60">Promise</p>
            <p className="mt-3 text-sm italic text-[var(--color-cream)]/85">
              "If we wouldn't eat it, we won't sell it."
            </p>
          </div>
        </div>

        <hr className="mt-16 border-[var(--color-cream)]/10" />

        <div className="mt-6 flex flex-col gap-2 text-xs text-[var(--color-cream)]/55 md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} {SITE.legalShort}. All rights reserved.</p>
          <p>Founded {SITE.founded} · PSA-certified · Non-GMO · Regenerative</p>
        </div>
      </div>
    </footer>
  );
}
