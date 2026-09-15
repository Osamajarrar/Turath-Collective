# Plan 01 — PostHog capture silently not firing (follow-up investigation)

**Status: partially resolved.** The code-side work shipped in PR #5 (`feature/posthog-analytics`).
This plan covers what's still unexplained and how to close it out.

## What was already done (PR #5 — do not redo)

- `begin_checkout` rewired from the dead `handleBuyNow` to the real cart-drawer checkout button
  (`client/src/components/navbar.tsx`), sent via `trackEventThenNavigate()` (sendBeacon /
  `event_callback`) so it survives the redirect to Shopify checkout.
- CSP fix in `server/index.ts`: `us-assets.i.posthog.com` added to `scriptSrc`/`connectSrc`.
- `npm run check` repaired (invalid `ignoreDeprecations`, broken `server/storage.ts`).

## The unresolved problem

With the CSP fixed, a scripted Playwright run (2026-07-07, local dev server, fresh browser profile,
clean storage) confirmed:

- `config.js` (remote config) and all PostHog feature scripts load with 200s, no console errors.
- The full UI flow works: product page → Add to Bag → cart drawer → Checkout → Shopify redirect.
- **Zero capture requests are ever made.** No `/e/`, `/capture/`, or `/i/v0/e/` call — not even
  `$pageview` on page load. `add_to_cart` / `begin_checkout` therefore can't be confirmed either.

Because a clean profile rules out opt-out cookies/localStorage, and the SDK loads fine, the
remaining suspects are **project-side in PostHog**, not in this repo's code.

## Investigation steps (in order — stop at the first hit)

1. **PostHog dashboard → Billing/Usage**: check whether the project is quota-limited. When a
   project exceeds free-tier quota, posthog-js receives `quotaLimited` in the remote config and
   silently drops all events client-side. This exactly matches the observed symptom. (Memory note:
   a session recording was manually deleted around when replay "stopped working" — quota problems
   were suspected then too.)
2. **Fetch the remote config directly** and read it: `https://us-assets.i.posthog.com/array/<VITE_POSTHOG_KEY>/config.js`
   — look for `quotaLimited`, `analytics: {"endpoint": ...}` anomalies, or capture-disabling flags.
3. **Verify the key**: PostHog dashboard → Project Settings → confirm the current project API key
   matches `VITE_POSTHOG_KEY` in `.env.local` AND in Vercel env vars (an old key from a deleted
   project would still serve config but drop events).
4. Only if 1–3 are clean: instrument posthog-js internal state in the browser console on the
   deployed preview URL (`posthog.has_opted_out_capturing()`, `posthog._requestQueue`, enable
   `posthog.debug()`), since something environmental would then be interfering.

## After capture works

- Re-run the verification (see PR #5 description): confirm `$pageview`, `add_to_cart`,
  `begin_checkout` appear in PostHog Activity from a preview-URL session.
- Re-check session replay, which was almost certainly broken by the same root cause(s)
  (CSP first, now this).
- Update `MVP_LAUNCH_CHECKLIST.md` §13a checkboxes.

## Model recommendation

**Human-in-the-loop required** (PostHog dashboard access), then any small model can run the
re-verification script; no code judgment involved unless steps 1–3 all come back clean.
