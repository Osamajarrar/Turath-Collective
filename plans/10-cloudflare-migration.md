# Plan 10 — Migrate hosting from Vercel to Cloudflare Workers

**Status:** specified, not started. No branch created, no commits made.
**Suggested branch:** `chore/cloudflare-migration`
**Execution model:** stronger model for phases 2–3 (CSP + routing correctness); phases 1, 5–6 cheap.
**Decisions and rationale:** [DECISIONS.md](DECISIONS.md) — read that first; this file is the *how*.
**Companion:** [09-mvp-demand-test.md](09-mvp-demand-test.md) (MVP features). Plan 09 is the higher
priority — it answers whether anyone wants the product. This plan is infrastructure.

---

## Scope

Move the site off Vercel onto Cloudflare Workers with static assets, replacing Express with Hono.
While in here, resolve three things that are cheap now and expensive later: convert the unused DB
schema to D1's dialect, delete the self-hosted auth stack, and delete the file-backed JSON stores.

**Not in scope:** building any D1 table, reviews, or accounts. Those stay deferred.

Rationale for every choice below — including the alternatives rejected (Railway, Render, Fly, Oracle
Cloud) and why scale isn't a trap — is in [DECISIONS.md](DECISIONS.md) §1–§4.

---

## Live API surface (what actually has to move)

Everything else in [server/routes.ts](../server/routes.ts) is behind `AUTH_ENABLED = false` or
`ADMIN_ENABLED = false`.

