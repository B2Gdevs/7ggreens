---
id: h-02-01-rebrand
projectid: 7greens
phase: "02"
task_id: "02-01"
created_at: 2026-05-04T22:40:00.000Z
created_by: g-1
claimed_by: null
claimed_at: null
completed_at: null
priority: high
estimated_context: standard
risk: safe
time: standard
surface: local
---

# Task 02-01: Rebrand `7Greens` → `7G Greens`

## Objective
Update all UI copy, metadata, and constants to use "7G Greens" (with space) instead of "7Greens".

## Scope
- `lib/site/constants.ts` — update `brand` field
- `app/layout.tsx` — update metadata titles
- `components/chrome/SiteHeader.tsx` — update brand display
- `components/chrome/SiteFooter.tsx` — update brand display
- All section components in `components/sections/` — update any hardcoded "7Greens" references

## Exclusions
- Do NOT change Square catalog fallbacks or API-related code
- Do NOT modify `SITE.legalShort` ("UPAEC") or other acronyms

## Verification
```bash
# Should return no matches
grep -r "7Greens" sites/7greens/lib/ sites/7greens/components/ sites/7greens/app/

# Should find all brand references
grep -r "7G Greens" sites/7greens/lib/site/constants.ts
```

## Acceptance Criteria
1. `lib/site/constants.ts` `SITE.brand` equals "7G Greens"
2. No occurrence of "7Greens" (without space) in `sites/7greens/` source files
3. Site header renders "7G Greens" with space
4. `pnpm --filter 7greens build` exits 0

## Output
Commit with message: `02-01: Rebrand display name to '7G Greens'`
