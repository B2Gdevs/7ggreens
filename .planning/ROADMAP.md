# Roadmap: 7Greens (UPAEC)

**Created:** 2026-04-30
**Project:** 7greens
**Goal:** Ship Home + /boxes commerce-enabled landing site by 2026-06-01 (start of harvest season)

## Phase Overview

| # | Phase | Goal | Requirements | Success Criteria | UI hint |
|---|-------|------|--------------|------------------|---------|
| 1 | Foundation | Next.js + shadcn + Tailwind + VCS scaffold + theme + base layout | FOUND-01..05 | 5 | yes |
| 2 | Home (Brand) | Story-led home page with hero, why, founder, cold-chain, boxes preview, footer | BRAND-01..06 | 6 | yes |
| 3 | /boxes Catalog | Box cards + product grid + Order Extra section using extracted SKU photos | CAT-01..04 | 4 | yes |
| 4 | Order Flow | Square Customer + Order + Payment integration with confirmation + webhook | ORDER-01..07 | 7 | yes |
| 5 | Lead Capture / Contact | Contact form, "Get on the list", BotID, newsletter opt-in | CONTACT-01..04 | 4 | yes |
| 6 | Launch | Vercel project link, env vars, custom domain, analytics, sandbox→prod smoke | INFRA-01..06 | 6 | no |

## Phase Details

### Phase 1: Foundation

**Goal:** Stand up the Next.js + shadcn + Tailwind + VCS scaffold so all later phases ship UI into a working site.

**Requirements:** FOUND-01, FOUND-02, FOUND-03, FOUND-04, FOUND-05

**Success criteria:**
1. `pnpm --filter 7greens dev` boots a Next.js dev server with no errors
2. `pnpm --filter 7greens build` succeeds with no errors
3. shadcn `npx shadcn@latest init` completed; theme tokens applied (palette + typography)
4. Layout (header + footer + main slot) renders on `/` with placeholder content
5. Visual Context System provider mounted at root; pressing the dev keybind in NODE_ENV=development opens the cid inspector modal showing at least the layout and main-slot cids

**UI hint:** yes

### Phase 2: Home (Brand)

**Goal:** Ship a story-led home page that mirrors the 2sranch.com aesthetic and makes UPAEC's differentiators legible in the first scroll.

**Requirements:** BRAND-01, BRAND-02, BRAND-03, BRAND-04, BRAND-05, BRAND-06

**Success criteria:**
1. Hero section with full-bleed lifestyle imagery (placeholder OK), tagline overlay, and dual CTA renders at `/`
2. "The 7Greens Difference" 4-column feature row with icons + headline + caption per column
3. Founder origin story section with portrait + narrative + pull-quote
4. Cold-chain explainer section sourced from `field-to-family.md` content
5. Boxes preview block links to `/boxes`
6. Footer with address, phone numbers, social, and copyright; sticky header navigation works on scroll

**UI hint:** yes

### Phase 3: /boxes Catalog

**Goal:** Render the full box catalog with the 27 product photos already in `.planning/research/copy/assets/`, plus the "Order Extra" $5/lb add-on section.

**Requirements:** CAT-01, CAT-02, CAT-03, CAT-04

**Success criteria:**
1. `/boxes` route renders Starter and Family box cards with prices, item counts, item lists, and photos
2. Product grid below boxes shows every SKU from `web-photos.md` with the correct extracted photo
3. "Order Extra" section lists all $5/lb add-ons with consistent card styling
4. Each box card has an "Order this box" CTA that routes into the order flow (stub if Phase 4 not yet shipped)

**UI hint:** yes

### Phase 4: Order Flow

**Goal:** Wire up Square Customer + Order + Payments end-to-end with confirmation and webhook reconciliation.

**Requirements:** ORDER-01, ORDER-02, ORDER-03, ORDER-04, ORDER-05, ORDER-06, ORDER-07

**Success criteria:**
1. Customer form creates a Square Customer in sandbox; record visible in Square dashboard
2. Cart summary route shows selected items, subtotal, fees, total
3. Square Web Payments SDK collects card on the client; nonce is sent to server
4. Server creates Square Order linked to Customer and charges the card; returns confirmation
5. Confirmation page shows order ID, items, total, expected pickup window, and contact info
6. Confirmation email is delivered to the test address (Square or Resend — decided during phase)
7. Webhook endpoint receives Square payment events and updates order state; verified end-to-end in sandbox

**UI hint:** yes

### Phase 5: Lead Capture / Contact

**Goal:** Capture pre-launch leads and ongoing inquiries via Square Customer creation; protect forms from bots.

**Requirements:** CONTACT-01, CONTACT-02, CONTACT-03, CONTACT-04

**Success criteria:**
1. "Get on the list" form on Home and footer creates a Square Customer with a `lead` tag in sandbox
2. Contact info surface (address, phones, hours) accessible from footer; matches data in PROJECT.md / `upaec-web-page-info.md`
3. Vercel BotID is enabled on form submissions; bot test traffic is blocked
4. Newsletter opt-in checkbox writes the choice to a Square Customer custom attribute

**UI hint:** yes

### Phase 6: Launch

**Goal:** Production deploy with custom domain, env management, analytics, and a real sandbox→prod smoke before flipping live.

**Requirements:** INFRA-01, INFRA-02, INFRA-03, INFRA-04, INFRA-05, INFRA-06

**Success criteria:**
1. Vercel project linked to `B2Gdevs/7ggreens` main; preview deploys triggered by PRs
2. All Square + Vercel env vars configured per environment (sandbox in preview, production in production)
3. Custom domain (TBD) resolves to the Vercel deployment with valid TLS
4. Vercel Analytics + Speed Insights are enabled and reporting
5. Square production credentials present only in `production` env; sandbox in `preview`
6. End-to-end smoke: place a sandbox order from the live preview URL; Square dashboard shows the Customer + Order; webhook fires; confirmation email arrives

**UI hint:** no

## Coverage

- 32 v1 requirements
- All mapped to a single phase
- 0 unmapped ✓

## Dependencies

- Phase 2 depends on Phase 1 (scaffold + VCS provider)
- Phase 3 depends on Phase 1 (scaffold + theme)
- Phase 4 depends on Phase 3 (catalog feeds the order flow)
- Phase 5 can run in parallel with Phase 2/3 once Phase 1 is done
- Phase 6 depends on Phases 2–5 (something to deploy)

---
*Roadmap created: 2026-04-30*
