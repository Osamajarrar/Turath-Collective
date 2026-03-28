# Turath Collective

Palestinian heritage craftsmanship e-commerce brand based in Montreal (ceramics + embroidery). Domain: turathcollective.com. Admin email: collectiveturath@gmail.com.

## Stack
- Frontend: React 18 + TypeScript + Vite 7, Tailwind CSS v4, Radix UI, Wouter, TanStack Query
- Backend: Express + TypeScript (tsx dev, CommonJS prod build)
- Database: PostgreSQL + Drizzle ORM
- Auth: Passport.js LocalStrategy + bcryptjs, sessions in PostgreSQL via connect-pg-simple
- Email: Resend API (graceful no-op when key absent)
- E-commerce: Shopify Storefront API v2024-01 (headless GraphQL, proxied through /api/shopify)
- i18n: i18next + react-i18next (EN/FR/AR, RTL for Arabic)
- Analytics: GA4 injected into index.html via custom Vite transformIndexHtml plugin

## Key architecture decisions
- Vite runs as Express middleware in dev (single port 5000). In production, Express serves static build.
- vite.config.ts must export a plain config object (not an async function) — server/vite.ts spreads `...viteConfig` directly and expects an object, not a factory function.
- Shopify token is kept server-side; all Storefront API calls are proxied through /api/shopify.
- When Shopify env vars are absent, the proxy returns 503 + { shopifyDisabled: true } and the frontend silently falls back to local mock data.
- loadEnv() is called synchronously at the top of vite.config.ts (not inside a config factory) to resolve VITE_ vars for the GA4 plugin.
- GA4 script is injected by a custom Vite plugin (ga4Plugin) using transformIndexHtml — not at runtime in JS. No-op when VITE_GA_MEASUREMENT_ID is unset.
- Arabic RTL: applyRtl() is called at i18n module load (before React renders) to prevent first-render flash.
- SESSION_SECRET is required in production — auth.ts throws on startup if absent.

## Database tables
- users (id uuid, email, password_hash, first_name, last_name, created_at)
- contact_messages (id uuid, name, email, subject, message, created_at)
- newsletter_subscribers (id uuid, email, subscribed, created_at)
- session (auto-created by connect-pg-simple)

## Required secrets
- DATABASE_URL — auto-set by Replit PostgreSQL
- SESSION_SECRET — required in production (32+ char random string)
- RESEND_API_KEY — optional; emails log to console without it
- SHOPIFY_STORE_DOMAIN — optional; mock data used without it
- SHOPIFY_STOREFRONT_TOKEN — optional; mock data used without it
- VITE_GA_MEASUREMENT_ID — optional; analytics disabled without it (format: G-XXXXXXXXXX)

## What is NOT yet implemented
- Password reset flow (forgot-password page exists; backend token/email flow missing)
- Cookie consent / GDPR-PIPEDA banner
- sitemap.xml and robots.txt
- Rate limiting and security headers (Helmet.js)
- Account dashboard / order history
