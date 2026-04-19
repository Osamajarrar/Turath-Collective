# Turath Collective — Architecture & Decisions

Palestinian heritage craftsmanship e-commerce brand based in Montreal (ceramics + embroidery). Domain: turathcollective.com. Admin email: collectiveturath@gmail.com.

## Stack
- Frontend: React 18 + TypeScript + Vite 7, Tailwind CSS v4, Radix UI, Wouter, TanStack Query
- Backend: Vercel Functions (serverless, replaces Express server)
- Database: PostgreSQL + Drizzle ORM
- Auth: Deferred to Shopify (backend auth helpers kept for future use)
- Email: Resend API (graceful no-op when key absent)
- E-commerce: Shopify Storefront API v2024-01 (headless GraphQL, proxied through `/api/shopify` Vercel Function)
- i18n: i18next + react-i18next (EN/FR/AR, RTL for Arabic)
- Analytics: GA4 injected into index.html via custom Vite transformIndexHtml plugin

## Key Architecture Decisions
- **Shopify is the source of truth**: All product, cart, and collection data flows from Shopify Admin
- **Frontend-only for v1**: Vercel Functions handle only Shopify API proxying (keeps token secret)
- **Environment-based mock data**: 
  - `VITE_SHOPIFY_MODE=live` — Real API only, no fallback
  - `VITE_SHOPIFY_MODE=mock` — Use mock data if API fails (development mode)
- **Vite config is plain object**: vite.config.ts exports plain object (not async function) to support both Vite and custom server middleware
- **Token security**: Shopify token kept server-side; all Storefront API calls proxied through Vercel Function
- **When Shopify unavailable**: Frontend silently falls back to mock data (in mock mode) or shows error (in live mode)
- **GA4 injection**: Custom Vite plugin injects GA4 script at build time via transformIndexHtml — no runtime overhead
- **Arabic RTL**: applyRtl() called at i18n module load (before React renders) to prevent first-render flash

## Database Tables
- `users` (id, email, password_hash, first_name, last_name, created_at) — kept for future auth re-enablement
- `contact_messages` (id, name, email, subject, message, created_at) — kept for future contact form
- `session` (auto-created by connect-pg-simple) — currently unused, can be removed
- `newsletter_subscribers` REMOVED — DB storage deferred; form UI remains for future Mailchimp/Klaviyo integration

## Deferred for Launch v1
- Contact form backend (`/api/contact` disabled)
- Newsletter integration (form UI ready for Mailchimp/Klaviyo)
- Auth UI pages (login/signup/forgot-password removed from router)
- Shopify-driven authentication (using Shopify customer API instead of custom auth)

## Required Environment Variables
| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes (prod) | PostgreSQL connection string |
| `SHOPIFY_STORE_DOMAIN` | No | e.g. turath-collective.myshopify.com (mock data if absent) |
| `SHOPIFY_STOREFRONT_TOKEN` | No | Shopify Storefront API token (mock data if absent) |
| `VITE_GA_MEASUREMENT_ID` | No | Google Analytics ID (format: G-XXXXXXXXXX) |
| `RESEND_API_KEY` | No | Email service (ready when /api/contact re-enabled) |
| `VITE_SHOPIFY_MODE` | No | `"live"` or `"mock"` (default: `"mock"` for dev) |

## What is NOT Yet Implemented
- Contact form backend (route deferred; table and email helpers exist)
- Newsletter integration (Mailchimp / Klaviyo — form UI ready)
- Auth UI (login, signup, forgot-password — backend helpers ready)
- Cookie consent / GDPR-PIPEDA banner
- sitemap.xml and robots.txt
- Rate limiting and security headers (Helmet.js)
- Account dashboard / order history
