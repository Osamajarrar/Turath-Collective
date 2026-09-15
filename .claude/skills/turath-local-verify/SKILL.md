---
name: turath-local-verify
description: >
  Use whenever you need to RUN or VERIFY anything in this repo on this
  machine — before claiming a UI change works, before committing, when
  setting up browser automation (Chrome extension is DENIED for localhost
  here; use Playwright), when the product page is involved (it has three
  availability states and a bug already shipped by testing only one), when
  checkout lands on a password page (expected), or when `npm run check`
  errors look pre-existing (they aren't allowed to be). Covers the dev
  server, mock-vs-Shopify data, Playwright-on-this-machine mechanics, and
  the state-matrix that caught the sticky-bar bug.
---

# Verifying on This Machine — the checks that actually catch bugs here

## Why this skill exists (real incidents)

- **The sticky-bar bug shipped because only the happy path was tested**: an
  IntersectionObserver watched the Add to Bag button, but for sold-out
  variants the product page renders a Notify Me button INSTEAD — the
  observed element never mounted, so the sticky bar never appeared (or got
  stuck). Fixed in `1d418a3` by observing the stable CTA container div
  (`ctaSectionRef` in `client/src/pages/product.tsx`). The bug is invisible
  unless you test an unavailable variant.
- **`npm run check` was broken for a while and regressions hid inside it**
  (fixed in PR #5: tsconfig `ignoreDeprecations`/`baseUrl` plus a
  `server/storage.ts` stub). If typecheck fails, that failure is part of
  your task — "pre-existing" is not a valid label here anymore.
- **The Chrome extension refused localhost automation** on this machine; a
  session lost time discovering this. Playwright (v1.61) is installed and
  works — but scripts must live INSIDE the repo for module resolution, not
  in the scratchpad.

## The environment (verified)

- `npm run dev` → Express + Vite middleware on **port 5000** (one server,
  not two).
- `VITE_USE_MOCK_PRODUCTS=true` swaps in the local mock catalog; otherwise
  the server proxies Shopify Storefront GraphQL at `/api/shopify`
  (needs `SHOPIFY_STORE_DOMAIN` + `SHOPIFY_STOREFRONT_TOKEN`).
- Real checkout redirects to `checkout.turathcollective.com/password` —
  the dev store password still blocks it. **Expected**; do not debug it.
- `npm run check` = typecheck; `npm run build` is the only real test of a
  vite.config.ts change.
- Fresh browser profiles show ZERO analytics traffic until the consent
  banner is accepted — correct opt-in behavior, not a bug
  (see `turath-analytics-consent`).

## Runbook

1. **Browser verification = Playwright, not the Chrome extension.**
   ```js
   // verify-x.mjs — place in the REPO ROOT (module resolution), delete before commit
   import { chromium } from "playwright";
   const browser = await chromium.launch();
   const page = await browser.newPage();
   await page.goto("http://localhost:5000/");
   // interact, then assert on what you SEE:
   await page.screenshot({ path: "../screenshot.png" }); // outside repo
   await browser.close();
   ```
   Read the screenshot with the Read tool. Keep artifacts out of the repo
   (lighthouse reports were once accidentally tracked and had to be
   untracked, commit `1e44416`).
2. **Product-page changes: test the full availability matrix**, not one
   state — (a) available variant, (b) sold-out variant of an available
   product, (c) `availableForSale: false` product. The main CTA, the sticky
   bar, and the quantity UI all branch on these; state (b) is where `1d418a3`
   hid. With mock products, edit the mock catalog's `quantityAvailable` to
   force each state.
3. **Refs/observers + conditional rendering is a known trap in this
   codebase.** Before attaching a ref or observer to an element inside a
   ternary/conditional block in product.tsx (or any page with availability
   branching), attach it to the stable parent container instead.
4. **`npm run check` green is a merge requirement.** Run it before every
   commit; if it fails, fix it in this PR or stop and report — never label
   it pre-existing.
5. **Scale the check to the change**: copy-only diffs need a render check in
   affected locales (EN at minimum; AR if the key is populated — RTL);
   vite.config/CSP/env changes need `npm run build` plus a real page load
   with the network tab (via Playwright request logging).

## When NOT to use this skill

- WHAT to verify and when "done" is claimable — `fable-mode` Gates 1 & 4.
  This skill is HOW to verify on this specific machine and codebase.
- Analytics-specific triage (nothing fires, CSP, consent) —
  `turath-analytics-consent` has the ordered checklist.
- PR mechanics after verification passes — `turath-pr-workflow`.
