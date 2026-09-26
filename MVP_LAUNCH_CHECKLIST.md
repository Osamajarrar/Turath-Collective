# Turath Collective — MVP Launch Checklist

Status snapshot of what's missing or pending before the site can go live at **turathcollective.com**.

> **Read this section first. Everything below §1 is older detail that has NOT been
> re-verified since 2026-08-01 — much of it is already done.** This top section is the
> current view, accurate as of 2026-09-20; treat the rest as history until it is checked.

---

# Current state — 2026-09-20

**The infrastructure is finished; the product decisions are not.** Nothing on the
blocking list below is waiting on engineering. It is waiting on product photography,
on taste, and on facts only the founder can confirm. Per-branch detail lives in
[plans/11-dev-backlog.md](plans/11-dev-backlog.md).

The founder's stated order of work: finish the look, then fix the content, then take
the Shopify password off last.

## Blocking launch — founder decisions, no code

| # | Item | State |
|---|---|---|
| 1 | **Product photography** | The real blocker on "finishing the look". There are no product images; everything on screen is placeholder or mock. Design decisions below cannot really be settled against fake assets |
| 2 | **Homepage design** | Founder leans to the current default (Golden Hour) "with some adjustments". The gallery of six alternatives at `/design` is still shipping — decide what to keep, then delete the gallery |
| 3 | **Catalogue grouping** | Undecided, and the prior question is whether to have categories at all. See item 8 — the *data* decision is urgent even if the *navigation* decision is not |
| 4 | **Logo slogan** | Three options on the table: change to "History, still handmade.", keep "Heritage Craftsmanship", or drop the slogan entirely. SVG work is manual |
| 5 | **Navbar colours** | Open design item |
| 6 | ~~Support email routing~~ | **Done 2026-09-26** — see §Email routing below |
| 7 | **Content audit** | Deferred deliberately until the look is settled. Includes the unverified Hebron "2,000 years" claim in the FAQ and the reply-time promise (currently promised nowhere, which is the honest state) |
| 12 | **⏰ REMINDER — remove the `best-seller` tag before launch** | Kept deliberately for now to see the badge. But dev and production read the **same** Shopify store, so it is visible on the live `/shop` and `/product/indigo-mosaic-bowl` today, both publicly reachable during coming-soon. To preview badges without touching real data, set `VITE_USE_MOCK_PRODUCTS=true` in `client/.env.local` — the mock catalog has Best Seller, New and Limited items. Badges are manual Shopify tags: `best-seller`, `new`, `limited`. Use only when true; `limited` never as urgency |
| 13 | **Email templates in Resend** | Move email content out of the inline HTML in `server/email.ts` into Resend Templates so wording and design change without a deploy. Founder builds the templates; the code then sends by template ID. Covers the contact confirmation (exists, inline today) and the notify-me, back-in-stock and newsletter-welcome emails (do not exist) |
| 14 | ~~DMARC~~ | **Enabled 2026-09-26** via Cloudflare DMARC Management. Still to do: after ~2 weeks of reports showing only Resend and Cloudflare sending, move the policy from monitor to `p=quarantine` |
| 15 | ~~Real-user analytics~~ | **Closed 2026-09-26 by founder decision.** Own traffic stays in; AI crawlers are not blocked (keeps the brand in AI search answers). Known bots are already excluded by GA4 and PostHog defaults, and most AI crawlers never run the JS that loads analytics |

## Blocking launch — needs code

| # | Item | Notes |
|---|---|---|
| 8 | ~~Category source of truth~~ | **Done 2026-09-26.** Category is the Shopify **Type** field read literally via `categoryHandleFromType()` in `client/src/lib/collections.ts` — no keyword guessing, no tag fallback, no default, and no reassigning unavailable crafts to the first available one. A product whose Type matches no available craft is not shown; dev console says why. **Founder rule going forward: set every product’s Type to its craft (`Ceramics`, `Glass`), not its shape.** The live Indigo Mosaic Bowl is set to Ceramics |
| 9 | **Email templates** | The contact confirmation exists. The notify-me confirmation, the "it's available now" email and the newsletter welcome do not. `sendNewsletterWelcome` must not be called until it has a working unsubscribe (CASL) |
| 10 | **Arabic, if it ships** | 303 keys missing (`test/ar-parity-baseline.json`). Deliberately hidden from the language switcher, which is the honest state |

## Last, by the founder's own sequencing

| # | Item | Notes |
|---|---|---|
| 11 | **Remove the Shopify storefront password** | Until this is done nobody can buy anything, and `VITE_REAL_CHECKOUT` must stay unset so checkout shows the intent dialog rather than a password wall. Deliberately the final step before launch, not an oversight |

## Email routing — done and verified 2026-09-26

