# Phase 02: Home (Brand) — Plan

**Status:** Ready for execution
**Goal:** Story-led home page that mirrors the 2sranch.com aesthetic and makes UPAEC's differentiators legible in the first scroll.

**Context:** Home page is substantially complete with Hero, Differentiators, FounderStory, ColdChain, BoxesPreview, and GetOnTheList sections. Phase 02 tasks focus on brand refinements, rebranding, and preparing for later phases.

---

## Tasks

### 02-01: Rebrand display name `7Greens` → `7G Greens`
- **Status:** Planned
- **Priority:** High
- **Description:** Update all UI copy, metadata, and constants to use "7G Greens" (with space) instead of "7Greens". Touches: `lib/site/constants.ts`, `app/layout.tsx`, `components/chrome/SiteHeader.tsx`, `components/chrome/SiteFooter.tsx`, all section components.
- **Files:** `lib/site/constants.ts`, `app/layout.tsx`, `components/chrome/SiteHeader.tsx`, `components/chrome/SiteFooter.tsx`, `components/sections/*.tsx`
- **Verification:** `grep -r "7Greens" sites/7greens/` returns no matches; `grep -r "7G Greens" sites/7greens/` finds all brand references.

### 02-02: Verify build passes with zero errors
- **Status:** Planned
- **Priority:** High
- **Description:** Run full build, lint, and typecheck to ensure Phase 01 deliverables are solid before Phase 02 work begins.
- **Commands:** `pnpm --filter 7greens build`, `pnpm --filter 7greens lint`, `pnpm --filter 7greens typecheck`
- **Verification:** All three commands exit 0.

### 02-03: Photo optimization for 27 product catalog
- **Status:** Planned
- **Priority:** Medium
- **Description:** Audit the 27 product photos in `public/photos/produce/` for size, format, and loading performance. Optimize large images, ensure WebP/AVIF fallbacks where beneficial.
- **Files:** `public/photos/produce/`, `app/boxes/page.tsx` (gallery section)
- **Verification:** All product photos under 500KB; Lighthouse performance score >90.

### 02-04: SEO audit — meta tags, Open Graph, structured data
- **Status:** Planned
- **Priority:** Medium
- **Description:** Audit and enhance SEO: verify `app/layout.tsx` metadata, add structured data (JSON-LD) for Organization and Product, ensure Open Graph images render correctly.
- **Files:** `app/layout.tsx`, `app/opengraph-image.tsx`, create `app/structured-data.ts`
- **Verification:** Facebook Sharing Debugger and Google Rich Results Test pass; `grep -r "application/ld+json" sites/7greens/` finds structured data.

### 02-05: Accessibility audit — WCAG 2.1 AA compliance
- **Status:** Planned
- **Priority:** Medium
- **Description:** Run automated accessibility audit (axe-core) and fix issues. Focus on color contrast (already verified in RESEARCH.md), keyboard navigation, ARIA labels, form accessibility.
- **Files:** All section components, `components/chrome/SiteHeader.tsx`, `components/sections/GetOnTheList.tsx`
- **Verification:** axe-core reports 0 violations; keyboard navigation works on all interactive elements.

### 02-06: Mobile breakpoint verification across all sections
- **Status:** Planned
- **Priority:** Medium
- **Description:** Test all home page sections at 360px, 768px, and 1280px. Fix any overflow, text truncation, or layout issues.
- **Files:** All section components in `components/sections/`
- **Verification:** All sections render cleanly at 360px (small phone), 768px (tablet), 1280px (desktop) via DevTools responsive mode.

---

## Summary

Phase 02 refines the substantially-complete home page. Top priority: rebrand to "7G Greens" (02-01) and verify build health (02-02). Secondary tasks improve photo performance, SEO, accessibility, and mobile experience.

**Next phase dependency:** Phase 03 (Boxes Catalog) can start in parallel once 02-02 (build verification) passes.
