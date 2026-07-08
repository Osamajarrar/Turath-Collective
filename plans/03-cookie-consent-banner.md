# Plan 03 — PIPEDA/Law 25–compliant cookie consent banner

## Why this is required (not polish)

GA4 and PostHog both set analytics cookies/storage and (PostHog) record sessions. The brand is
Montreal-based and sells to Canadians: PIPEDA requires meaningful consent for non-essential
tracking, and Quebec's Law 25 explicitly requires **opt-in** consent for any non-essential
cookies — analytics must not fire before the visitor agrees. Today both trackers fire
unconditionally on page load.

## Design decisions

1. **Consent model: opt-in, two choices — "Accept analytics" / "Essential only".** No granular
   category matrix; the site has exactly one non-essential category (analytics). A third "manage"
   layer would be over-engineering and off-brand.
2. **Blocked-by-default**: no analytics until explicit accept. Declining must be as easy as
   accepting (Law 25 requirement) — two equal-weight buttons, no dark patterns, no cookie-wall.
3. **Persistence**: single `localStorage` key, e.g. `turath-consent` = `"granted" | "denied"`
   with a timestamp. Re-prompt only if the key is absent. (localStorage, not a cookie — it never
   needs to reach the server.)
4. **Copy tone**: quiet and editorial, matching the brand. One short sentence + link to
   `/privacy-policy`. No "We value your privacy!!" boilerplate. Must exist in EN/FR/AR
   (Law 25 makes FR effectively mandatory for a Quebec business).
5. **Placement**: fixed bottom bar (not a modal) — doesn't block browsing, which is both better
   UX and defensible since nothing tracks until consent.

## Implementation (build on `feature/posthog-analytics`, after PR #5 merges)

> ⚠️ This work depends on `initAnalytics()`/`trackEvent()` from PR #5. Branch from main only
> after PR #5 is merged; otherwise branch from `feature/posthog-analytics` and mark the PR as
> stacked.

### Files to create

- `client/src/lib/consent.ts` — `getConsent()`, `setConsent(granted)`, and a tiny subscriber so
  the banner and analytics react to changes. `setConsent(true)` calls `enableAnalytics()`;
  `setConsent(false)` calls `gtag('consent','update',{analytics_storage:'denied'})` and
  `posthog.opt_out_capturing()`.
- `client/src/components/cookie-consent.tsx` — the banner. Render inside `App.tsx` (so it's on
  every route). Styling: `bg-background border-t border-border`, label typography
  `text-[10px] font-bold uppercase tracking-[0.2em]` for buttons, body copy `text-sm
  text-muted-foreground font-light`. Respect `useReducedMotion` for the slide-in.
- Locale keys in `client/src/locales/{en,fr,ar}/common.json` under `consent.*`
  (message, accept, decline, privacyLink).

### Files to change

- **`vite.config.ts` (GA4 injection)** — add Google Consent Mode v2 defaults BEFORE the config
  line in the injected snippet:
  ```js
  gtag('consent', 'default', { analytics_storage: 'denied', ad_storage: 'denied',
    ad_user_data: 'denied', ad_personalization: 'denied' });
  ```
  With consent mode, gtag.js may still load but sets no cookies and sends no measurable hits
  until `consent update` grants it. On accept: `gtag('consent','update',{analytics_storage:'granted'})`.
- **`client/src/lib/analytics.ts`** — change `initAnalytics()` to check `getConsent()`:
  - consent granted → init PostHog exactly as today;
  - no decision / denied → do NOT call `posthog.init` at all (simplest, strongest guarantee —
    avoids the footgun of "cookieless until opt-in" configs). Export `enableAnalytics()` that
    performs the deferred init + fires a `$pageview` manually for the current page.
  - `trackEvent`/`trackEventThenNavigate` already no-op when posthog isn't initialized — no change.
- **`client/src/App.tsx`** — mount `<CookieConsent />`.
- **`client/src/pages/PrivacyPolicy.tsx`** — add/adjust the cookies section to describe the two
  categories and how to change your choice (see Plan 02; coordinate so the two PRs don't fight
  over the same section).

### Edge cases

- `begin_checkout` → navigates to Shopify's domain, which sets its own cookies under Shopify's
  policy — out of scope, but the privacy policy should mention checkout happens on Shopify.
- Banner must not cover the cart drawer checkout button on mobile (z-index below drawer,
  or auto-hide while drawer is open).
- SSR none (SPA) — read localStorage in a `useEffect`/lazy initializer, not at module top level.

## Acceptance criteria

- Fresh visitor: zero requests to `google-analytics.com`/`googletagmanager` measurement endpoints
  and zero PostHog `/e/` requests until Accept is clicked (verify with the Playwright script from
  Plan 01, asserting on network requests in all three states: no-choice, accepted, declined).
- Choice persists across reloads; declining leaves the site fully functional.
- Banner renders correctly in EN/FR/AR (RTL) and light of the existing `applyRtl` handling.

## Model recommendation

**Stronger model recommended** — touches the analytics init path and build-time GA snippet where
a subtle mistake (e.g. PostHog cookies set before opt-in) silently defeats the compliance goal;
the UI part is easy, the gating correctness is not.
