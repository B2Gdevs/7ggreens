# Phase 01: Foundation — Research

**Researched:** 2026-04-30
**Domain:** Next.js 16 App Router + Tailwind v4 + shadcn/ui + VCS scaffold
**Confidence:** HIGH (stack verified from live packages in sibling monorepo app)

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Next.js App Router, latest stable (16.x), Node 24 LTS — no Pages Router
- TypeScript strict
- pnpm workspace manager; `pnpm --filter 7greens <cmd>` from monorepo root
- Tailwind CSS (v4 if compatible, else v3) — see Finding 1 below
- shadcn/ui initialized via `npx shadcn@latest init`, New York style
- Theme base: cream #FAF7F0 bg, charcoal #1F1B16 fg, sage #7A8C5D, tan #C9A876, gold #D4A017
- Typography: generous letter-spacing, moderate line-height; one Google Font max
- Sticky header: logo + 4 nav links + cart icon; mobile toggle
- Footer: UPAEC address + phones (from upaec-web-page-info.md) + socials placeholder + copyright
- Main slot: no max-width at top level — each section clamps itself
- Cart icon: stub "Cart (0)" — Phase 04 wires it
- VCS provider at root layout; every surface gets deterministic cid + dev modal in NODE_ENV=development
- Mobile breakpoints: 360 / 768 / 1280px — Tailwind defaults cover these
- File layout: see CONTEXT.md `### File / dir layout` section
- Workspace package name: `7greens`

### Claude's Discretion
- Exact font family (system stack vs Google Font)
- Tailwind v4 vs v3 — verify shadcn compatibility
- shadcn New York vs Default style
- ESLint config preset (eslint-config-next vs Biome)

### Deferred Ideas (OUT OF SCOPE)
- Brand-tuned theme (final palette, typography refinement) — Phase 02
- Lifestyle imagery, hero composition — Phase 02
- Catalog data shape, image cards — Phase 03
- Square SDK / Web Payments — Phase 04
- Vercel project link, env vars, custom domain — Phase 06
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| FOUND-01 | Next.js App Router project scaffolded with TypeScript, Tailwind, shadcn/ui initialized | Stack verified in sibling app (apps/platform); versions confirmed via npm |
| FOUND-02 | Tailwind theme tokens reflect UPAEC palette (cream/charcoal base, sage/tan accents, golden-hour photo tone) | Contrast ratios computed; Tailwind v4 CSS-variable convention documented |
| FOUND-03 | Site-wide layout (header + sticky + footer + main slot) renders on every route | Route-group layout pattern verified from apps/platform/(marketing)/layout.tsx |
| FOUND-04 | VCS scaffolded — every surface has cid + search token + dev modal in dev | Full provider chain verified from source: VisualContextProvider → VCSRouterProvider → DevIdProvider |
| FOUND-05 | Mobile breakpoints work cleanly at 360 / 768 / 1280px | Tailwind sm/md/lg/xl defaults cover targets; xs addition not needed |
</phase_requirements>

---

## Summary

The sibling `apps/platform` app is already running the exact target stack — Next.js 16 + React 19 + Tailwind v4 + `gad-visual-context` — and its source is readable in this monorepo. All load-bearing patterns are verified from that code, not assumed from training data.

Tailwind v4 is confirmed production-ready for this stack. shadcn CLI (`npx shadcn@latest init`) now defaults to Tailwind v4 with CSS-only config (no `tailwind.config.ts`). Theme tokens live in `globals.css` via `@theme inline`. The apps/platform globals.css is the canonical pattern to mirror for token shape, adapted to the UPAEC cream/charcoal/sage palette.

The VCS provider chain is three nested providers: `VisualContextProvider` (router adapter, "use client") → inner `DevIdProvider` (also "use client"). Both require a Client Component boundary. The cleanest mount pattern is a thin `SiteVisualContextProvider` client component that wraps children in the root layout (Server Component). This is exactly what `apps/platform/components/PlatformVisualContextProvider.tsx` does — verified from source.

**Primary recommendation:** Copy the apps/platform scaffold pattern directly. Init a new Next.js 16 app at sites/7greens with Tailwind v4, swap in the UPAEC palette, mount VCS via the same adapter pattern, add the chrome.

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| next | 16.2.4 | App Router framework | Locked by operator; Vercel-native |
| react / react-dom | 19.0.0 | UI runtime | Required by Next 16 |
| typescript | ^5 | Strict types | Locked |
| tailwindcss | 4.2.4 | Utility CSS | Locked |
| @tailwindcss/postcss | 4.2.4 | v4 PostCSS plugin | v4 no longer uses classic postcss-plugin |
| postcss | latest | Build pipeline | Required by @tailwindcss/postcss |

