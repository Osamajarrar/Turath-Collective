# Architecture decisions record

Decisions made in the planning session of **2026-07-31**, with the reasoning and the alternatives
rejected. Kept separate from the numbered plans because plans get executed and closed — this is the
record of *why*, and it should outlive them.

Execution lives in [10-cloudflare-migration.md](10-cloudflare-migration.md) (infrastructure) and
[09-mvp-demand-test.md](09-mvp-demand-test.md) (MVP features).

---

## Summary table

| Area | Decision | Status |
|---|---|---|
| Hosting | Cloudflare Workers + static assets | Plan 10 |
| Server framework | Hono (replaces Express) | Plan 10 |
| Database | D1 (SQLite); schema dialect converted now, tables built later | Plan 10 |
| Accounts | Shopify Customer Account API, post-MVP | Deferred; direction fixed |
| Self-hosted auth (passport) | **Removed** | Plan 10 |
| Email | Resend — contact form + reserve capture | Plan 09 |
| Newsletter list | Resend Audiences (not our database) | Plan 09 |
| Checkout for MVP | Intercept with reserve dialog; no payment taken | Plan 09 |
| Product analytics | PostHog (already live) | — |
| Error monitoring | Sentry — add for MVP | Plan 09 |
| Tests | Vitest + RTL; one Playwright cart flow | Plan 09 |
| Reviews | Deferred post-MVP, will use D1 | — |

---

## 1. Hosting: Cloudflare Workers

**Rejected:** Vercel (current), Railway, Render, Fly.io, Oracle Cloud Always Free.

- **Vercel** — never runs [server/index.ts](../server/index.ts) in production; it serves
  `dist/public` statically and runs `api/shopify.ts` as a function. The helmet CSP therefore doesn't
  execute in prod, forcing a hand-duplicated copy in [vercel.json](../vercel.json) that must be kept
  in sync manually. Founder also dislikes the platform — a legitimate input.
- **Railway** — good fit technically, but ~$5/mo with no free tier, and the reasons that favoured a
  persistent process evaporated (see §5).
- **Render** — has a free tier, but instances sleep; cold starts are unacceptable for a storefront.
- **Oracle Cloud Always Free** — genuinely generous (4 ARM cores / 24GB RAM, and the Express app
  would run unchanged). Rejected because it is a raw VM: OS patching, TLS, reverse proxy, process
  supervision, backups and monitoring all become the founder's job, with no CDN and no git deploys.
  Wrong place for a solo founder's attention, and the bad failure mode is an unpatched box holding
  customer emails.

**Cloudflare wins on:** genuinely free at our scale (static asset requests unbilled, and a storefront
is overwhelmingly static assets), global edge, and it forces the CSP consolidation we need anyway.

### Scale — why this is not a trap

Traffic will not push us off Workers; it scales horizontally with no configuration. What *would*
push us off is needing a capability it lacks (long-running background jobs, a Postgres extension, a
Node-only framework) — a feature decision we'd see coming, not a growth event. Realistically the
first real bottlenecks will be Shopify plan tiers, inventory and artisan capacity.

The escape ladder, each rung incremental and none a rewrite:

1. **Now** — Workers, no database
2. **Reviews/favorites** — Workers + D1
3. **If D1 is outgrown** — Workers + Postgres via **Hyperdrive** (stay on Cloudflare)
4. **If Workers is outgrown** — Hono on Node anywhere (Railway, Fly, VPS)

## 2. Server framework: Hono

**Rejected:** running Express under `nodejs_compat`.

