# Turath Collective

> Premium Palestinian heritage craftsmanship e-commerce site — hand-painted ceramics and traditional embroidery, based in Montreal. Trilingual (EN / FR / AR with RTL).
> Production domain: **turathcollective.com**

This README is a quickstart. For deeper context see:

- **`replit.md`** — architecture, decisions, conventions (read first when working on the codebase)
- **`MVP_LAUNCH_CHECKLIST.md`** — outstanding work to ship v1
- **`SHOPIFY_SETUP.md`** — Shopify Storefront API onboarding
- **`DESIGN.md`** — design system tokens, components, accessibility rules

---

## Stack at a Glance

React 18 + TypeScript + Vite 7 · Tailwind CSS v4 + Radix UI · Wouter · TanStack Query · framer-motion · Express 5 · PostgreSQL + Drizzle ORM · Shopify Storefront API v2024-01 · i18next · GA4 · Resend.

Hosted on **Replit** (Express server on port 5000, built `dist/public` served from the same process in production).

---

## Quick Start

```bash
# Dependencies are managed via the workspace; npm install also works.
npm install

# Run the dev server (Vite middleware mounted into Express, port 5000)
npm run dev
```

App boots at `http://127.0.0.1:5000`. Without Shopify env vars it serves mock products, so design and frontend work proceed without secrets.

### Environment

Set these in Replit's Secrets pane (or `.env.local` for local):

| Variable | When required |
|---|---|
| `DATABASE_URL` | Always (provided by Replit's Postgres) |
| `SESSION_SECRET` | Production (boot fails without it) |
| `SHOPIFY_STORE_DOMAIN` + `SHOPIFY_STOREFRONT_TOKEN` | To use live products instead of mocks |
| `VITE_GA_MEASUREMENT_ID` | Production analytics |
| `RESEND_API_KEY` | When contact/newsletter routes are re-enabled |

Verify Shopify is wired by visiting `/api/health` — it should report `"shopify": "connected"`.

---

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Express + Vite middleware in dev mode |
| `npm run build` | Build the SPA into `dist/public` |
| `npm start` | Run the production build (Express serves `dist/public`) |
| `npm run db:push` | Push the Drizzle schema in `shared/schema.ts` to Postgres (use `--force` if Drizzle prompts) |

---

## Active API Routes (Express, in `server/routes.ts`)

- `POST /api/shopify` — GraphQL proxy to Shopify Storefront, rate-limited to 30 req/min
- `GET  /api/health` — health + Shopify connection status
- `POST /api/auth/{register,login,logout}` and `GET /api/me` — placeholder auth, will be replaced by Shopify Customer Account API
- `POST /api/contact` and `POST /api/newsletter` — currently disabled (see `MVP_LAUNCH_CHECKLIST.md`)

---

## Project Structure

```
client/   — React + Vite SPA (pages, components, locales/{en,fr,ar})
server/   — Express app (routes, auth, storage, email, db)
shared/   — Drizzle tables + Zod insert schemas (single source of truth)
```

Full directory map and conventions are in `replit.md`.

---

## Deployment

Use the **Publish** button in the Replit workspace. The build command (`npm run build`) outputs `dist/public`; the production server (`npm start`) runs Express on the port Replit injects via `PORT`. Custom domain `turathcollective.com` is configured at the deployment level.

---

## Contributing / AI Agent Notes

If you're an agent picking up work on this project, **read `replit.md` first**. It defines the conventions (test IDs, no-Vercel rule, GA4 plugin, RTL flush, mock fallback strategy) that the rest of the codebase assumes.
