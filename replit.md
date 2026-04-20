# Turath Collective — Architecture (Agent Reference)

> **Authoritative architecture and decisions doc for AI agents working on this codebase.**
> When this file disagrees with code, the code wins — update this file when that happens.

Palestinian heritage craftsmanship e-commerce brand based in Montreal (ceramics + embroidery).
Domain: **turathcollective.com**. Admin email: `collectiveturath@gmail.com`. Languages: EN / FR / AR (RTL).

---

## Stack

| Layer | Tech | Notes |
|---|---|---|
| Frontend | React 18 + TypeScript + Vite 7 | Tailwind CSS v4, Radix UI, Wouter, TanStack Query, framer-motion |
| Backend | **Express 5** (Node 20) running via `tsx server/index.ts` | NOT Vercel — `vercel.json` and `api/shopify.ts` are unused legacy files |
| Hosting | Replit (single web service on port 5000) | Use the workspace **Publish** button to deploy |
| Database | PostgreSQL + Drizzle ORM | Replit-managed; connection via `DATABASE_URL` |
| E-commerce | Shopify Storefront API v2024-01 | Headless GraphQL, proxied through Express `/api/shopify` route |
| Email | Resend API | Service module exists (`server/email.ts`); routes currently disabled |
| i18n | i18next + react-i18next | EN, FR, AR with RTL toggle on `<html dir>` at i18n module load |
| Analytics | Google Analytics 4 | Injected into `index.html` by custom Vite plugin (`ga4Plugin` in `vite.config.ts`) at build time |

## Directory Map

```
client/                          Vite React frontend
├── index.html                   HTML shell — GA4 placeholder injected here
└── src/
    ├── App.tsx                  Wouter router; auth pages NOT registered here
    ├── main.tsx                 Entry — imports i18n before render
    ├── pages/                   Page components (home, shop, product, etc.)
    ├── components/              Shared components + ui/ (shadcn)
    ├── context/cart-context.tsx Shopping cart state
    ├── hooks/                   use-mobile, use-reduced-motion, use-toast, use-auth
    ├── lib/
    │   ├── shopify.ts           Storefront API service layer + normalisation
    │   ├── i18n.ts              i18next config + applyRtl()
    │   ├── analytics.ts         GA4 trackEvent() helper
    │   └── responsiveImage.ts   Shopify CDN image sizing
    └── locales/{en,fr,ar}/      Split JSON namespaces:
                                  common, commerce, errors, legal, pages, translation

server/                          Express backend
├── index.ts                     Entry — helmet, rate limiter, sessions, vite middleware
├── routes.ts                    All /api routes (auth, /api/shopify, /api/health)
├── auth.ts                      Passport local + connect-pg-simple sessions (going away)
├── storage.ts                   Drizzle storage layer (IStorage interface)
├── db.ts                        Drizzle client
└── email.ts                     Resend wrapper (currently unwired)

shared/schema.ts                 Drizzle tables + Zod insert schemas (single source of truth)

vite.config.ts                   Vite config + custom ga4Plugin (transformIndexHtml hook)
vite-plugin-meta-images.ts       Custom plugin: rewrites OG image URLs at build
```

**Legacy/unused** (do not modify, do not extend): `vercel.json`, `api/shopify.ts`, `client/src/pages/{login,signup,forgot-password,contact}.tsx` (files exist but not registered in `App.tsx`).

---

## Active API Surface

All routes are Express handlers in `server/routes.ts`.

| Route | Status | Notes |
|---|---|---|
| `POST /api/shopify` | LIVE | Proxies arbitrary GraphQL to Shopify Storefront. Rate-limited (`shopifyLimiter`: 30/min). Returns 503 if env vars unset. |
| `GET /api/health` | LIVE | Reports `shopify: connected | not configured` |
| `POST /api/auth/register` | LIVE but UI removed | Going away — will be replaced by Shopify Customer Account API |
| `POST /api/auth/login` | LIVE but UI removed | Same |
| `POST /api/auth/logout` | LIVE | Same |
| `GET /api/me` | LIVE | Same |
| `POST /api/contact` | DISABLED | Re-enable by restoring route and wiring `sendContactEmail`. **Must HTML-escape interpolated values in `server/email.ts` first** (SAST flagged XSS risk) |
| `POST /api/newsletter` | DISABLED | DB storage removed; wire to Mailchimp/Klaviyo when ready |

---

## Security Posture (current)

