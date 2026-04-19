# Turath Collective — Developer Reference

Premium Palestinian heritage craftsmanship brand based in Montreal. Sells hand-painted ceramics and traditional embroidery. Target market: Montreal customers. Bilingual (FR/EN) with full Arabic (RTL) support. Production domain: **turathcollective.com**

---

## 📚 Documentation

For detailed guides, see:

| Document | Purpose |
|---|---|
| [.github/API.md](./.github/API.md) | API endpoint reference & GraphQL examples |
| [.github/DEPLOYMENT.md](./.github/DEPLOYMENT.md) | Vercel deployment setup & configuration |
| [.github/TROUBLESHOOTING.md](./.github/TROUBLESHOOTING.md) | Common issues & solutions |
| [SHOPIFY_SETUP.md](./SHOPIFY_SETUP.md) | Shopify Storefront API setup guide |

---

## Tech Stack

| Layer | Technology | Notes |
|---|---|---|
| Frontend | React 18 + TypeScript + Vite 7 | Fast dev/build, ESM-first |
| Styling | Tailwind CSS v4 + Radix UI primitives | Responsive, accessible components |
| Routing | Wouter | Lightweight client-side routing |
| Server state | TanStack Query v5 | Async data fetching & caching |
| Backend | Vercel Functions (serverless) | `/api/shopify` proxy for Shopify API |
| Database | PostgreSQL (optional for v2+) | Deferred for future auth/contact features |
| Email | Resend API | Transactional emails (optional) |
| E-commerce | Shopify Storefront API v2024-01 | GraphQL headless commerce |
| i18n | i18next + react-i18next | 3 languages: EN, FR, AR (with RTL) |
| Analytics | Google Analytics 4 | Injected via Vite at build time |
| Forms | React Hook Form + Zod | Type-safe form validation |
| Deployment | Vercel | Frontend CDN + serverless functions |

---

## Project Structure

```
turath-collective/
├── client/                        # Vite React frontend
│   ├── index.html                 # HTML shell (GA4 injected at build time)
│   └── src/
│       ├── App.tsx                # Root router (Wouter)
│       ├── main.tsx               # Entry point — imports i18n before render
│       ├── index.css              # Global styles + Tailwind directives
│       ├── pages/
│       │   ├── home.tsx           # Landing page (hero + story + collections)
│       │   ├── shop.tsx           # Product listing with collection filters
│       │   ├── product.tsx        # Single product detail + variant selector + cart
│       │   ├── contact.tsx        # Contact form (for future backend feature)
│       │   ├── login.tsx          # Sign in page (for future auth feature)
│       │   ├── signup.tsx         # Register page (for future auth feature)
│       │   ├── about.tsx          # About page (brand story)
│       │   ├── care.tsx           # Product care guide
│       │   ├── faq.tsx            # FAQ (accordion)
│       │   ├── forgot-password.tsx# Password reset (for future feature)
│       │   └── not-found.tsx      # 404 page
│       ├── components/
│       │   ├── PageLayout.tsx     # Wrapper: navbar + content + footer
│       │   ├── navbar.tsx         # Top navigation + language switcher
│       │   ├── footer.tsx         # Footer with links + newsletter
│       │   ├── hero.tsx           # Full-bleed landing hero section
│       │   ├── heritage.tsx       # Brand story section
│       │   ├── story-section.tsx  # Artisan narrative
│       │   ├── values-section.tsx # Brand values grid
│       │   ├── collection-cards.tsx # Featured collections grid
│       │   ├── product-gallery.tsx # Product image carousel
│       │   ├── suggested-product-card.tsx # Single product card
│       │   ├── review-carousel.tsx# Customer testimonials carousel
│       │   ├── social-proof.tsx   # Press logos / trust signals
│       │   ├── newsletter.tsx     # Email subscription form
│       │   ├── scroll-to-top.tsx  # Floating scroll-to-top button
│       │   ├── ArrowLink.tsx      # Custom link component with arrow icon
│       │   └── ui/                # Radix UI component library (shadcn pattern)
│       ├── context/
│       │   └── cart-context.tsx   # Shopping cart state (Shopify + mock)
│       ├── hooks/
│       │   ├── use-auth.ts        # Check if user is authenticated
│       │   ├── use-mobile.tsx     # Detect mobile breakpoint
│       │   ├── use-reduced-motion.ts # Respect prefers-reduced-motion
│       │   └── use-toast.ts       # Toast notification
│       ├── lib/
│       │   ├── shopify.ts         # Shopify Storefront API service layer
│       │   ├── i18n.ts            # i18next config + RTL init
│       │   ├── analytics.ts       # GA4 tracking helper
│       │   ├── queryClient.ts     # TanStack Query global config
│       │   ├── collections.ts     # Collection data (Shopify + fallback)
│       │   ├── responsiveImage.ts # Shopify CDN image optimization
│       │   └── utils.ts           # Tailwind cn() utility
│       └── locales/
│           ├── en/common.json     # English translations
│           ├── fr/common.json     # French translations
│           └── ar/common.json     # Arabic translations
├── api/                           # Vercel Functions (serverless backend)
│   └── shopify.ts                 # Proxy Shopify Storefront GraphQL requests
├── vite.config.ts                 # Vite configuration
├── vite-plugin-meta-images.ts     # Custom plugin: updates OG image URLs
├── package.json                   # Dependencies + scripts
├── tsconfig.json                  # TypeScript configuration
├── tailwind.config.ts             # Tailwind CSS configuration
├── postcss.config.js              # PostCSS plugins
├── vercel.json                    # Vercel deployment config
├── .env.example                   # Environment variables template
├── SHOPIFY_SETUP.md               # Shopify integration guide
├── DESIGN.md                      # Design system & component patterns
└── .github/
    ├── API.md                     # API reference (Shopify proxy)
    ├── DEPLOYMENT.md              # Vercel deployment guide
    ├── TROUBLESHOOTING.md         # Common issues & solutions
    └── instructions/              # Architecture & coding guidelines
```
---

