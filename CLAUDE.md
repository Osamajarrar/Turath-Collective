# CLAUDE.md — Working on Turath Collective

Operating guide for AI coding sessions in this repo. Architecture details live in `replit.md`
(authoritative agent architecture doc — read it; Plan 04 proposes renaming it `ARCHITECTURE.md`).
`AGENTS.md` mirrors this file for other agents.

## What this is

Turath Collective (turathcollective.com) — high-end, quiet, editorial heritage homeware brand
(Palestinian handcrafts: Hebron ceramics, Phoenician glass, a signature hand-blown glass
pomegranate). Montreal-based, Canadian market, EN/FR/AR (RTL). Headless Shopify storefront:
React + TypeScript + Vite + Tailwind client, Express server (Shopify proxy + CSP), Vercel deploy.

## Brand positioning

- **Pitch:** handcrafted objects made by real artisans, for people who want to get away from
  mass-produced, soulless items. Starting with Palestinian ceramics and glass-blowing because
  that's where we have the most access and knowledge, and because it helps keep those crafts alive.
- **Tagline:** "History, still handmade." — deliberately true across both tiers of the honesty
  framework below (old-object pieces and old-technique/new-object pieces alike). Don't let copy
  imply an object is centuries-old when only the technique is.
- **Model: Apple, not Gucci/LV.** Premium, not exclusive. No drop culture, no artificial
  scarcity, no invite-only framing. If a piece genuinely becomes unavailable (supplier capacity,
  e.g. an aging artisan), it can be marketed as "last pieces until discontinued" — only when
  true, never as a growth tactic.
- **Customer:** global, story-and-craftsmanship-driven — not diaspora/cause-marketing-driven.
  Skews Western, 25–35, higher disposable income initially, but not exclusive to that group; no
  "supporting Palestine"/donation-style messaging. This targeting holds as the brand expands to
  other heritage crafts beyond Palestine — don't retarget per-origin.

## Hard rules (never violate)

1. **Never push to `test` or `main`.** Those only move when the founder promotes
   `dev` → `test` → `main`. Working directly on `dev` — pushing to it, or merging PRs into
   it — is fine.
2. **No music in any video/audio content or suggestion** — firm personal/religious constraint,
   not a preference. Don't propose royalty-free/background-music workarounds.
3. **No founder-on-camera content.**
4. **Honesty framework (two-tier product framing):** distinguish *historical-object +
   historical-craft* (Hebron ceramics) from *traditional-craft + new-object* (glass pomegranate).
   Never imply an object is old because its technique is. Never add fake reviews, testimonials,
   follower counts, ratings badges ("Top Rated"), invented stats, or AI images passed off as
   real artisans/customers. When copy states a number (years of tradition, response times,
   shipping days), it must be true and consistent with every other page that states it.

## Design guide (enforce in all UI/copy work)

- Visual: warm raw wood, low golden-hour side light, long soft shadows; one organic prop max;
  object treated as art — never cluttered table settings.
- Code idiom: theme tokens only (`bg-background`, `text-foreground`, `text-muted-foreground`,
  `border-border`, primary/accent) — no `bg-white`, `text-black`, or raw hex. Labels/buttons:
  `text-[10px] font-bold uppercase tracking-[0.2em]`; headings: `font-serif`.
