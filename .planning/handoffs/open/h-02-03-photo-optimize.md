---
id: h-02-03-photo-optimize
projectid: 7greens
phase: "02"
task_id: "02-03"
created_at: 2026-05-04T22:42:00.000Z
created_by: g-1
claimed_by: null
claimed_at: null
completed_at: null
priority: medium
estimated_context: standard
risk: safe
time: standard
surface: local
---

# Task 02-03: Photo Optimization for 27 Product Catalog

## Objective
Audit and optimize the 27 product photos in `public/photos/produce/` for size, format, and loading performance.

## Scope
- Audit all 27 product photos (web-photos-01 through web-photos-27, some .png)
- Check file sizes; optimize any >500KB
- Ensure WebP/AVIF fallbacks where beneficial (Next.js Image component handles this automatically)
- Verify `app/boxes/page.tsx` gallery section renders optimized images

## Commands
```bash
# Check file sizes
ls -lh "C:/Users/benja/Documents/custom_portfolio/sites/7greens/public/photos/produce/"

# Count files
ls "C:/Users/benja/Documents/custom_portfolio/sites/7greens/public/photos/produce/" | wc -l
```

## Acceptance Criteria
1. All product photos under 500KB (compress if larger)
2. Images use appropriate format (JPEG for photos, PNG only if transparency needed)
3. `app/boxes/page.tsx` gallery uses `loading="lazy"` on images (already done)
4. No broken image links in `/boxes` catalog page

## Output
Commit with message: `02-03: Optimize product catalog photos for performance`

## Notes
- Do NOT use PayloadCMS (operator standing rule 2026-05-04)
- Next.js Image component optimizes automatically; focus on source file sizes
- 27 photos are already referenced in `lib/site/constants.ts` PRODUCT_CATALOG_FALLBACK