## Database Schema (v2+ Only)

> **Note:** Database features (auth, contact) are deferred for v2+. v1 uses Shopify-only architecture.

When implemented, Drizzle ORM will manage PostgreSQL schema:
| Column | Type | Notes |
|---|---|---|
| `id` | varchar (UUID) | Primary key |
| `email` | text | Unique, required |
| `password_hash` | text | bcrypt hash (12 rounds) |
| `first_name` | text | Optional |
| `last_name` | text | Optional |
| `created_at` | timestamp | Auto |

### `contact_messages`
| Column | Type | Notes |
|---|---|---|
| `id` | varchar (UUID) | Primary key |
| `name` | text | Required |
| `email` | text | Required |
| `subject` | text | Required |
| `message` | text | Required |
| `created_at` | timestamp | Auto |

### `newsletter_subscribers`
| Column | Type | Notes |
|---|---|---|
| `id` | varchar (UUID) | Primary key |
| `email` | text | Unique |
| `subscribed` | boolean | Default true |
| `created_at` | timestamp | Auto |

### `session` (auto-created by connect-pg-simple)
Stores encrypted session data in PostgreSQL. Table is created automatically on first run.

Run migrations with:
```bash
npm run db:push
```

---

## API Routes

**Full API reference:** See [.github/API.md](./.github/API.md)

All API requests go through **Vercel Functions** — a single serverless endpoint that proxies to Shopify:

### `/api/shopify` (POST) — Shopify GraphQL Proxy

Proxies any Shopify Storefront API v2024-01 query.

**Features:**
- Keeps Storefront token server-side (secure)
- Graceful fallback to mock data in development (`VITE_SHOPIFY_MODE=mock`)
- Fails loudly in production (`VITE_SHOPIFY_MODE=live`) if misconfigured
- Returns 503 when Shopify credentials are missing

**Example:**
```tsx
const res = await fetch("/api/shopify", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    query: "query { products(first: 12) { ... } }",
    variables: {}
  })
});
```

**Client Library:** `client/src/lib/shopify.ts` exports `shopifyService` with methods:
- `getProducts(first?, after?)`
- `getProductByHandle(handle)`
- `searchProducts(query, first?)`
- `getCollectionByHandle(handle, first?, after?)`
- `createCart()`
- `getCart(cartId)`
- `addToCart(cartId, lines)`
- `removeFromCart(cartId, lineIds)`
- `updateLineQuantity(cartId, lines)`

---

## Authentication & Contacts (v2+ Features)

The following are identified for v2:

### `/api/auth/register` — Sign Up
Create user account. Body: `{ email, password, firstName?, lastName? }`

### `/api/auth/login` — Sign In  
Authenticate user. Body: `{ email, password }`

### `/api/auth/logout` — Sign Out
Destroy session.

### `/api/contact` — Contact Form
Submit message. Body: `{ name, email, subject, message }`

---

## Internationalisation (i18n)

Implemented in `client/src/lib/i18n.ts`.

**Languages:** English (`en`), French (`fr`), Arabic (`ar`)

**How it works:**
1. `i18next-browser-languagedetector` detects language from `localStorage` key `turath_lang`, then browser preference
2. `applyRtl()` is called at module load (before React renders) — sets `<html dir="rtl" lang="ar">` when Arabic is active, preventing a first-render flash
3. Language switcher in the navbar (EN / FR / AR pill toggle on desktop, section in mobile hamburger) calls `i18n.changeLanguage()` and immediately triggers `applyRtl()`
4. Tailwind's `rtl:` variant works natively when `dir="rtl"` is set on `<html>`

