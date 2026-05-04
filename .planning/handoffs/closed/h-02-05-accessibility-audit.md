---
id: h-02-05-accessibility-audit
projectid: 7greens
phase: "02"
task_id: "02-05"
created_at: 2026-05-04T22:44:00.000Z
created_by: g-1
claimed_by: team-g-1
claimed_at: 2026-05-04T22:56:11.544Z
completed_at: 2026-05-04T23:03:48.225Z
priority: medium
estimated_context: standard
risk: safe
time: standard
surface: local
---

# Task 02-05: Accessibility Audit — WCAG 2.1 AA Compliance

## Objective
Run automated accessibility audit and fix issues. Focus on color contrast (already verified), keyboard navigation, ARIA labels, form accessibility.

## Scope
- Run axe-core (or equivalent) automated audit on all home page sections
- Fix any accessibility violations found
- Verify keyboard navigation works on:
  - `SiteHeader` nav links and mobile menu
  - `GetOnTheList` form fields and submit button
  - `BoxesPreview` links
- Ensure all form inputs in `GetOnTheList` have proper `<label>` or `aria-label`
- Verify color contrast ratios meet WCAG AA (already done in RESEARCH.md; double-check)

## Acceptance Criteria
1. axe-core (or Lighthouse) reports 0 accessibility violations
2. Keyboard tab order is logical and visible (focus rings)
3. All interactive elements have accessible names (`aria-label` or `<label>`)
4. Form in `GetOnTheList` has proper error announcements (aria-live region)
5. `pnpm --filter 7greens build` exits 0

## Commands
```bash
# Lighthouse CI (if available) or manual Chrome DevTools Lighthouse
# Verify keyboard navigation manually in browser
```

## Output
Commit with message: `02-05: Fix accessibility issues for WCAG 2.1 AA compliance`

## Notes
- Color contrast already verified in RESEARCH.md Pitfall 3 (sage-text #5A6B3D, tan-text #8B6914)
- Focus rings should use `outline` with `var(--color-sage-deep)` color
- `GetOnTheList` already has `noValidate` on form — consider adding aria-live for errors
