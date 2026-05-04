---
id: h-02-04-seo-audit
projectid: 7greens
phase: "02"
task_id: "02-04"
created_at: 2026-05-04T22:43:00.000Z
created_by: g-1
claimed_by: team-g-1
claimed_at: 2026-05-04T23:14:42.262Z
completed_at: null
priority: medium
estimated_context: standard
risk: safe
time: standard
surface: local
---

# Task 02-04: SEO Audit — Meta Tags, Open Graph, Structured Data

## Objective
Audit and enhance SEO: verify metadata, add structured data (JSON-LD), ensure Open Graph images render correctly.

## Scope
- Verify `app/layout.tsx` metadata is complete (title, description, keywords, openGraph)
- Check `app/opengraph-image.tsx` renders correct OG image
- Create `app/structured-data.ts` with JSON-LD for:
  - Organization (UPAEC)
  - LocalBusiness (farm address, phones)
  - Product (vegetable boxes)
- Verify `app/robots.ts` and `app/sitemap.ts` are configured

## Acceptance Criteria
1. `app/layout.tsx` has complete metadata object
2. `app/structured-data.ts` exists with Organization and LocalBusiness schema
3. Facebook Sharing Debugger shows correct OG tags (manual verification)
4. `grep -r "application/ld+json" sites/7greens/app/` finds structured data
5. `pnpm --filter 7greens build` exits 0

## Output
Commit with message: `02-04: Enhance SEO with structured data and meta tags`

## References
- `app/layout.tsx` — current metadata
- `app/opengraph-image.tsx` — OG image
- `lib/site/constants.ts` — SITE object with address, phones, brand