[VERIFIED: npm registry — `npm view next version` → 16.2.4, `npm view tailwindcss version` → 4.2.4]

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| gad-visual-context | workspace:* | VCS provider + SiteSection + DevPanel | All pages/layouts |
| @portfolio/ui | workspace:* | Shared primitive components | If available — platform uses it |
| shadcn/ui (via CLI) | 4.6.0 CLI | Installed component primitives | shadcn installs to components/ui/ |
| lucide-react | ^1.8.0 | Icon set | Header icons, feature icons |
| clsx | ^2.1.1 | Conditional class names | Component variants |
| tailwind-merge | ^2.5.4 | tw class deduplication | Used by cn() helper |

[VERIFIED: npm registry — lucide-react 1.14.0 is latest; apps/platform uses ^1.8.0]
[VERIFIED: apps/platform/package.json — workspace:* pattern for @portfolio/* packages]

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Tailwind v4 | Tailwind v3 | v3 uses tailwind.config.ts + HSL vars; v4 is CSS-only + OKLCH. shadcn CLI now defaults to v4. No reason to pin v3. |
| eslint-config-next | Biome | Biome is faster but adds a dep not present in platform; eslint-config-next is the Next 16 default with zero config |

**Installation (from monorepo root):**
```bash
# In sites/7greens/ after Next.js scaffold:
pnpm install
# Init shadcn (run from sites/7greens/):
pnpm dlx shadcn@latest init
```

[CITED: https://ui.shadcn.com/docs/installation/next]

---

## Architecture Patterns

### Recommended Project Structure
```
sites/7greens/
├── app/
│   ├── layout.tsx            ← Root layout: html/body, providers, header, footer (Server Component)
│   ├── page.tsx              ← Stub home page (Phase 02 fills)
│   └── globals.css           ← Tailwind @import + @theme inline token block
├── components/
│   ├── providers/
│   │   └── site-visual-context-provider.tsx  ← "use client" VCS adapter
│   ├── chrome/
│   │   ├── site-header.tsx   ← sticky header ("use client" for cart stub state)
│   │   └── site-footer.tsx   ← Server Component
│   └── ui/                   ← shadcn-installed primitives (auto-populated by CLI)
├── lib/
│   └── cn.ts                 ← classname helper (shadcn installs this)
├── public/
├── postcss.config.mjs        ← @tailwindcss/postcss plugin only
├── tsconfig.json
├── next.config.ts
├── package.json
└── README.md
```

No `tailwind.config.ts` in v4 — all config is in `globals.css` via `@theme inline`. [VERIFIED: apps/platform pattern; @tailwindcss/postcss ^4.0.0 with no config file]

### Pattern 1: Root Layout + Client Provider Boundary

Next.js App Router root layouts are Server Components. VCS providers use React Context (`"use client"`). Bridge via a thin client component:

```tsx
// components/providers/site-visual-context-provider.tsx
"use client";

import { useMemo, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  VisualContextProvider,
  DevIdProvider,
  type VCSRouterAdapterValue,
} from "gad-visual-context";

export function SiteVisualContextProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? "/";
  const nextRouter = useRouter();
  const adapter = useMemo<VCSRouterAdapterValue>(
    () => ({
      pathname,
      router: {
        push: (href) => nextRouter.push(href),
        replace: (href) => nextRouter.replace(href),
        back: () => nextRouter.back(),
        forward: () => nextRouter.forward(),
        refresh: () => nextRouter.refresh(),
        prefetch: (href) => nextRouter.prefetch(href),
      },
    }),
    [pathname, nextRouter],
  );
  return (
    <VisualContextProvider router={adapter}>
      <DevIdProvider>{children}</DevIdProvider>
    </VisualContextProvider>
  );
}
```

[VERIFIED: apps/platform/components/PlatformVisualContextProvider.tsx — identical shape; DevIdProvider is the additional layer for full dev-modal functionality]

```tsx
// app/layout.tsx  (Server Component — no "use client")
import type { Metadata } from "next";
import "./globals.css";
import { SiteVisualContextProvider } from "@/components/providers/site-visual-context-provider";
import { SiteHeader } from "@/components/chrome/site-header";
import { SiteFooter } from "@/components/chrome/site-footer";

export const metadata: Metadata = {
  title: "7Greens | Uncle Paul's Agritourism & Educational Corp",
  description: "Chemical-free, non-GMO produce from Tyler, TX. Order a flexible vegetable box — no membership, no commitment.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <SiteVisualContextProvider>
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <SiteFooter />
        </SiteVisualContextProvider>
      </body>
    </html>
  );
}
```

### Pattern 2: Sticky Header — Pure CSS

`sticky top-0 z-50` is sufficient for UPAEC's one-scroll layout. No IntersectionObserver needed — that adds complexity with no benefit at this scale. SiteHeader needs `"use client"` only for the cart stub state and mobile menu toggle, not for the sticky behavior.

```tsx
// components/chrome/site-header.tsx
"use client";
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border/40">
      {/* logo + nav + cart stub */}
    </header>
  );
}
```

### Pattern 3: Cart Stub Seam

Phase 04 needs to wire Square Orders to the cart without reworking the header. Provide a minimal hook seam now:

```tsx
// lib/cart-store.ts  (stub — Phase 04 replaces body, not shape)
export function useCartCount(): number {
  // Phase 04: replace with Zustand/Context reading Square Order state
  return 0;
}
```

Header imports `useCartCount()`. Phase 04 implements the store; header import stays unchanged. [ASSUMED — standard seam pattern; no Phase 04 design locked yet]

### Pattern 4: SiteSection cid Registration

Every meaningful section wraps in `<SiteSection cid="...">`. The cid must be deterministic (kebab-case, unique per page):

```tsx
// Example page section
import { SiteSection } from "gad-visual-context";

