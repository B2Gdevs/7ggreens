# Requirements: 7Greens (UPAEC)

**Defined:** 2026-04-30
**Core Value:** Order a flexible vegetable box from a farm you can trust — no membership, no commitment, real cold-chain.

## v1 Requirements

### Foundation

- [ ] **FOUND-01**: Next.js App Router project scaffolded with TypeScript, Tailwind, shadcn/ui initialized
- [ ] **FOUND-02**: Tailwind theme tokens reflect UPAEC palette (cream/charcoal base, sage/tan accents, golden-hour photo tone)
- [ ] **FOUND-03**: Site-wide layout (header with logo + 4 links + cart icon, sticky on scroll, footer with contact info + social) renders on every route
- [ ] **FOUND-04**: Visual Context System scaffolded — every page, section, and major component has a deterministic cid + search token + dev modal accessible in NODE_ENV=development
- [ ] **FOUND-05**: Mobile breakpoints work cleanly at 360px / 768px / 1280px

### Brand (Home page)

- [ ] **BRAND-01**: Hero section with full-bleed lifestyle photo, tagline overlay ("Healthy Land. Healthy Greens. Healthy People." cadence), and dual CTA ("Order a box", "How it works")
- [ ] **BRAND-02**: "The 7Greens Difference" 4-column feature row (chemical-free, cold-chain, no-membership, regenerative) with icons
- [ ] **BRAND-03**: Founder / origin story section with portrait, narrative paragraph, and pull-quote
- [ ] **BRAND-04**: Cold-chain explainer section (sourced from `field-to-family.md`) with infographic or photo + caption
- [ ] **BRAND-05**: Boxes preview block on Home — Starter + Family cards with photo, price, item count, "View boxes →" link
- [ ] **BRAND-06**: Footer with address, phone numbers, social links, copyright

### Catalog (/boxes)

- [ ] **CAT-01**: /boxes route renders Starter ($25, 6 items @ ~10oz) and Family ($35, 9 items @ ~1lb) box cards with item lists and product photos
- [ ] **CAT-02**: Product grid below boxes shows the full SKU list (kale, collards, mustard, chard, southern blend, tomatoes, peppers, onions, beets, potatoes, okra, etc.) with photos from `.planning/research/copy/assets/`
- [ ] **CAT-03**: "Order Extra" section displays $5/lb add-on items (5lb southern blend, 5lb kale, 5lb potatoes, etc.) with optional quantity selector
- [ ] **CAT-04**: Each box card has an "Add to cart" / "Order this box" CTA leading into the order flow

### Order (Square integration)

- [ ] **ORDER-01**: Customer form (name, email, phone, zip, optional notes) creates a Square Customer via Square Customers API
- [ ] **ORDER-02**: Cart summary route shows selected box(es) + extras with subtotal, fees, and total
- [ ] **ORDER-03**: Square Web Payments SDK integration captures card details client-side (PCI scope minimized)
- [ ] **ORDER-04**: Order submission creates a Square Order linked to the Customer, charges the card, returns confirmation
- [ ] **ORDER-05**: Confirmation page shows order ID, items, total, expected pickup window, and contact info
- [ ] **ORDER-06**: Confirmation email sent to customer (via Square or Resend — decide during phase)
- [ ] **ORDER-07**: Webhook endpoint receives Square payment events and reconciles order state server-side

### Contact / Lead Capture

- [ ] **CONTACT-01**: "Get on the list" form (name + email + zip) on Home and footer creates a Square Customer with a "lead" tag
- [ ] **CONTACT-02**: Contact details surface (address, phones, hours, "what to expect" copy) accessible from footer
- [ ] **CONTACT-03**: Form submissions protected by Vercel BotID (block bot signups)
- [ ] **CONTACT-04**: Optional newsletter opt-in checkbox (stored in Square Customer custom attribute)

### Infra / Launch

