---
id: h-02-02-build-verify
projectid: 7greens
phase: "02"
task_id: "02-02"
created_at: 2026-05-04T22:41:00.000Z
created_by: g-1
claimed_by: null
claimed_at: null
completed_at: null
priority: high
estimated_context: bounded
risk: safe
time: standard
surface: local
---

# Task 02-02: Verify Build Passes with Zero Errors

## Objective
Run full build, lint, and typecheck to ensure Phase 01 deliverables are solid before Phase 02 work begins.

## Commands
```bash
cd "C:/Users/benja/Documents/custom_portfolio"

# Build
pnpm --filter 7greens build

# Lint
pnpm --filter 7greens lint

# Typecheck
pnpm --filter 7greens typecheck
```

## Acceptance Criteria
1. `pnpm --filter 7greens build` exits 0
2. `pnpm --filter 7greens lint` exits 0
3. `pnpm --filter 7greens typecheck` exits 0
4. No TypeScript errors in `sites/7greens/` source

## Output
Commit with message: `02-02: Verify build/lint/typecheck all pass` (only if fixes were needed; otherwise mark task complete without commit)

## Notes
- If build fails, diagnose and fix the issue before proceeding to other Phase 02 tasks
- This is a prerequisite for all other Phase 02 tasks
