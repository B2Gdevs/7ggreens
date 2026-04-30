# 7Greens (UPAEC)

## What This Is

A brand + commerce landing site for **Uncle Paul's Agritourism & Educational Corp (UPAEC)**, a chemical-free / non-GMO produce farm in Tyler, Texas serving East Texas and Dallas–Fort Worth under the **7Greens** consumer brand. Two routes for v1: home (story + boxes preview) and /boxes (full catalog + order flow). Lives at `sites/7greens/` as a git submodule of the parent monorepo and ships independently to Vercel.

## Core Value

**Order a flexible vegetable box from a farm you can trust — no membership, no commitment, real cold-chain.** UPAEC's primary differentiator vs CSAs is the order-as-needed model with PSA-certified mobile cold-chain delivery; the site must make that promise believable in the first scroll.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Story-led home page in 2sranch.com aesthetic (hero, why, founder narrative, CTA, footer)
- [ ] /boxes catalog with Starter ($25 / 6 items) + Family ($35 / 9 items) + Order Extra ($5/lb add-ons)
- [ ] Square-backed order flow (Customer + Order + Payment)
- [ ] Lead-capture / contact form with Square Customer creation
- [ ] Visual Context System on every UI surface (cids, search tokens, dev modal)
- [ ] Vercel deployment with custom domain, env management, BotID + Vercel Analytics
- [ ] Mobile-responsive across all routes

### Out of Scope (v1)

- User authentication / accounts — orders submit via Square Customers; no login required
- Subscription / CSA model — explicit anti-feature; UPAEC's differentiator is *no* subscription
- Wholesale portal — separate phase if/when wholesale tier defined
- Pickup-point geography UI (live zip lookup) — defer until pickup network is finalized; v1 ships static list
- Multi-language — English only
- Blog / events calendar — narrative integrated into Home; full content section later
- Real-time inventory — produce is picked after pre-order, so the site doesn't need stock tracking
- Wholesale ordering / chef portal — flagged as v2 candidate if demand surfaces

## Context

- **UPAEC operations:** Farm at 10105 County Road 21, Tyler, TX 75707. Phones 817/501-0822, 469/631-8611. Founded 2019. PSA-certified, mobile cold-chain (walk-in cooler + refrigerated delivery truck). Non-GMO, no chemical/synthetic pesticides, regenerative practice.
- **Sales window:** June–September 2026 season. Site needs to be live before June for pre-orders.
- **Photo asset state:** 27 SKU-style product photos extracted from source `.docx` files into `.planning/research/copy/assets/`. Documentary lifestyle imagery (farm/people/golden hour, like 2sranch.com) does not yet exist — flagged as a v1 asset gap.
- **Brand tone:** direct, conversational, values-driven. Tagline candidate cadence: "Healthy Land. Healthy Greens. Healthy People."
- **Source material:** Three `.docx` files provided by the operator are extracted to `.planning/research/copy/`:
  - `upaec-web-page-info.md` — full landing copy (welcome / about / who / what / practices / contact + box catalog)
  - `field-to-family.md` — cold-chain brand statement
  - `web-photos.md` — product SKU list with 25 embedded photos
- **Visual reference:** `.planning/research/style/2sranch-reference.md` documents the rustic-heritage / photo-led aesthetic operator wants to mirror.
- **VCS skills:** `gad-visual-context-system`, `gad-visual-context-panel-identities`, and `scaffold-visual-context-surface` are mandatory companions during UI work — every section gets a deterministic cid + search token.

## Constraints

- **Tech stack**: Next.js App Router (latest, Node 24 LTS) — anchor framework, default for Vercel deployments
- **UI library**: shadcn/ui + Tailwind CSS — operator preference, fastest path to high-quality primitives
- **Hosting**: Vercel (Fluid Compute) — operator choice; aligns with Next.js + AI Gateway + BotID + Analytics
- **Commerce**: Square SDK (Customers + Orders + Payments) — operator choice; UPAEC already uses Square downstream
- **VCS mandate**: Visual Context System on every visual surface (memory: "Visual Context System mandatory for all GUI"). Source: `packages/visual-context` in the parent monorepo, consumed via pnpm workspace today; npm-publish on parallel track to enable future standalone-repo split (decision below).
- **Repo topology**: `sites/7greens/` is a submodule of `B2Gdevs/get-anything-done-monorepo`. Has its own remote `B2Gdevs/7ggreens`, ships to Vercel independently, but workspace-links to monorepo packages.
- **No public npm publishing of GAD** (parent-monorepo decision gad-188 #1) — does not constrain @portfolio/visual-context, which has its own publish track if/when needed.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Home + /boxes (2 routes) for v1, not single-page | Catalog with 27 photos overwhelms a single-scroll home; splitting keeps Home brand-led | — Pending |
| Primary CTA = "Order a box" (not lead capture) | Operator chose live commerce in v1; lead-capture is secondary path | — Pending |
| Story-led hero (2sranch-mirrored) | Brand authenticity is the differentiator vs commodity-grocery competitors | — Pending |
| Use existing 27 product photos + flag lifestyle gap | Don't block launch on photo shoot; document asset gap, source stock or commission later | — Pending |
| No auth in v1 | Square Customer creation is enough for orders; site-side auth adds work without v1 user value | — Pending |
| Submodule (own repo) inside monorepo (workspace-linked) | Operator preference for own repo + monorepo package consumption; future-proof for npm-published packages | ✓ Good |
| Skip 4-agent generic domain research | We have the operator-provided brief + a precise visual reference; generic "leafy-greens marketplace" research adds tokens without value | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gad:transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gad:complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-04-30 after initialization*