- **Inbound:** `support@turathcollective.com` forwards to `collectiveturath@gmail.com`
  through Cloudflare Email Routing. Verified by sending from a personal address. Forwarded
  mail can land in Gmail spam at first; a Gmail filter on `to:support@turathcollective.com`
  set to "Never send it to Spam" is the durable fix. There is no auto-reply for direct
  emails to `support@` — deliberately, the contact form is the path with a confirmation.
- **Outbound:** Resend sends from `noreply@turathcollective.com`. A live contact-form
  submission produced both emails, both delivered: the visitor confirmation ("We received
  your message") and the notification to `ADMIN_EMAIL`.
- **The DNS went missing once.** Resend’s three records (`resend._domainkey`, and TXT + MX
  on `send`) were present on 2026-09-15 and gone by 2026-09-26, probably collateral from
  deleting a Cloudflare project. The site kept working, so nothing noticed: adding contacts
  to an audience needs no domain verification, but *sending* does. Re-added 2026-09-26 with
  the same DKIM key. If contact-form mail stops arriving, check these first.
- **Not done, optional:** a `_dmarc` TXT record (`v=DMARC1; p=none;`). Helps new-domain
  deliverability, blocks nothing.
- **Not done, optional:** `ADMIN_EMAIL` in `server/email.ts` still points straight at the
  Gmail. Pointing it at `support@` instead would mean one address to change later, at the
  cost of an extra forwarding hop — which is exactly where the spam placement happens.
  Direct delivery works; leave it unless there is a reason.

## Done — do not redo

**Hosting and delivery.** Migrated off Vercel onto a Cloudflare Worker (2026-09-14/15);
Vercel project and account deleted, `vercel.json` and `api/` removed from the repo.
`workers_dev` and `preview_urls` are off so the storefront serves only from the domain.
`robots.txt` keeps `/design` and `/shop-filters` out of search. One CSP source of truth
in `worker/security-headers.ts`; `client/public/_headers` is generated from it. The
Shopify proxy's 23 tests now drive the Worker rather than the deleted Vercel function.
Rate limiting is real and verified — note that only a **burst** trips it; a sequential
loop does not, and wrongly reading that as a bug cost a session (see `wrangler.toml`).

**Analytics and consent.** GA4 and PostHog confirmed arriving in their dashboards
(2026-09-20), PostHog session replay on. Sentry on both the client and the Worker, two
projects, emails scrubbed by `shared/scrub.ts`. Consent is a **sticky bottom bar**, not
the old modal, and it is switched by `VITE_CONSENT_BAR_SHOWN` — unset in production
today, so there is no bar and analytics run for every visitor. That is a deliberate
pre-launch decision by the founder; the flag restores opt-in consent for launch, and
the privacy policy's wording follows the flag automatically.

**Legal.** Privacy policy names Cloudflare (not Vercel) as host, and lists PostHog and
Sentry in the Law 25 sub-processor table, EN and FR.

**Earlier.** The contact form rebuilt on Resend, checkout-intent capture with the CASL
two-consent split, newsletter on a Resend audience, 208 vitest tests, the self-hosted
auth stack and file-backed stores deleted, the D1 dialect conversion, embroidery removed
from every surface, and the Arabic-default language bug.

## Deliberately NOT done

- **Anonymous pre-consent analytics** — specified, legally unsettled, superseded for now
  by the decision to run analytics unconditionally pre-launch
- **Granular cookie category toggles** — only one non-essential category exists today;
  the stored record is already category-keyed, so adding them later is cheap
- **Real checkout** — gated on item 11
- **Reviews, accounts, favourites** — deferred post-MVP by DECISIONS.md
- **A second notify-me path** — `/api/reserve` and its separate notify audience exist
  and are tested, but stay behind `VITE_NOTIFY_ME_ENABLED` until there is something to
  notify people about

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
- [ ] **Replace placeholder reviews in `review-carousel.tsx`** — currently hardcoded fake names/cities/quotes (Elena M., Sami K., Amira J.) for structural testing only; gated behind `VITE_SHOW_PLACEHOLDER_CONTENT` env flag, must stay unset in the Cloudflare build environment until real reviews exist
- [ ] **Replace placeholder Instagram community in `social-proof.tsx`** — currently hardcoded fake usernames (@layla_designs, @marwan_ab, @thecuratedhome) reusing product photos; gated behind same `VITE_SHOW_PLACEHOLDER_CONTENT` flag, must stay unset in the Cloudflare build environment until real content exists
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
      **Still needs the env vars to actually report:** `VITE_SENTRY_DSN` was set in Vercel, which
      is now deleted — it must be re-set in the Cloudflare **build** environment (a build-time
      var, so a rebuild is required, not a redeploy). `SENTRY_DSN` for the Worker is a runtime
      var in `wrangler.toml`/secrets. Neither was verified in this session.
- [ ] Configure log retention / rotation in production
- [ ] Backup strategy — N/A while no database is provisioned (`shared/schema.ts` is commented out, D1/SQLite dialect). Revisit if D1 is ever created
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