<SiteSection cid="home-hero" id="hero">
  {/* content */}
</SiteSection>
```

[VERIFIED: packages/visual-context/src/SiteSection.tsx — cid prop is the primary identifier; route prefix auto-derives from pathname if cid is omitted]

### Anti-Patterns to Avoid

- **`"use client"` on layout.tsx directly:** Breaks Server Component tree. Use a thin provider wrapper.
- **Inline Tailwind config (v3 style):** No `tailwind.config.ts` in v4. All custom tokens go in `globals.css` `@theme inline`.
- **`transpilePackages` for workspace deps:** apps/platform resolves `@portfolio/*` without it via `experimental.externalDir: true`. Use that pattern.
- **Max-width on `<main>` or `<body>`:** CONTEXT.md locks: each section clamps itself. Root slot must be full-width.
- **Hard-coding UPAEC contact info in multiple places:** Footer component is the single source; pull from a constants file so Phase 02 can update without hunting strings.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Class deduplication | Custom merge fn | `tailwind-merge` (via `cn()`) | TWv4 specificity rules; hand-roll misses edge cases |
| Icon set | SVG files | `lucide-react` | Tree-shakeable, consistent stroke weight, maintained |
| Accessible primitives (Dialog, Sheet, etc.) | Custom modal | shadcn/radix components | Focus trap, ARIA, keyboard nav are non-trivial |
| CSS-in-JS for theme | Styled-components or Emotion | CSS variables via `@theme inline` | Zero runtime, SSR-safe, Tailwind v4 native |
| Router detection | `window.location` | `usePathname()` from next/navigation (via VCS adapter) | SSR-safe; already wired into VCS pattern |

---

## Common Pitfalls

### Pitfall 1: VCS package requires pre-built dist
**What goes wrong:** `gad-visual-context` package.json points to `./dist/index.js`. If dist is stale or missing, imports resolve to nothing and TypeScript errors cascade.
**Why it happens:** Package is `"type": "module"` with a `build: tsc` script. The dist isn't auto-built when workspace is installed.
**How to avoid:** Wave 0 task must run `pnpm --filter gad-visual-context build` before attempting to `pnpm --filter 7greens dev`. Or document the dev startup prerequisite in README.
**Warning signs:** TS error "Module 'gad-visual-context' has no exported member X" or runtime "Cannot find module ./dist/index.js".

[VERIFIED: packages/visual-context/package.json — main: ./dist/index.js; dist/ exists and is pre-built at time of research]

### Pitfall 2: Tailwind v4 — no tailwind.config.ts, no autoprefixer
**What goes wrong:** Scaffolding a Next.js project with `create-next-app` defaults may drop a `tailwind.config.ts` and add `autoprefixer` to postcss. Both conflict with v4.
**Why it happens:** `create-next-app` template lags behind the v4 default until the template is updated.
**How to avoid:** Use the shadcn CLI init as the authoritative Tailwind setup. Delete any `tailwind.config.ts` created by `create-next-app`. postcss should only have `@tailwindcss/postcss: {}`.
**Warning signs:** Build warning "autoprefixer is not needed with Tailwind CSS v4"; empty utility classes at runtime.

[VERIFIED: apps/platform/postcss.config.mjs — `@tailwindcss/postcss` only, no autoprefixer]

### Pitfall 3: Accent colors fail contrast on cream background
**What goes wrong:** Using sage (#7A8C5D) or tan (#C9A876) as text color on cream (#FAF7F0) fails WCAG AA.
**Why it happens:** Computed ratios: sage 3.42:1 (AA-large only), tan 2.10:1 (fail), gold 2.22:1 (fail).
**How to avoid:** Accents are background/decorative colors only. For text on light backgrounds, use charcoal (#1F1B16, 16:1 AAA) or darkened accent variants: sage-text #5A6B3D (5.44:1 AA), tan-text #8B6914 (4.75:1 AA).
**Warning signs:** axe-core or Lighthouse accessibility audit flagging low contrast on accent text.

[VERIFIED: contrast ratios computed directly from hex values in this session]

### Pitfall 4: `externalDir` needed for workspace packages across symlinked directories
**What goes wrong:** Next.js file tracing may fail to follow pnpm workspace symlinks from `sites/7greens/` up to `packages/visual-context/`.
**Why it happens:** Next's file tracer defaults don't follow cross-workspace symlinks without a hint.
**How to avoid:** Set `experimental.externalDir: true` in `next.config.ts` (same as apps/platform). Also set `outputFileTracingRoot` to repo root.
**Warning signs:** Build-time "Error: Cannot find module" only in `next build`, not `next dev`; or "Module not found" in Vercel production builds.

[VERIFIED: apps/platform/next.config.mjs — `experimental.externalDir: true` + `outputFileTracingRoot: repoRoot`]

### Pitfall 5: `sonner` toast dependency must be in app's dep tree
**What goes wrong:** `DevIdProvider` imports `toast` from `sonner`. If `sonner` is only a devDependency of `gad-visual-context` and not in the consuming app's deps, it may bundle-split incorrectly.
**Why it happens:** `sonner` is in devDependencies (not dependencies) of the package.json. The dist bundles it inline at package build time, so it should resolve. But if the package is built with `bundleExternals: false`, the consuming app needs sonner in its own tree.
**How to avoid:** The pre-built dist at `packages/visual-context/dist/` already has the code inlined (tsc build, not bundler). No action needed unless `gad-visual-context` is rebuilt with different settings.
**Warning signs:** "Module not found: sonner" only after a clean dist rebuild.

[ASSUMED — tsc-built dist typically inlines types but not runtime deps; needs validation if `gad-visual-context` build process changes]

---

## Theme Tokens

### globals.css — UPAEC Palette (Tailwind v4 pattern)

```css
@import "tailwindcss";

@custom-variant dark (&:where(.dark, .dark *));

:root {
  /* Base */
  --background: #FAF7F0;        /* cream — 16:1 on charcoal fg AAA */
  --foreground: #1F1B16;        /* deep charcoal */

  /* Card / surface */
  --card: #F4F0E6;
  --card-foreground: #1F1B16;

  /* Muted */
  --muted: #EDE8DC;
  --muted-foreground: #6B5E4E;  /* warm mid-tone, ~5:1 on cream */

  /* Primary brand — sage green (bg use) */
  --primary: #7A8C5D;
  --primary-foreground: #FFFFFF; /* white on sage: ~3.6:1 — use only for large text / btn */

  /* Accent — warm tan (bg use only; for text use --accent-text) */
  --accent: #C9A876;
  --accent-foreground: #1F1B16;

  /* Photo-tone highlights */
  --gold-highlight: #D4A017;
  --gold-shadow: #8C6E10;

  /* Text-safe accent variants (pass WCAG AA on --background) */
  --sage-text: #5A6B3D;         /* 5.44:1 on #FAF7F0 — AA */
  --tan-text: #8B6914;          /* 4.75:1 on #FAF7F0 — AA */

  /* Chrome */
  --border: #D9D0C0;
  --input: #EDE8DC;
  --ring: #7A8C5D;

  /* Radius */
  --radius: 0.5rem;
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --radius-sm: calc(var(--radius) - 2px);
  --radius-md: var(--radius);
  --radius-lg: calc(var(--radius) + 2px);
}