| Route | Source | Disposition |
|---|---|---|
| `POST /api/shopify` | [routes.ts:203](../server/routes.ts#L203) | **Port** — pure `fetch` + zod, no Node APIs |
| `GET /api/health` | [routes.ts:247](../server/routes.ts#L247) | **Port** — trivial |
| `POST /api/newsletter` | [routes.ts:130](../server/routes.ts#L130) | **Rewritten onto Resend** — see plan 09 |
| `POST /api/contact` | disabled, [routes.ts:110](../server/routes.ts#L110) | **Enabled on Resend** — see plan 09 |
| `GET/POST /api/reviews*` | [routes.ts:158](../server/routes.ts#L158) | **Deleted** — deferred post-MVP, rebuilt on D1 |
| `/api/auth/*`, `/api/me*` | [routes.ts:32-95](../server/routes.ts#L32-L95) | **Deleted** — Shopify owns accounts |
| `/api/admin/*` | [server/admin.ts](../server/admin.ts) | **Deleted** — depended on the auth stack |

## Target architecture

```
Cloudflare Workers
├── Static assets  ← dist/public (Vite build, unchanged)
│   └── _headers   ← security headers + Cache-Control
└── Worker (Hono)  ← /api/shopify, /api/health, /api/contact, /api/newsletter
    └── Rate limiting via Cloudflare binding, not express-rate-limit
```

---

## Phases

Each phase is a reviewable commit. Order matters. Vercel stays deployable through phase 5.

### Phase 1 — Scaffold, no behavior change

- `wrangler.toml`: name, `compatibility_date`, `main`, and an `assets` binding on `dist/public` with
  `not_found_handling = "single-page-application"` — this replaces the `/(.*) → /index.html` rewrite
  at [vercel.json:51](../vercel.json#L51) and the Express fallback at
  [static.ts:16](../server/static.ts#L16).
- Add `hono` and `wrangler` to `package.json`.
- Delete nothing yet.

### Phase 2 — Port the two live routes

New `worker/index.ts`, a Hono app.

- **`POST /api/shopify`** — port from [routes.ts:203-243](../server/routes.ts#L203-L243). Preserve
  **all** the hardening; none of it is decorative: the zod body schema, the 20k query cap, the
  `__schema`/`__type` introspection block, the 10s `AbortSignal.timeout`, and the exact 503
  `shopifyDisabled` response shape the client depends on. Credentials come from the Worker `env`
  argument, not `process.env`.
- **`GET /api/health`** — port as-is.
- **Rate limiting** — replace `shopifyLimiter` (30/min, [index.ts:90](../server/index.ts#L90)) with a
  Cloudflare **Rate Limiting binding** at the same rate. Call out in the PR that this is the first
  deploy where the limit is genuinely enforced — the in-memory store was per-instance and therefore
  ineffective on Vercel.
- **Error handler** — port from [index.ts:144-159](../server/index.ts#L144-L159). The rule that 5xx
  never leaks internal error text must survive.

> Contact and newsletter routes are added here too, but their specification lives in
> [plan 09](09-mvp-demand-test.md). If plan 09 lands first, port its routes rather than the old ones.

### Phase 3 — Security headers (highest risk phase)

> **What CSP is, for anyone reading this cold.** Content-Security-Policy is a header sent with each
> response telling the browser *which origins this page may load scripts, styles, fonts and images
> from*, and *which origins it may send data to*. Anything not on the list is blocked. It exists so
> that if someone injects a `<script>` into the page, the browser refuses to run it — the attacker's
> domain isn't listed.
>
> The consequence for us: **every third-party service must be named explicitly.** GA4, PostHog,
> Shopify, Google Fonts and (newly) Sentry all need entries. If an origin is missing the browser
> blocks it *silently* — no app error, nothing in logs; the script loads and no data ever leaves the
> page. Hence: transcribe exactly, verify in the dashboards.

Two delivery paths:

- **Static asset responses** → `public/_headers`, carrying everything currently in
  [vercel.json:7-47](../vercel.json#L7-L47): CSP, HSTS, `X-Content-Type-Options`, `X-Frame-Options`,
  `Referrer-Policy`, `Permissions-Policy`, COOP, `X-DNS-Prefetch-Control`, plus both `Cache-Control`
  rules (immutable for `/assets/*`, 1-day + SWR for images).
- **Worker responses** → Hono middleware setting the same headers.

Transcribe the CSP from [vercel.json:13](../vercel.json#L13) **literally**. Do not tidy it during the
move — behavior-preserving only. Sentry's origins are added by [plan 09](09-mvp-demand-test.md); if
that plan lands first, include them.

Outcome: **one CSP source of truth**, ending the [vercel.json](../vercel.json) ↔
[server/index.ts](../server/index.ts) drift the comment at
[index.ts:35-38](../server/index.ts#L35-L38) warns about.

### Phase 4 — Build and local dev

- [script/build.ts](../script/build.ts): keep `viteBuild()`; drop the esbuild step producing
  `dist/index.cjs` ([build.ts:49-61](../script/build.ts#L49-L61)) — Wrangler bundles the Worker.
- Scripts: `dev` → `wrangler dev` (serves assets + Worker together); keep `dev:client` for pure-UI
  work; remove `start`.
- **`npm run check` must stay passing.** Add `@cloudflare/workers-types`; keep any remaining `server/`
  files out of the Worker tsconfig so Node code isn't typechecked against Worker globals.
- **`VITE_*` vars must be set in the Cloudflare *build* environment**, not only as runtime secrets —
  Vite bakes them into the bundle at build time ([vite.config.ts](../vite.config.ts) injects the GA
  ID into `index.html`). This is the most likely cause of a "analytics stopped working" report after
  cutover.
- Runtime secrets (`SHOPIFY_STOREFRONT_TOKEN`, `RESEND_API_KEY`, `POSTHOG_API_KEY`) via
  `wrangler secret`; `.dev.vars` locally, **gitignored** alongside `.env.local`.
- **`VITE_DEMO_MODE` must never be set in any Cloudflare environment**, exactly as with Vercel.

### Phase 5 — Cut over

0. **Set the runtime vars in the Cloudflare dashboard first** (Workers & Pages → the worker →
   Settings → Variables and Secrets), *before* pointing DNS. Missing ones fail silently:
   - `SENTRY_DSN` — the **turathcollective-backend** Sentry project. A plain variable, not a
     secret; deliberately NOT in [wrangler.toml](../wrangler.toml) because this repo is public.
     Without it the Worker runs fine and reports nothing, which looks identical to "no errors".
   - `SHOPIFY_STORE_DOMAIN`, plus `SHOPIFY_STOREFRONT_TOKEN` / `RESEND_API_KEY` /
     `POSTHOG_API_KEY` as **secrets**.
   - Every `VITE_*` var belongs in the **build** environment, not here — Vite bakes them into the
     bundle. Set only as Worker vars, GA4/PostHog/client Sentry stay dark after cutover.
   - `ENVIRONMENT` is already `production` in `wrangler.toml`; don't override it in the dashboard,
     or local and live errors become indistinguishable in Sentry.
1. Verify on the `*.workers.dev` URL (checklist below).
2. Lower DNS TTL, then point the domain at Cloudflare. **Keep the Vercel deployment intact for a
   same-day rollback.**
3. Only once stable: delete [vercel.json](../vercel.json), [api/shopify.ts](../api/shopify.ts), and
   `@vercel/analytics` + `@vercel/speed-insights` from `package.json` **and their client call sites**
   (grep first — removing the packages will not fail the build loudly).

### Phase 6 — Cheap-now-expensive-later cleanups

Separate commits, each independently reviewable. Rationale in [DECISIONS.md](DECISIONS.md) §3–§4.

**6a — Convert the DB schema to D1's dialect.**
`shared/schema.ts` tables are commented out and unused, and [drizzle.config.ts](../drizzle.config.ts)
says `postgresql`. Convert `pg-core` → `sqlite-core` and set the Drizzle dialect to `sqlite` / D1.
**Create no tables and provision no database** — this is purely so the schema is already in the right
dialect when reviews arrive. It is nearly free now and genuinely annoying later.

**6b — Delete the self-hosted auth stack.**
Shopify's Customer Account API will own accounts; sessions also require server memory between
requests, which Workers doesn't have. Remove [server/auth.ts](../server/auth.ts), the disabled route
blocks at [routes.ts:32-95](../server/routes.ts#L32-L95), [server/admin.ts](../server/admin.ts) and
its unrouted admin page, and the dependencies `passport`, `passport-local`, `bcryptjs`,
`express-session`, `connect-pg-simple`, `memorystore`. Drop `AUTH_ENABLED` / `ADMIN_ENABLED`.

> Founder confirmed Shopify for accounts. **This is the one destructive step — veto here if you'd
> rather keep it.** It's recoverable from git either way.

**6c — Delete the file-backed stores.**
Once newsletter is on Resend (plan 09), nothing legitimate writes files. Remove
[server/json-store.ts](../server/json-store.ts), [server/newsletter.ts](../server/newsletter.ts),
[server/reviews.ts](../server/reviews.ts). Reviews get rebuilt on D1 when they're wanted; keeping a
filesystem implementation that cannot run on the target platform is worse than deleting it.

**6d — Update the docs.**
`CLAUDE.md` and `AGENTS.md`: deploy target, the dev-server description (currently "Express + Vite
middleware on port 5000"), the CSP gotcha (now `_headers`, not `server/index.ts`), and the
deferred-scaffolding paragraph, which after 6b–6c is largely obsolete.

---

## Verification before DNS cutover

On the `*.workers.dev` preview:

1. Products load from Shopify — `/api/shopify` returns 200 with real data, mock flag off.
2. `curl -I` the root: every header from [vercel.json](../vercel.json) present and identical.
3. **PostHog and GA4 events actually arrive in their dashboards** — not "the script loaded". Per
   [plan 01](01-posthog-capture-debug.md), confirm in the dashboard itself.
4. Deep-link a client route (e.g. `/products/<handle>`) directly — 200, not 404.
5. All three locales including AR/RTL render; confirm `_headers` didn't break font loading.
6. `/api/shopify` with a `__schema` query → 400; 31 rapid requests → 429.
7. Cart survives a reload (Shopify cart ID round-trips from localStorage).
8. `npm run check` and `npm run build` pass.

## Risks

| Risk | Mitigation |
|---|---|
| CSP transcription error silently kills analytics | Step 3; diff the two policies literally |
| `VITE_*` missing in build env → GA/PostHog dark | Phase 4 checklist; step 3 |
| SPA fallback misconfigured → deep links 404 | Step 4 |
| 6b deletes something still referenced | `npm run check` after; unrouted admin page must go too |
| Future server-side PostHog on a platform with no shutdown flush | Note at [posthog.ts](../server/posthog.ts): Workers captures need `ctx.waitUntil`; the SIGTERM flush at [index.ts:187](../server/index.ts#L187) doesn't exist there |
| Rollback needed post-cutover | Vercel deployable until phase 5.3; low DNS TTL |

## PR guidance

Phases 2–3 touch the Shopify proxy and security headers; phase 5 changes env handling and the deploy
target; phase 6b is destructive. **Flag all of these as needs extra scrutiny.**
