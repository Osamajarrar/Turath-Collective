# Turath Collective — MVP Launch Checklist

Status snapshot of what's missing or pending before the site can go live at **turathcollective.com**.

---

## 1. Commerce (Shopify Headless)

- [ ] **Connect live Shopify store**
  - Set `SHOPIFY_STORE_DOMAIN` (e.g. `turath-collective.myshopify.com`)
  - Set `SHOPIFY_STOREFRONT_TOKEN` (Storefront API access token, read-only scope)
  - Verify `/api/health` returns `"shopify": "connected"`
- [ ] **Replace customer auth (current Express auth is a placeholder)**
  - Remove `/api/auth/*` routes, `server/auth.ts`, `passport`, `connect-pg-simple`, `bcryptjs` deps, and `users` table
  - Wire Shopify Customer Account API for login / register / order history
- [ ] **Cart & checkout**
  - Implement Shopify Cart API (create cart, add lines, checkout URL redirect)
  - Persist cart ID in `localStorage`
- [ ] **Product data parity**
  - Confirm `normaliseShopify()` in `client/src/pages/product.tsx` returns ≥4 images, populated `specs`, and correct `quantityStyle` so Shopify products render the new design (the redesign currently displays correctly only when those fields are present)
  - Decide how to populate `specs` (Shopify metafields vs. hardcoded per-collection)
- [ ] **Multi-currency / shipping zones** confirmed in Shopify admin (CAD primary, USD secondary)

## 2. Email (Resend)

- [ ] Set `RESEND_API_KEY`
- [ ] Verify sending domain `turathcollective.com` in Resend dashboard (SPF, DKIM, DMARC records)
- [ ] Re-enable `/api/contact` route in `server/routes.ts` and wire `sendContactEmail` + `sendContactConfirmation`
- [ ] **Before re-enabling: HTML-escape interpolated values in `server/email.ts`** (currently flagged as XSS risk by SAST — left intentionally because route is disabled)
- [ ] Decide on newsletter provider (Mailchimp or Klaviyo) and wire `/api/newsletter`
- [ ] Add a basic rate limiter to the contact endpoint when re-enabled

## 3. Analytics

- [ ] Set GA4 measurement ID env var consumed by the custom Vite `ga4Plugin` in `vite.config.ts`
- [ ] Verify pageview + key events fire (product view, add-to-cart, checkout start) in GA DebugView
- [ ] Add cookie-consent banner if targeting EU traffic (GDPR)

## 4. Internationalization (FR / EN / AR)

