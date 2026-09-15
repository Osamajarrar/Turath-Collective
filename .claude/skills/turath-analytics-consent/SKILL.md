---
name: turath-analytics-consent
description: >
  Use for ANY work touching analytics or tracking in this repo — PostHog,
  GA4, new events, event properties, the consent banner, the Shopify checkout
  pixel — AND whenever analytics "mysteriously doesn't fire", a third-party
  script loads but sends nothing, or a new external script/domain is being
  added. Also use before capturing anything about a user or order (the repo
  has already leaked an email into event properties once), and before
  changing any VITE_* env var expecting it to take effect without a rebuild.
  If your symptom is "the SDK loads but zero requests appear in the network
  tab", read this BEFORE debugging code.
---

# Analytics, Consent, and PII — the Turath tracking stack

## Why this skill exists (real incidents)

- **PII shipped into PostHog**: server-side captures in `server/routes.ts`
  sent `properties: { email: user.email }` on `user_registered` and
  `user_logged_in`. The founder had to strip it himself (commit `2eebae0`,
  "remove exposed posthog email").
- **CSP silently ate a PostHog script**: `us-assets.i.posthog.com` wasn't in
  the helmet CSP, so PostHog feature scripts failed with no visible error
  until PR #5 added it.
- **Zero-capture mystery burned most of a debugging session**: SDK scripts
  returned 200 but no capture requests fired at all. Founder reports it was
  eventually fixed (as of 2026-07-12) but the root cause wasn't recorded.
- **Double-pageview trap**: `capture_pageview` is deliberately `false` with
  a manual `$pageview` fired in `enableAnalytics()` — because auto-capture
  fires during `init()` regardless of consent timing and would double-count.

## The architecture (verified file paths)

- `client/src/lib/consent.ts` — opt-in consent (PIPEDA / Quebec Law 25).
  Analytics are **blocked by default**; decision stored in localStorage key
  `turath-consent` and mirrored to a cookie on `.turathcollective.com` so
  the Shopify checkout pixel (`docs/shopify-checkout-pixel.md`) can read it.
  Import direction is one-way: consent.ts imports from analytics.ts.
- `client/src/lib/analytics.ts` — `initAnalytics()` no-ops unless consent is
  already "granted"; `enableAnalytics()` does the deferred init + manual
  `$pageview`; `trackEvent()` fans out to GA4 + PostHog;
  `trackEventThenNavigate()` (sendBeacon) exists for click-then-leave events
  like begin_checkout.
- `server/index.ts` (~lines 39–42) — helmet CSP `scriptSrc`/`connectSrc`.
- `vite.config.ts` — injects GA4 gtag at **build time** from
  `VITE_GA_MEASUREMENT_ID`, including Consent Mode v2 defaults.

## Runbook

1. **No PII in event properties, client or server.** No email, name,
   address, order-note free text. `distinctId` is the join key; PostHog
   person profiles carry identity, events don't. Before adding a property,
   ask: would this line survive the founder reading the event in the
   dashboard? Commit `2eebae0` is what it looks like when it doesn't.
2. **Every capture path must respect consent.** New client tracking goes
   through `trackEvent()`/`trackEventThenNavigate()` (already gated). Never
   call `posthog.init` or `posthog.capture` directly from components. Any
   NEW server-side or pixel capture path needs its own consent check — the
   client gate does not protect it.
3. **"Loads but doesn't fire" triage, in order:**
   a. Consent: on a fresh profile/incognito, nothing fires until the banner
      is accepted — that's correct behavior, not a bug.
   b. CSP: check `connectSrc`/`scriptSrc` in `server/index.ts`; a missing
      domain fails silently in the browser.
   c. Build-time vars: `VITE_*` values are baked at build. In Vercel a
      changed var needs a **fresh build**, not a cached redeploy; locally,
      restart the dev server.
   d. Project side: quota/settings in the PostHog dashboard
      (`plans/01-posthog-capture-debug.md` has the full protocol —
      historical, since the mystery is reportedly fixed, but the checks
      remain valid if captures stop again).
4. **Adding any new third-party script/domain**: add it to CSP in the same
   PR, and say so in the PR body. This is the single most common silent
   failure in this repo.
5. **Don't re-add auto pageview capture.** The `capture_pageview: false` +
   manual `$pageview` design is deliberate (see comment in analytics.ts);
   "simplifying" it reintroduces double counting or drops the mid-session
   consent case.

## When NOT to use this skill

- Analytics event NAMING or funnel design questions — check
  `plans/01-posthog-capture-debug.md` and MARKETING_STRATEGY.md context
  first; this skill is mechanics and safety, not taxonomy.
- Generic debugging discipline (two failed fixes → wrong diagnosis) —
  that's `fable-mode` Gate 3.
- Copy shown IN the consent banner — `turath-i18n-copy` (keys) and
  `turath-claims-audit` (what it may promise).