- [ ] **INFRA-01**: Vercel project linked to `B2Gdevs/7ggreens` main branch; preview deploys on PRs
- [ ] **INFRA-02**: Production environment variables (`SQUARE_ACCESS_TOKEN`, `SQUARE_LOCATION_ID`, `SQUARE_WEBHOOK_SIGNATURE_KEY`, `SQUARE_ENVIRONMENT`) configured via `vercel env`
- [ ] **INFRA-03**: Custom domain mapped (TBD — e.g. `7greens.farm`, `upaec.com`, or operator's choice)
- [ ] **INFRA-04**: Vercel Analytics + Speed Insights enabled
- [ ] **INFRA-05**: Square sandbox environment used in `preview`; production credentials in `production` only
- [ ] **INFRA-06**: Production smoke test: place a sandbox order end-to-end, verify Square dashboard shows Customer + Order

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Wholesale

- **WS-01**: Wholesale-tier portal with bulk pricing
- **WS-02**: Chef-direct ordering with custom box composition

### Logistics

- **LOG-01**: Live zip-code lookup → assigned pickup point
- **LOG-02**: Pickup-point map with photos and hours
- **LOG-03**: Customer order-tracking page (requires v2 auth)

### Content

- **CONT-01**: Blog / journal section
- **CONT-02**: Events calendar (farm tours, pickup events)
- **CONT-03**: Recipes section linking to box contents

### Auth

- **AUTH-01**: Customer accounts with order history
- **AUTH-02**: Saved payment methods

## Out of Scope (v1)

| Feature | Reason |
|---------|--------|
| Subscription / CSA model | Explicit anti-feature — UPAEC's differentiator is no-subscription, order-as-needed |
| Real-time inventory tracking | Produce is picked after pre-order; stock state isn't user-relevant |
| Multi-language | English only for v1 |
| Blog / events / recipes | Defer to v2 content phase |
| User authentication | Square Customer creation is sufficient for v1; auth adds work without v1 user value |
| Live zip → pickup-point lookup | Pickup network not yet finalized; static list ships in v1 |
| Wholesale portal | Separate audience, separate phase |
| Mobile native app | Web-first, mobile-app later if demand surfaces |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| FOUND-01 | Phase 1 | Pending |
| FOUND-02 | Phase 1 | Pending |
| FOUND-03 | Phase 1 | Pending |
| FOUND-04 | Phase 1 | Pending |
| FOUND-05 | Phase 1 | Pending |
| BRAND-01 | Phase 2 | Pending |
| BRAND-02 | Phase 2 | Pending |
| BRAND-03 | Phase 2 | Pending |
| BRAND-04 | Phase 2 | Pending |
| BRAND-05 | Phase 2 | Pending |
| BRAND-06 | Phase 2 | Pending |
| CAT-01 | Phase 3 | Pending |
| CAT-02 | Phase 3 | Pending |
| CAT-03 | Phase 3 | Pending |
| CAT-04 | Phase 3 | Pending |
| ORDER-01 | Phase 4 | Pending |
| ORDER-02 | Phase 4 | Pending |
| ORDER-03 | Phase 4 | Pending |
| ORDER-04 | Phase 4 | Pending |
| ORDER-05 | Phase 4 | Pending |
| ORDER-06 | Phase 4 | Pending |
| ORDER-07 | Phase 4 | Pending |
| CONTACT-01 | Phase 5 | Pending |
| CONTACT-02 | Phase 5 | Pending |
| CONTACT-03 | Phase 5 | Pending |
| CONTACT-04 | Phase 5 | Pending |
| INFRA-01 | Phase 6 | Pending |
| INFRA-02 | Phase 6 | Pending |
| INFRA-03 | Phase 6 | Pending |
| INFRA-04 | Phase 6 | Pending |
| INFRA-05 | Phase 6 | Pending |
| INFRA-06 | Phase 6 | Pending |

**Coverage:**
- v1 requirements: 32 total
- Mapped to phases: 32
- Unmapped: 0 ✓

---
*Requirements defined: 2026-04-30*
*Last updated: 2026-04-30 after initialization*