- `helmet` with CSP (`script-src` allows `googletagmanager.com` + `google-analytics.com`; `connect-src` allows `*.myshopify.com`) and HSTS (1 year, preload)
- `app.set("trust proxy", 1)` — required by `express-rate-limit` behind Replit's proxy
- `express.json({ limit: "10kb" })` — DoS guard
- Session cookie: `httpOnly`, `secure` in prod, `sameSite: "lax"`, 30-day maxAge
- `SESSION_SECRET` enforced (throws at boot if missing in production)
- bcrypt cost factor 12 for password hashing
- Request logger redacts response bodies for `/api/auth/*` and `/api/me` to prevent PII in stdout
- All known dependency CVEs patched as of 2026-04-20 (drizzle-orm 0.45.2, vite 7.3.2)

**Known gaps** (intentional, tracked):
- No rate limiter on auth endpoints (acceptable because they're being removed)
- `server/email.ts` template literals are not HTML-escaped (acceptable because routes are disabled)
- `script/check-git-user.js` triggers SAST `child_process` warning (false positive — local dev predev script with hardcoded `git config --get` keys)

---

## Database Tables (Drizzle, defined in `shared/schema.ts`)

- `users` — kept for now; will be dropped when Shopify customer auth lands
- `contact_messages` — kept for when contact route is re-enabled
- `session` — auto-created by `connect-pg-simple`; will be dropped with auth migration
- `newsletter_subscribers` — REMOVED; use Mailchimp/Klaviyo instead

**Schema rules:**
- Always edit `shared/schema.ts` first when changing the data model
- Always pair tables with `createInsertSchema(...).omit(...)` and exported `Insert*`/`*` types
- Run `npm run db:push` (or `--force` if it complains) to sync — never write manual migrations
- Never change primary key column type on an existing table

---

## Required Environment Variables

| Variable | Required | Purpose |
|---|---|---|
| `DATABASE_URL` | yes (prod) | PostgreSQL connection string |
| `SESSION_SECRET` | yes (prod) | Express session signing — boot fails without it in prod |
| `SHOPIFY_STORE_DOMAIN` | live data | e.g. `turath-collective.myshopify.com` (no `https://`) |
| `SHOPIFY_STOREFRONT_TOKEN` | live data | Storefront API token (`shpat_...`) |
| `VITE_GA_MEASUREMENT_ID` | analytics | GA4 ID, format `G-XXXXXXXXXX` |
| `RESEND_API_KEY` | email | Without it, `server/email.ts` no-ops to console |
| `VITE_SHOPIFY_MODE` | optional | `"live"` (fail loudly) or `"mock"` (fallback). Defaults to `"mock"` for dev |

When the Shopify env vars are absent, the frontend silently falls back to mock products in `client/src/data/products.ts`.

---

## Key Architecture Decisions

- **Shopify is the source of truth** for all product / cart / collection data once configured. Components must accept already-normalised data via `normaliseShopify()` in `client/src/pages/product.tsx` and `client/src/lib/shopify.ts`.
- **Token security**: Storefront token never reaches the browser. The Express `/api/shopify` proxy injects it server-side.
- **Mock fallback**: Frontend pages render full mock data when Shopify is unconfigured so design work proceeds without secrets.
- **GA4 at build time, not runtime**: Custom Vite plugin uses `transformIndexHtml` so the GA snippet is in `<head>` before any React executes. No analytics package dependency.
- **Arabic RTL pre-render**: `applyRtl()` runs at i18n module load (synchronously in `main.tsx` before `createRoot()`), preventing first-render LTR flash.
- **Single workflow port**: App serves both API and SPA on port 5000. In dev, Vite middleware is mounted into Express; in prod, `serveStatic()` serves `dist/public`.
- **Auth is a placeholder**: Express auth (`server/auth.ts`, `/api/auth/*`) exists for transition only. The MVP launches with Shopify Customer Account API instead.

---

## Conventions Agents Must Follow

1. **Test IDs**: every interactive element needs `data-testid={action}-{target}`; dynamic elements append an id (e.g. `card-product-${id}`).
2. **No new files when editing existing ones suffices.** Keep file count low; collapse small components into their parent.
3. **No `@vercel/analytics` or `@vercel/speed-insights` imports.** GA4 is handled by `ga4Plugin` only.
4. **Update `client/index.html` Open Graph + Twitter meta** (`og:title`, `og:description`, `twitter:title`, `twitter:description`) when changing the brand name or pitch. Never overwrite `og:image`, `twitter:image`, or `twitter:site`.
5. **Always read `server/email.ts` first** before re-enabling contact/newsletter — the template strings need HTML escaping (SAST-flagged).
6. **Don't add a second port.** Replit firewalls everything except port 5000.

---

## Companion Docs

- `README.md` — quickstart for humans
- `MVP_LAUNCH_CHECKLIST.md` — outstanding work to ship v1 (read this when planning launch tasks)
- `SHOPIFY_SETUP.md` — step-by-step Storefront API onboarding
- `DESIGN.md` — design tokens, component patterns, accessibility rules (authoritative for visual decisions)