- [ ] Audit AR translations end-to-end (currently only structural keys exist for some pages)
- [ ] Verify RTL layout on every page: shop, product, cart, checkout, footer
- [ ] Confirm font fallbacks for Arabic (current Playfair/Montserrat don't cover Arabic glyphs — need a paired Arabic serif/sans, e.g. Amiri / Noto Sans Arabic)
- [ ] `hreflang` tags in `client/index.html` for SEO

## 5. Content

- [ ] Replace all placeholder/mock product data with real Shopify products (5 mock products currently live in `client/src/data/products.ts`)
- [ ] **Replace placeholder reviews in `review-carousel.tsx`** — currently hardcoded fake names/cities/quotes (Elena M., Sami K., Amira J.) for structural testing only; gated behind `VITE_SHOW_PLACEHOLDER_CONTENT` env flag, must stay unset in Vercel until real reviews exist
- [ ] **Replace placeholder Instagram community in `social-proof.tsx`** — currently hardcoded fake usernames (@layla_designs, @marwan_ab, @thecuratedhome) reusing product photos; gated behind same `VITE_SHOW_PLACEHOLDER_CONTENT` flag, must stay unset in Vercel until real content exists
- [ ] Final hi-res product photography (≥4 angles per product; consistent crop / background)
- [ ] Artisan story copy (Montreal + Palestine origin narrative)
- [ ] About page content (mission, sourcing, ethics)
- [ ] Hero banner imagery for homepage
- [ ] Open Graph / Twitter Card images per major page

## 6. Legal & Compliance

- [ ] Privacy Policy page
- [ ] Terms of Service page
- [ ] Shipping & Returns policy page
- [ ] Cookie policy + consent banner (if EU/UK traffic expected)
- [ ] Accessibility statement (target WCAG 2.1 AA)

## 7. SEO

- [ ] `sitemap.xml` (server-generated or static)
- [ ] `robots.txt` (currently default; review before launch)
- [ ] Per-page meta titles/descriptions in all three languages
- [ ] Structured data: `Product`, `Organization`, `BreadcrumbList` JSON-LD

## 8. Infrastructure / Deployment

- [ ] Production deployment on Replit (Reserved VM or Autoscale)
- [ ] Custom domain `turathcollective.com` connected with TLS
- [ ] Set production env vars in deployment secrets:
  - `SESSION_SECRET` (until auth is removed)
  - `DATABASE_URL` (Replit-managed)
  - `SHOPIFY_STORE_DOMAIN`, `SHOPIFY_STOREFRONT_TOKEN`
  - `RESEND_API_KEY`
  - GA4 measurement ID
- [ ] Confirm `app.set("trust proxy", 1)` works correctly behind Replit's proxy in prod (rate limiter relies on it)
- [ ] Uptime monitoring (e.g. UptimeRobot) on `/api/health`

## 9. Performance

- [ ] Image optimization audit — confirm `ResponsiveImage` serves AVIF/WebP and correct `srcset` for product galleries
- [ ] Lighthouse pass: Performance ≥ 85, Accessibility ≥ 95, Best Practices = 100, SEO ≥ 95
- [ ] Verify lazy-loading on below-the-fold images (suggested products, secondary gallery)

## 10. Quality Assurance

- [ ] Cross-browser smoke test: Chrome, Safari, Firefox, mobile Safari, Chrome Android
- [ ] Add-to-cart and checkout flow tested with a real Shopify test order
- [ ] Email deliverability test (contact form lands in inbox, not spam) once Resend re-enabled
- [ ] Manual RTL pass for Arabic
- [ ] 404 and error pages styled consistently

---

## 11. Detailed Shopify Integration Notes

- [ ] **Storefront API token scopes** — read_products, read_product_listings, read_collections, read_inventory, unauthenticated_read_*; write_checkouts for cart
- [ ] **Metafields strategy** — define a namespace (e.g. `turath.specs`) for: dimensions, materials, care instructions, artisan name, region of origin, edition size. Required for product detail accordion to show real data instead of fallback copy.
- [ ] **Variant model** — color/size mapping; ensure swatch hex codes stored as a metafield on each variant (currently the shop-page swatches read `variant.colorHex`)
- [ ] **Collection structure** — at minimum `ceramics`, `embroidery`, `new-arrivals`, `best-sellers`, `limited-edition` to drive shop filters and homepage modules
- [ ] **Inventory display** — decide whether to show "low stock" / "sold out" badges based on `availableForSale` and `quantityAvailable`
- [ ] **Tax & shipping** — configure in Shopify admin: Quebec QST + GST, US sales tax (Shopify Tax), international shipping zones with calculated rates
- [ ] **Order notifications** — customize Shopify's transactional emails to match brand (logo, colors, FR/EN/AR copy)
- [ ] **Webhook endpoints** (optional v1) — `orders/create`, `customers/create` for any future CRM sync

## 12. Accessibility (WCAG 2.1 AA)

- [ ] All interactive elements reachable by keyboard (tab order, visible focus rings)
- [ ] Color contrast ≥ 4.5:1 for body text (audit burgundy on cream combinations)
- [ ] `alt` text on every product image — pulled from Shopify image `altText` field, not auto-generated
- [ ] Form inputs have associated `<label>` elements
- [ ] Quantity stepper announces value changes to screen readers (`aria-live`)
- [ ] Carousel on mobile product page has prev/next controls reachable without swipe
- [ ] Skip-to-content link in header
- [ ] Reduced-motion media query respected by all framer-motion animations (currently honored on shop grid only — audit elsewhere)

## 13. Security / Ops Hardening (Post-Launch)

- [ ] Run a fresh dependency + SAST scan after Shopify auth migration
- [ ] HTML-escape interpolated values in `server/email.ts` before re-enabling contact route
- [ ] Add a tight rate limiter (e.g. 5/min) to contact and newsletter endpoints when re-enabled
- [x] Set up error tracking (Sentry) for both client and server — client via
      `@sentry/react` inside the consent gate (`client/src/lib/monitoring.ts`), Worker via
      `@sentry/cloudflare` (`worker/index.ts`), emails scrubbed from both by
      `shared/scrub.ts`. Two Sentry projects, separate alert rules.
      **Still needs the env vars to actually report:** `VITE_SENTRY_DSN` is set in Vercel
      (done, requires a fresh build not a cached redeploy); `SENTRY_DSN` for the Worker is
      set at Cloudflare cutover — see plan 10 phase 5 step 0.
- [ ] Configure log retention / rotation in production
- [ ] Backup strategy for the Postgres database (Replit-managed snapshots verified working)
- [ ] Review all `process.env` reads — fail fast at boot if a required prod var is missing
- [ ] Consider `helmet` `crossOriginEmbedderPolicy` and `referrerPolicy: "strict-origin-when-cross-origin"` once Shopify CDN domains are finalised in CSP

## 13a. PostHog Analytics — Open Issues (found 2026-07-05)

- [x] CSP `scriptSrc` was missing PostHog's asset domains (`us-assets.i.posthog.com`, `*.posthog.com`),
      blocking `config.js`, `posthog-recorder.js`, `surveys.js`, `dead-clicks-autocapture.js`, and
      `web-vitals.js` from ever loading — likely the root cause of session replay silently not working.
      Fixed in `server/index.ts` CSP `scriptSrc`/`connectSrc`.
- [ ] **Still unresolved**: even after the CSP fix, no PostHog capture requests (`$pageview` or custom
      events) were observed firing at all when testing locally against `/product/indigo-mosaic-bowl` —
      `config.js` and the feature scripts load fine (200s, no console errors), but no `/e/` or `/capture`
      network call was ever seen, even after waiting 15s. Needs deeper investigation: check PostHog
      project settings (event capture toggle, autocapture config in the loaded remote config), verify
      `VITE_POSTHOG_KEY`/`VITE_POSTHOG_HOST` values in `.env.local` are valid/current, and check
      posthog-js's internal state (queue/flush behavior) rather than just network requests.
- [x] `handleBuyNow` in `client/src/pages/product.tsx`, which fired `begin_checkout` but was never
      wired to any button, has been removed. `begin_checkout` now fires from the real cart-drawer
      checkout button (`data-testid="button-cart-checkout"` in `navbar.tsx`) via
      `trackEventThenNavigate()`, which uses sendBeacon/event_callback so the event survives the
      redirect to Shopify checkout. (`shopifyService.buyNow` and the "Buy Now" locale strings are
      kept for a future Buy Now button.)
- [ ] Once capture requests are confirmed working, re-verify `add_to_cart` and `begin_checkout` fire
      end-to-end. A local Playwright run on 2026-07-07 confirmed the UI flow works (add to cart →
      drawer checkout button → redirect to Shopify) but still saw **zero** PostHog capture requests,
      not even `$pageview`, while config.js and all feature scripts load fine. That pattern strongly
      suggests a PostHog project-side cause: check billing/quota limits and project settings in the
      PostHog dashboard, and inspect the remote config (`/array/<key>/config.js`) response for
      quota/capture flags.

## 14. Pre-Launch Soft Test (Recommended)

- [ ] Deploy to a staging subdomain (e.g. `staging.turathcollective.com`) with `noindex` meta
- [ ] Invite 5–10 trusted users to walk through: browse → product → add to cart → checkout → order confirmation email
- [ ] Collect feedback in a single doc; triage blocker vs. nice-to-have
- [ ] Run Lighthouse + axe DevTools on every key page
- [ ] Place one real test order end-to-end with refund afterwards
- [ ] Verify Shopify order fulfillment workflow with the artisan / fulfillment partner

## 15. Launch Day Runbook

- [ ] Switch DNS to production deployment; verify TLS cert is valid
- [ ] Remove `noindex` meta tag and submit `sitemap.xml` to Google Search Console + Bing Webmaster Tools
- [ ] Verify GA4 receiving live traffic
- [ ] Announce on social channels with prepared assets
- [ ] Monitor `/api/health`, GA4 real-time, Shopify orders dashboard, and error tracker for the first 24h
- [ ] Have a rollback plan: prior deployment kept warm so you can flip back if a regression appears

---

## Already Done ✅

- Premium product page redesign (unified 2-col layout, accordion, quantity stepper)
- Shop grid and "You May Also Love" suggested products
- Bilingual translation infrastructure (FR/EN/AR with i18next + RTL plumbing)
- Helmet CSP + HSTS, JSON body limit, trust-proxy config
- Shopify proxy route with rate limiter
- Session cookie hardened (`httpOnly`, `secure` in prod, `sameSite: lax`)
- Auth/PII redacted from request logs
- All known dependency CVEs patched (drizzle-orm, vite, esbuild)