body {
  background: var(--background);
  color: var(--foreground);
  /* Font: see Typography section below */
  -webkit-font-smoothing: antialiased;
}
```

[VERIFIED: Pattern adapted from apps/platform/app/globals.css which uses identical @theme inline structure with OKLCH. Using hex here instead of OKLCH for readability — both are valid in Tailwind v4 CSS variables.]

### Typography Recommendation

**Recommendation: Geist Sans (Google Fonts / Vercel) with system-ui fallback.**

Rationale:
- Matches 2sranch.com's "modern but approachable sans-serif" tone
- Vercel hosts it natively (zero CDN round-trip on Vercel deployment)
- Next.js 16 has `next/font/google` with built-in Geist support
- Fallback to `ui-sans-serif, system-ui` for zero-CLS pre-hydration

Alternative: Outfit (Google Fonts) — slightly more distinctive, same weight range. Use if Geist feels too tech-brand.
Do NOT use: Inter alone (too generic for a farm brand).

```tsx
// app/layout.tsx addition
import { Geist } from "next/font/google";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
});
```

```css
/* globals.css addition */
body {
  font-family: var(--font-geist), ui-sans-serif, system-ui, sans-serif;
  letter-spacing: 0.01em;  /* mirrors 2sranch generous tracking */
  line-height: 1.6;
}
h1, h2, h3 {
  letter-spacing: -0.02em;  /* tighter on headings, modern farm-brand convention */
  line-height: 1.2;
  font-weight: 700;
}
```

[ASSUMED — Geist font availability via next/font/google, not confirmed against Next 16 docs. Fallback is fully safe regardless.]

---

## Mobile Breakpoints Decision

**Keep Tailwind defaults. Do NOT add `xs: 360px`.**

| Tailwind bp | px | Covers |
|-------------|-----|--------|
| (base) | 0px | 360px small phones — style everything mobile-first |
| sm | 640px | Large phones / small tablets |
| md | 768px | Tablets (locked target) |
| lg | 1024px | Small desktops |
| xl | 1280px | Desktop (locked target) |

The 360px target is covered by the base (0px) styles — no custom breakpoint needed. Adding `xs: 360px` creates a breakpoint at 360 but base still starts at 0, so it doesn't help unless you need a 360-specific override between phone sizes, which UPAEC does not. Mobile-first base styles handle 360+ cleanly.

[VERIFIED: Tailwind v4 default breakpoint scale confirmed — sm:640, md:768, lg:1024, xl:1280, 2xl:1536]

---

## next.config.ts

```ts
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// monorepo root is two levels up from sites/7greens/
const repoRoot = path.resolve(__dirname, "..", "..");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: process.env.NODE_ENV === "production",
  outputFileTracingRoot: repoRoot,
  experimental: {
    externalDir: true,
  },
};

