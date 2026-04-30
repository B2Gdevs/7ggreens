# Phase 01: Foundation — Context

**Gathered:** 2026-04-30
**Status:** Ready for planning
**Source:** Lifted from PROJECT.md + REQUIREMENTS.md + ROADMAP.md + decisions d-01..03 (no separate /gad:discuss-phase run — project-level decisions are already concrete)

<domain>
## Phase Boundary

Stand up the Next.js + shadcn + Tailwind + VCS scaffold for the 7greens site at `sites/7greens/` so all later phases (Brand, Catalog, Order Flow, Lead Capture, Launch) ship UI into a working application.

**In:** project initialization, dependency install, theme tokens reflecting UPAEC palette, layout shell (header + footer + main slot), VCS provider + dev-modal, mobile breakpoint baseline.

**Out:** any actual page content (Home goes in Phase 02), Square integration (Phase 04), production deploy (Phase 06).

</domain>

<decisions>
## Implementation Decisions

### Framework
- **Next.js App Router** (latest stable, Node 24 LTS) — locked. Vercel-native. No Pages Router.
- **TypeScript strict** — locked.
- **Bun or pnpm?** — pnpm. The parent monorepo uses pnpm workspaces and 7greens is workspace-linked to consume `gad-visual-context` and other packages. Bun toolchain is fine for build speed but pnpm is the install/workspace manager.
- **Package manager command surface in 7greens:** `pnpm install`, `pnpm dev`, `pnpm build`, `pnpm lint`. All run via `pnpm --filter 7greens <cmd>` from monorepo root.