- Copy: quiet and editorial. No hype, no exclamation marks, no "Don't miss out". 1–3 calm
  sentences. All user-facing strings go through i18n (`useTranslation`) with EN/FR/AR keys —
  namespaces `common`, `pages`, `commerce`, `legal`, `errors` (see `client/src/lib/i18n.ts`;
  `translation.json` is NOT registered — don't add keys there).

## Env vars (don't change without flagging in the PR)

| Var | Notes |
|---|---|
| `VITE_GA_MEASUREMENT_ID` | GA4; injected at **build time** by `vite.config.ts` into index.html |
| `VITE_POSTHOG_KEY` / `VITE_POSTHOG_HOST` | Client PostHog (not sensitive) |
| `VITE_SENTRY_DSN` | Client Sentry (not sensitive). Unset = monitoring off, which is the normal local state. Sentry is inside the consent scope — it starts only after the visitor accepts, never before. Its ingest origin must be in **both** CSP copies (`server/index.ts` and `vercel.json`); `test/csp-sync.test.ts` enforces that they match |
| `POSTHOG_API_KEY` | **Sensitive** — server-side PostHog |
| `SHOPIFY_STORE_DOMAIN` / `SHOPIFY_STOREFRONT_TOKEN` | Server proxies Storefront GraphQL at `/api/shopify` |
| `VITE_USE_MOCK_PRODUCTS` | `true` = local mock catalog instead of Shopify |
| `VITE_SHOW_PLACEHOLDER_CONTENT` | Gates fake review/social components. **Must never be set in Vercel.** |
| `VITE_SHOW_SHIPPING_PROMO` | Single gate for the announcement bar + cart free-shipping progress bar (`VITE_FREE_SHIPPING_THRESHOLD` supplies the CAD amount). Off until the shipping offer is real. |
| `VITE_DEMO_MODE` | **Local `.env.local` ONLY — must NEVER be set in Vercel (`dev`, `test`, or `main`).** Master switch forcing every mock/placeholder flag on (mock products, fake reviews/social proof, shipping promo with placeholder $75 threshold, full site instead of coming-soon) so the founder can preview the complete experience locally. If deployed, it would show fake content to real visitors — the exact dishonesty the hard rules prohibit. See `client/src/lib/flags.ts`. |

## Gotchas

- **`VITE_*` vars are baked at build time** — changing one in Vercel requires a fresh build, not
  a cached redeploy. Locally, restart the dev server.
- **Shopify dev store has a storefront password** — real checkout is blocked until it's removed;
  test flows will land on `checkout.turathcollective.com/password`. Expected.
- **PostHog captures may silently not fire** even when its scripts load — see
  `plans/01-posthog-capture-debug.md` and `MVP_LAUNCH_CHECKLIST.md` §13a before debugging code.
- **CSP lives in `server/index.ts` (helmet)** — new third-party scripts/domains fail silently in
  the browser until added to `scriptSrc`/`connectSrc`.
- `npm run dev` = Express + Vite middleware on **port 5000**; `npm run check` = typecheck (keep
  it passing — it was broken for a while and regressions hide there); `npm run build` before
  assuming a Vite-config change works.
- Deferred-v1 scaffolding is intentional — auth routes behind `AUTH_ENABLED=false`
  (`server/routes.ts`), stubbed `server/storage.ts`, commented tables in `shared/schema.ts`,
  unrouted auth pages, `shopifyService.buyNow`. Don't "clean up" what a checklist or comment
  marks as deferred; don't wire it live either.
- Contact form + newsletter UI are **not connected to any backend** (routes disabled). Don't
  write copy promising responses/subscriptions until they are.
- Windows dev machine: watch CRLF warnings; don't commit `.env.local`.

## Session workflow expectations

- Branch flow: `dev` → `test` → `main`. AI sessions work on `dev` — directly, or via
  branches/PRs into `dev` when a change benefits from review; the founder reviews (and
  modifies) on `dev`, promotes to `test` when ready, and eventually promotes `test` → `main`.
- Branch names: `fix/…`, `feature/…`, `chore/…`, `plans/…`. Group related changes into coherent,
  reviewable PRs (not one giant PR, not forty one-liners).
- PR descriptions: what changed, why, what reviewers should check; flag anything touching
  payments/checkout, env handling, or legal copy as **needs extra scrutiny**.
- Anything uncertain → still do it on a branch and flag it in the PR rather than skipping.
- `plans/` holds reviewed implementation plans from planning sessions — check for an existing
  plan before re-deriving one, and check `MVP_LAUNCH_CHECKLIST.md` for current launch state.