Our Express usage is thin — helmet, JSON parsing, rate limiting, static serving — and Cloudflare has
a native equivalent for each. Running Express under compat would preserve
[`express-rate-limit`](../server/index.ts#L90)'s in-memory store, which is per-isolate and therefore
silently ineffective (the defect it *already* has on Vercel). Porting is the chance to fix it.

**Hono is also the portability insurance.** It is not a Cloudflare framework — the same app runs on
Node via `@hono/node-server`, plus Bun and Deno. Leaving Cloudflare later means swapping the entry
point, not rewriting handlers. This is a deliberate hedge, and rung 4 of the ladder above depends on
it.

## 3. Database: D1

**Rejected:** Postgres (Railway/Neon/Supabase), and "no decision until later".

The decisive point is *what the database actually holds*. Everything heavy lives elsewhere:

| Data | Home |
|---|---|
| Products, prices, inventory, variants | Shopify |
| Orders, fulfillment, refunds | Shopify |
| Customers, addresses, payment methods | Shopify |
| Newsletter list + consent records | Resend |
| Analytics / errors | PostHog / Sentry |
| **Reviews, favorites, editorial extras** | **our database** |

Shopify is the system of record; our database is a side table. D1 has enormous headroom for that.

**Known D1 tradeoffs, accepted knowingly:** SQLite is single-writer (irrelevant at our volume); no
Postgres extensions — notably no `pgvector`, though Cloudflare Vectorize covers that use case; and it
ties us to Cloudflare, though exporting SQLite at our data sizes is trivial.

**Why decide now and not later:** the tables in `shared/schema.ts` are commented out and unused, and
[drizzle.config.ts](../drizzle.config.ts) says `postgresql`. Converting `pg-core` → `sqlite-core`
costs nearly nothing *today* precisely because no code and no data depend on it. Doing it in a year
with live rows is exactly the post-MVP rework the founder wants to avoid. **Decide the engine now,
write the schema in that dialect now, build the tables when reviews actually arrive.**

## 4. Accounts: Shopify Customer Account API

**Rejected:** self-hosted auth (the code already in the repo).

Shopify already owns the customer record, order history, addresses and payment methods, because
checkout runs on their domain. A parallel users table creates two identities for one person and a
permanent reconciliation problem. Shopify hosts login, passwordless codes and recovery — removing
password hashing, reset emails, session storage and breach exposure entirely.

Use the OAuth-based **Customer Account API**, not the legacy `customerAccessTokenCreate` Storefront
mutations, which are on a deprecation path. **Accepted cost:** account pages live partly on Shopify's
domain, so branding and AR/RTL there are Shopify's implementation, not ours.

Consequently the `passport` / `passport-local` / `bcryptjs` / `express-session` /
`connect-pg-simple` / `memorystore` stack is **dead code for a road not taken** and is removed in
plan 10 — sessions also depend on server memory between requests, which Workers does not have.
Founder confirmed the direction; removal is proposed in plan 10 and can be vetoed there.

## 5. Analytics and errors

**PostHog stays as-is.** Verified during this session: both `getPostHog()?.capture` calls
([routes.ts:47](../server/routes.ts#L47), [routes.ts:61](../server/routes.ts#L61)) sit inside the
`AUTH_ENABLED = false` block, so **the server captures nothing today** — all live analytics is
`posthog-js` in the browser, which is host-independent. This removed the main argument against
Workers.

> ⚠ **Re-check this before `AUTH_ENABLED` is ever flipped on.** `posthog-node` batches events in
> memory and flushes on shutdown ([index.ts:187](../server/index.ts#L187)). Workers has no shutdown;
> captures there need `ctx.waitUntil`, or events vanish silently.

**Sentry: add for MVP.** Initially deferred on "one less vendor", then reversed — the founder is
about to spend real money on ads, and a broken page silently burning that budget costs more than an
extra script. PostHog answers *what people did*; Sentry answers *what broke*. Accepted costs: one
more CSP origin and one more item in Law 25 consent scope.

## 6. Cart model (no change needed — recorded for reference)

Verified in [cart-context.tsx](../client/src/context/cart-context.tsx). **Shopify holds the cart**;
the browser stores only the cart ID (`turath_cart_id`) in localStorage
([cart-context.tsx:16](../client/src/context/cart-context.tsx#L16)) and re-fetches on load.

- **Guests** — cart persists across sessions on the same browser, indefinitely. No accounts or
  database required. This is already the behaviour today.
- **Different device/browser** — cart does *not* follow. localStorage is per-browser.
- **Adding accounts does not automatically fix that.** Shopify's `buyerIdentity` associates a cart
  with a customer and prefills checkout, but true cross-device cart requires storing the cart ID
  against the customer (our D1, or Shopify customer metafields). It is a real feature, not a freebie
  that arrives with login.
- **Favorites later** — same shape: localStorage for guests, storage only for cross-device sync.
- **Consent:** a cart ID in localStorage is *functional* storage, not tracking, so it is outside the
  scope of [plan 03](03-cookie-consent-banner.md). Same will apply to favorites. Don't let consent
  scope creep onto them.

Because Shopify holds all of it, Workers' lack of per-request memory does not affect the cart.

## 7. Honesty framework applied to an unfinished checkout

Founder position, accepted: shipping a site where checkout isn't built yet is **not dishonest**. The
hard rules target product-provenance claims and fabricated social proof. Intercepting at checkout
with "these pieces are still being made, leave your email" is a true statement about a true state.
The dishonest version would be promising a two-month ship date when it is known to be six.

Where the rules *do* bind: displayed prices must be the prices we intend to charge, no payment
details may be collected, and no timeline may be stated that isn't known. See plan 09.

## Open / revisit later

- **Real checkout** — requires removing the Shopify dev-store password. Decide after ad results.
- **Preorders** — the reserve list is designed to convert into this. Only with a truthful timeline.
- **Cross-device cart, favorites, reviews** — all additive; build when wanted.
- **Contact form reply-time promise** — [email.ts:80](../server/email.ts#L80) says 1–2 business days.
  Must be true before it ships.
