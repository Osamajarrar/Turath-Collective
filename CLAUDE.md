# CLAUDE.md — Working on Turath Collective

Operating guide for AI coding sessions in this repo. Architecture details live in `replit.md`
(authoritative agent architecture doc — read it; Plan 04 proposes renaming it `ARCHITECTURE.md`).
`AGENTS.md` mirrors this file for other agents.

## What this is

Turath Collective (turathcollective.com) — high-end, quiet, editorial heritage homeware brand
(Palestinian handcrafts: Hebron ceramics, Phoenician glass, a signature hand-blown glass
pomegranate). Montreal-based, Canadian market, EN/FR/AR (RTL). Headless Shopify storefront:
React + TypeScript + Vite + Tailwind client, Express server (Shopify proxy + CSP), Vercel deploy.

## Hard rules (never violate)

1. **Never push to `main` or `preview`.** All work on new branches from `main`; every branch
   gets its own PR into `main`; never merge your own PRs.
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
| `POSTHOG_API_KEY` | **Sensitive** — server-side PostHog |
| `SHOPIFY_STORE_DOMAIN` / `SHOPIFY_STOREFRONT_TOKEN` | Server proxies Storefront GraphQL at `/api/shopify` |
| `VITE_USE_MOCK_PRODUCTS` | `true` = local mock catalog instead of Shopify |
| `VITE_SHOW_PLACEHOLDER_CONTENT` | Gates fake review/social components. **Must never be set in Vercel.** |

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

- Branch names: `fix/…`, `feature/…`, `chore/…`, `plans/…`. Group related changes into coherent,
  reviewable PRs (not one giant PR, not forty one-liners).
- PR descriptions: what changed, why, what reviewers should check; flag anything touching
  payments/checkout, env handling, or legal copy as **needs extra scrutiny**.
- Anything uncertain → still do it on a branch and flag it in the PR rather than skipping.
- `plans/` holds reviewed implementation plans from planning sessions — check for an existing
  plan before re-deriving one, and check `MVP_LAUNCH_CHECKLIST.md` for current launch state.