**Translation files:** `client/src/locales/{en,fr,ar}/translation.json`
Cover: navbar, hero, contact form, newsletter, footer, announcement bar, language switcher labels.

---

## Analytics (Google Analytics 4)

**How it works:**
- `vite.config.ts` exports a custom Vite plugin (`ga4Plugin`) that uses the native `transformIndexHtml` hook
- At build/serve time, if `VITE_GA_MEASUREMENT_ID` is set, the plugin injects the GA4 `<script>` tags directly into `index.html`
- If the env var is absent, the HTML placeholder comment is left unchanged — no script is injected, no errors
- `client/src/lib/analytics.ts` provides a `trackEvent(name, params?)` helper for custom events

**Why not a runtime injection?** Injecting GA4 in `<head>` via HTML ensures it loads before any React code executes, giving accurate page-view attribution.

---

## Environment Variables

All variables documented in `.env.example`.

### Production Required
| Variable | Purpose | Example |
|---|---|---|
| `SHOPIFY_STORE_DOMAIN` | Shopify store URL | `mystore.myshopify.com` |
| `SHOPIFY_STOREFRONT_TOKEN` | Storefront API access token | `shpat_...` |

### Optional
| Variable | Purpose | Default |
|---|---|---|
| `VITE_SHOPIFY_MODE` | Fallback mode: `"live"` (fail on error) or `"mock"` (fallback to mock data) | `"mock"` |
| `VITE_GA_MEASUREMENT_ID` | Google Analytics 4 ID | — |
| `DATABASE_URL` | PostgreSQL connection (v2+ feature) | — |
| `RESEND_API_KEY` | Transactional email service (v2+ feature) | — |

**For detailed setup instructions,** see [.github/DEPLOYMENT.md](./.github/DEPLOYMENT.md)

---

## Quick Start

### Local Development

```bash
# 1. Install dependencies
npm install

# 2. Configure environment (copy .env.example to .env.local)
cp .env.example .env.local

# Edit .env.local with your Shopify credentials (optional for dev)
# SHOPIFY_STORE_DOMAIN=...
# SHOPIFY_STOREFRONT_TOKEN=...

# 3. Start dev server (Vite + Vercel Functions proxy)
npm run dev
```

Visit `http://localhost:5173` to start developing.

**Dev setup includes:**
- Vite hot module reloading (HMR)
- Vercel Functions emulator for `/api/shopify`
- Mock data fallback when Shopify is unconfigured

### Build for Production

```bash
npm run build
```

Outputs:
- `dist/public/` — React app (optimized, minified)
- `.vercel/` — Vercel Functions deployment metadata

### Local Build Preview

```bash
npm run build
vercel build && vercel start
```

Runs production build locally on `http://localhost:3000`.

---

## Deployment

**Platform:** Vercel (recommended)  
**Frontend:** Vercel CDN  
**Backend:** Vercel Functions  
**Database:** None (v1) — optional PostgreSQL for v2+

**Setup:** See [.github/DEPLOYMENT.md](./.github/DEPLOYMENT.md) for step-by-step Vercel configuration.

---

## Shopify Setup

**Required for production:**
1. Create Shopify Storefront API app
2. Generate access token
3. Set `SHOPIFY_STORE_DOMAIN` and `SHOPIFY_STOREFRONT_TOKEN` in Vercel environment

**Detailed guide:** See [SHOPIFY_SETUP.md](./SHOPIFY_SETUP.md)

---

## v1 Scope (Current Release)

✅ **Included:**
- Shopify headless ecommerce integration (products, variants, search)
- Shopping cart (client-side with Shopify checkout)
- Responsive design (mobile, tablet, desktop)
- Internationalization (EN, FR, AR with RTL)
- Product gallery & image optimization
- Google Analytics 4
- Mock fallback (development-safe)
- Vercel deployment ready

---

## v2+ Roadmap (Future Features)

These features are deferred for future releases:

- **User Authentication** — `/api/auth/register`, `/api/auth/login` (requires PostgreSQL + Passport.js)
- **Contact Form Backend** — `/api/contact` (save to database, send emails)
- **Newsletter Backend** — `/api/newsletter` (subscription management)
- **Order History** — Shopify Customer API integration
- **Password Reset** — Token generation & email verification
- **Cookie Consent** — GDPR-PIPEDA compliant banner + GA4 gating
- **SEO Files** — `sitemap.xml`, `robots.txt`
- **Security Hardening** — Rate limiting, HTTP security headers (Helmet.js)
- **Admin Dashboard** — Order history & account settings