### Styling
- **Tailwind CSS** (v4 if compatible, otherwise v3) — locked. shadcn/ui requires it.
- **shadcn/ui** initialized via `npx shadcn@latest init` with the New York style (cleaner alignment with 2sranch.com aesthetic) — to confirm during research.
- **Theme tokens** in `tailwind.config.ts` and CSS variables:
  - Background base: cream / off-white (#FAF7F0 starting point, refine in Phase 02)
  - Foreground: deep charcoal (#1F1B16 starting point)
  - Accent / brand-primary: sage green (#7A8C5D) and warm tan (#C9A876) — palette tuned later
  - Photo-tone: golden-hour warm (#D4A017 highlight, #8C6E10 shadow) for photo treatments
- **Typography:** sans-serif heading + body, generous letter-spacing, moderate line-height (mirror 2sranch.com). Specific font families to choose during research — preference for system-stack or one Google Font (Inter / Manrope / Outfit candidates).

### Layout
- **Sticky header:** logo (left), nav links (center or right: "Our Story", "Boxes", "Wholesale", "Contact"), cart icon (top-right). On mobile: logo + menu toggle.
- **Footer:** logo, address (10105 County Road 21, Tyler, TX 75707), phones, social (TBD — placeholder), copyright.
- **Main slot:** renders route content. No max-width clamp at the top level — each section decides its own clamp.
- **Cart icon:** stub for now (Phase 04 wires it up). Show an empty-cart count of 0.

### Visual Context System
- **Source:** `packages/visual-context/src/devid/` from the parent monorepo, consumed via `gad-visual-context` workspace import.
- **Mandate:** every page, layout, section, and major component gets a deterministic `cid` + searchable token. Dev modal accessible in NODE_ENV=development.
- **Skill to consult:** `scaffold-visual-context-surface` — scaffolds new dev-only surfaces under the VCS mandate.
- **Provider mounting:** in the root layout (`app/layout.tsx`), wrap the children in the VCS provider so every nested element can register.

### Mobile breakpoints
- **Targets:** 360px (small phone), 768px (tablet), 1280px (desktop). Tailwind's default breakpoints (sm/md/lg/xl) cover these.
- **Verification:** every layout chrome surface (header, footer, main slot) must render cleanly at all three widths.

### File / dir layout (proposed)
```
sites/7greens/
├── app/
│   ├── layout.tsx            ← root layout: providers, header, footer
│   ├── page.tsx              ← stub home (Phase 02 fills it)
│   └── globals.css           ← Tailwind directives + theme CSS variables
├── components/
│   ├── chrome/
│   │   ├── header.tsx
│   │   └── footer.tsx
│   └── ui/                   ← shadcn-installed primitives go here
├── lib/
│   └── cn.ts                 ← classname helper from shadcn
├── public/                   ← static assets (logos, icons)
├── tailwind.config.ts
├── postcss.config.mjs
├── tsconfig.json
├── next.config.ts
├── package.json
└── README.md
```

### Workspace wiring
- `package.json` name: `7greens`
- Dependencies: `next`, `react`, `react-dom`, `gad-visual-context` (workspace:*), `@portfolio/ui` (workspace:* — if applicable), `tailwindcss`, `clsx`, `tailwind-merge`, `lucide-react`
- Dev deps: `typescript`, `@types/node`, `@types/react`, `@types/react-dom`, `eslint`, `eslint-config-next`, `postcss`, `autoprefixer`
- Scripts: `dev`, `build`, `start`, `lint`, `typecheck`

### Claude's Discretion
- Exact font family choice (system stack vs Google Font) — researcher to recommend
- Whether to use Tailwind v4 (latest, faster, but newer) or v3 (stable, more compatible with shadcn defaults) — researcher to verify shadcn compatibility
- Whether to use shadcn New York vs Default style — researcher to recommend based on 2sranch palette
- ESLint config preset choice (eslint-config-next vs Biome) — researcher's call

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project context
- `sites/7greens/.planning/PROJECT.md` — what 7greens is, who it's for, core value
- `sites/7greens/.planning/REQUIREMENTS.md` — 32 v1 requirements (this phase covers FOUND-01..05)
- `sites/7greens/.planning/ROADMAP.md` — Phase 01 success criteria

### Research / source material
- `sites/7greens/.planning/research/copy/upaec-web-page-info.md` — main landing copy (read for tone)
- `sites/7greens/.planning/research/copy/field-to-family.md` — cold-chain brand statement
- `sites/7greens/.planning/research/style/2sranch-reference.md` — visual style reference (palette, typography, section rhythm) for theme decisions

### VCS
- `packages/visual-context/src/devid/` (parent monorepo) — source for the VCS provider, dev modal, cid generator. All used via `gad-visual-context`.
- Skill: `scaffold-visual-context-surface` — workflow for adding a VCS-instrumented surface

### Vercel-flavor docs (consult during research, not required reading for executor)
- Skill: `vercel:nextjs` — App Router patterns
- Skill: `vercel:shadcn` — shadcn install + theming on Vercel
- Skill: `vercel:next-cache-components` — Next.js 16 cache components (might affect layout decisions)

### Parent monorepo
- `pnpm-workspace.yaml` — `sites/*` is registered (committed today, parent commit `b7c10f1`)
- `CLAUDE.md` (parent root) — military-brevity communication style, lane discipline notes

</canonical_refs>

<specifics>
## Specific Ideas

- Use shadcn's `init` with --yes-defaults where possible to keep this phase tight; theme tuning belongs in Phase 02.
- Header should be ready for a "Cart (0)" pill that Phase 04 will wire up. Stub the slot now so Phase 04 isn't blocked.
- Footer should already include the real UPAEC address + phones from `upaec-web-page-info.md` (saves Phase 02 from doing it).
- VCS provider must be in the ROOT layout, not per-page. Every cid registration must reach the global registry.

</specifics>

<deferred>
## Deferred Ideas

- Brand-tuned theme (final palette, typography refinement) — Phase 02
- Lifestyle imagery, hero composition — Phase 02
- Catalog data shape, image cards — Phase 03
- Square SDK / Web Payments — Phase 04
- Vercel project link, env vars, custom domain — Phase 06

</deferred>

---

*Phase: 01-foundation*
*Context gathered: 2026-04-30 — direct lift from project-level docs (no /gad:discuss-phase run)*
