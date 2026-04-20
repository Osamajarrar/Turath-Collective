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

## Already Done ✅

- Premium product page redesign (unified 2-col layout, accordion, quantity stepper)
- Shop grid and "You May Also Love" suggested products
- Bilingual translation infrastructure (FR/EN/AR with i18next + RTL plumbing)
- Helmet CSP + HSTS, JSON body limit, trust-proxy config
- Shopify proxy route with rate limiter
- Session cookie hardened (`httpOnly`, `secure` in prod, `sameSite: lax`)
- Auth/PII redacted from request logs
- All known dependency CVEs patched (drizzle-orm, vite, esbuild)
