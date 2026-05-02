# 7Greens — UPAEC landing + commerce

Brand and commerce landing site for **Uncle Paul's Agritourism & Educational Corp** (UPAEC), a chemical-free, non-GMO produce farm in Tyler, Texas serving East Texas and Dallas–Fort Worth.

Live routes:

- `/` — story-led home (hero, differentiators, founder, cold chain, boxes preview, lead capture)
- `/boxes` — full catalog with Starter ($25) + Family ($35) boxes, $5/lb extras, and the produce gallery

## Stack

- **Next.js 16** App Router · TypeScript strict · Node 24 LTS
- **Tailwind CSS v4** (config-free, `@theme inline` in `app/globals.css`)
- **Fraunces** + **Plus Jakarta Sans** via `next/font/google`
- **lucide-react** icons
- **Square** (optional, see Env below) — Customers + Orders + Payments
- **Vercel** target — Fluid Compute + Vercel Analytics + BotID

## Local development

This repo is a git submodule of the GAD monorepo and uses pnpm workspaces.

```sh
# from the parent monorepo root
pnpm install
pnpm --filter 7greens dev      # http://localhost:3000
pnpm --filter 7greens build
pnpm --filter 7greens lint
pnpm --filter 7greens typecheck
```

You can also run from this directory directly with `npm install && npm run dev` if you don't have the parent monorepo cloned.

## Visual Context System

A minimal local VCS lives at `lib/vcs/`. Every section / major component carries a `data-cid` attribute. In development mode, press **`Ctrl+.`** (or **`Cmd+.`**) to open the inspector — it lists every visible cid, lets you click to copy, and highlights the element on hover.

There is no dependency on `gad-visual-context` or `@gad/visual-context` — the kit is intentionally inline so 7greens can ship without waiting on the framework's package.

## Env vars (all optional)

Copy `.env.example` to `.env.local` (locally) or add them as Vercel project env vars. **The site renders fully without any of them** — fallbacks are in `lib/site/constants.ts`.

| Var | What | Behavior when unset |
|---|---|---|
| `SQUARE_ACCESS_TOKEN` | Square API token | Lead-capture returns success without persisting; pricing renders from fallbacks |
| `SQUARE_LOCATION_ID` | Merchant location | Same as above |
| `SQUARE_ENVIRONMENT` | `sandbox` or `production` | Defaults to `sandbox` |
| `SQUARE_WEBHOOK_SIGNATURE_KEY` | Webhook verify | Phase 04+ |

## Deploying to Vercel

```sh
vercel link        # connect this directory to a Vercel project
vercel env pull    # pull any envs that exist
vercel deploy      # preview deploy
vercel deploy --prod
```

Or just point a Vercel project at `https://github.com/B2Gdevs/7ggreens` `main` and it auto-deploys.

## Photos

27 source photos extracted from the operator-provided `.docx` files. Brand/lifestyle photos go to `public/photos/brand/`; SKU photos go to `public/photos/produce/`. The originals stay in `.planning/research/copy/assets/` as research record.

## Planning

Full project planning lives in `.planning/`:

- `PROJECT.md` — what + why
- `REQUIREMENTS.md` — 32 v1 requirements
- `ROADMAP.md` — 6 phases
- `phases/01-foundation/` — current phase (foundation), executed across files

Use `gad snapshot --projectid 7greens` to see live state.

---

© Uncle Paul's Agritourism & Educational Corp. Founded 2019. PSA-certified.