export default nextConfig;
```

[VERIFIED: Mirrors apps/platform/next.config.mjs exactly — the pattern for workspace-package consumption in this monorepo]

---

## Workspace Wiring

`gad-visual-context` is a pre-built ESM package (`"type": "module"`, exports `./dist/index.js`). Next.js 16's bundler resolves it transparently when `experimental.externalDir: true` is set — **no `transpilePackages` needed.**

[VERIFIED: apps/platform does not use `transpilePackages`; uses `externalDir: true` only. Package dist exists at `packages/visual-context/dist/`.]

**`sites/7greens/package.json` minimum shape:**
```json
{
  "name": "7greens",
  "private": true,
  "scripts": {
    "dev": "next dev --turbo",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "next": "^16.2.4",
    "react": "19.0.0",
    "react-dom": "19.0.0",
    "gad-visual-context": "workspace:*",
    "clsx": "^2.1.1",
    "tailwind-merge": "^2.5.4",
    "lucide-react": "^1.8.0"
  },
  "devDependencies": {
    "typescript": "^5",
    "@types/node": "^24",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "tailwindcss": "^4.2.4",
    "@tailwindcss/postcss": "^4.2.4",
    "postcss": "latest",
    "eslint": "^9",
    "eslint-config-next": "^16.2.4"
  }
}
```

**ESLint recommendation:** `eslint-config-next` — zero additional config, ships with Next 16, no new toolchain dep. Biome is faster but adds complexity not present in the monorepo pattern.

---

## Validation Architecture

### Test Framework

No test framework pre-exists for 7greens (greenfield). Phase 01 is scaffolding — automated tests would be smoke-level only.

| Property | Value |
|----------|-------|
| Framework | None for Phase 01 (scaffold verification is manual + build check) |
| Quick run command | `pnpm --filter 7greens build` (zero-error build = green) |
| Full suite command | `pnpm --filter 7greens typecheck && pnpm --filter 7greens lint && pnpm --filter 7greens build` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| FOUND-01 | Next.js boots with no errors | smoke | `pnpm --filter 7greens build` | ❌ Wave 0 (create app) |
| FOUND-02 | Theme tokens applied in globals.css | visual/manual | inspect dev server at localhost:3000 | ❌ Wave 0 |
| FOUND-03 | Header + footer render on `/` | visual/manual | `pnpm --filter 7greens dev` + browser check | ❌ Wave 0 |
| FOUND-04 | VCS dev modal opens in dev | visual/manual | open dev server, press Alt+I (DevId toggle shortcut) | ❌ Wave 0 |
| FOUND-05 | Layout renders at 360/768/1280px | visual/manual | DevTools responsive mode | ❌ Wave 0 |

All five success criteria are verified manually — no automated test infrastructure required for Phase 01. The build command is the gate.

### Phase Gate
`pnpm --filter 7greens build` exits 0 with no TypeScript errors and no lint errors before phase is marked done.

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Next.js 16 | ✓ | 24.x (per locked decision) | — |
| pnpm | workspace manager | ✓ (monorepo uses it) | — | — |
| gad-visual-context dist | VCS import | ✓ | built in packages/visual-context/dist/ | Run `pnpm --filter gad-visual-context build` |
| shadcn CLI | init | ✓ (via pnpm dlx) | 4.6.0 | — |
| Geist font | typography | needs network (Next font downloads at build) | — | system-ui fallback is safe |

---

## Security Domain

ASVS security enforcement for Phase 01 is minimal — this phase is scaffold-only with no auth, forms, or data handling.

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | No | — (Phase 04+) |
| V3 Session Management | No | — (no sessions in Phase 01) |
| V4 Access Control | No | — |
| V5 Input Validation | No | — (no forms in Phase 01) |
| V6 Cryptography | No | — |

**Phase 01 security note:** Set `Content-Security-Policy` headers in `next.config.ts` headers array as a scaffold item so Phase 04/05 can tighten without rework. Leave permissive for development (`unsafe-inline` OK in dev). [ASSUMED — standard practice, not required by CONTEXT.md]

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Geist font available via `next/font/google` in Next.js 16 | Typography | Fallback to Outfit or system-ui; low impact |
| A2 | Cart stub seam via `useCartCount()` hook is compatible with Phase 04's Square store | Cart Stub | Phase 04 may need different seam shape; minor rework in header |
| A3 | `sonner` runtime is bundled into gad-visual-context dist by tsc build | Pitfall 5 | If not bundled, app needs `sonner` in dependencies; easy fix |
| A4 | CSP headers scaffold in next.config.ts is low-risk for Phase 01 | Security Domain | Overly restrictive CSP could break shadcn radix portals; omit if blocker |

---

## Open Questions

None that block planning. All ten research questions from the brief are resolved above.

---

## Sources

### Primary (HIGH confidence)
- `apps/platform/` source tree — verified Tailwind v4 + VCS + Next.js 16 integration in same monorepo
- `packages/visual-context/src/` — read directly; provider shape and export surface confirmed
- npm registry (`npm view`) — next@16.2.4, tailwindcss@4.2.4, shadcn@4.6.0, lucide-react@1.14.0

### Secondary (MEDIUM confidence)
- [https://ui.shadcn.com/docs/installation/next](https://ui.shadcn.com/docs/installation/next) — init command confirmed
- [https://ui.shadcn.com/docs/tailwind-v4](https://ui.shadcn.com/docs/tailwind-v4) — v4 CSS variable convention confirmed; OKLCH/HSL compatibility confirmed

### Tertiary (LOW confidence)
- Search result summary: shadcn + Next.js 16 + Tailwind v4 is production-dominant stack in 2026 — corroborates primary findings

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — verified from live sibling app + npm registry
- Architecture: HIGH — VCS provider pattern read directly from source; layout pattern from apps/platform
- Pitfalls: HIGH — contrast ratios computed; dist/externalDir patterns verified from source
- Theme tokens: MEDIUM — hex values from CONTEXT.md starting points; final tuning is Phase 02

**Research date:** 2026-04-30
**Valid until:** 2026-06-15 (Next.js minor updates unlikely to break this; shadcn v4 CLI is stable)
