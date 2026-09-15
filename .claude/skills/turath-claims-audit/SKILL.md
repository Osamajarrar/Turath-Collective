---
name: turath-claims-audit
description: >
  Use BEFORE writing or editing ANY user-facing copy in this repo — product
  descriptions, legal/policy pages, FAQ, About, badges, banners, marketing
  copy, PR-suggested taglines — and especially before typing any NUMBER a
  customer could rely on (shipping days, return windows, refund timelines,
  free-shipping thresholds, years of tradition, response times). Also use when
  asked to "fix", "polish", or "fill in" policy text, when a page contradicts
  another page, or when adding anything that looks like social proof (reviews,
  ratings, follower counts, "Top Rated"/"Best Seller" badges). The trigger is
  copy, not code: if your diff touches a locales/*.json file or a string a
  customer reads, run this first. This repo has repeatedly shipped invented
  business facts that the founder later had to hunt down and retract.
---

# Claims Audit — never invent a business fact

Every rule here traces to a real incident in this repo's history. This is
written procedure for future sessions, nothing more.

## Why this skill exists (real incidents)

- The Shipping & Returns page shipped with **invented numbers** no one ever
  approved: "2–4 business days" processing, "5–7 business days" refund,
  "return shipping is covered by Turath Collective", "we will respond within
  2 business days" (while the contact route is disabled and the form discards
  messages). PR #17 (commit `6343b31`) had to rewrite all of it and left the
  refund timeline as a literal `[X business days — confirm with Shopify
  Payments docs]` placeholder because the true number was unknown.
- A "$100 CAD free shipping" line was removed from legal copy (pricing
  decision pending) — but the navbar `announcement` key at
  `client/src/locales/{en,fr,ar}/common.json:18` **still claims it in all
  three languages**. One claim, stated in two places, fixed in one. Check
  whether this is still unresolved before touching either.
- A fake **"Top Rated" badge** (no rating system exists) shipped on the
  product page; commit `20ebb1b` replaced it with the real
  `shop.badges.bestSeller` key.
- FAQ claimed **"over 2,000 years of continuous pottery tradition"** and an
  orphaned About key claimed "over five hundred years" — unsourced and
  mutually contradictory. Both softened in `20ebb1b`.
- Fake reviews and social-proof components shipped and had to be ripped out
  by the founder personally (commit `c92704d`, "remove fake stuff"). They
  now exist only behind `VITE_SHOW_PLACEHOLDER_CONTENT` (see
  `client/src/components/review-carousel.tsx:2` — **never set in Vercel**).

## The rule

A user-facing claim is either (a) verified true this session, (b) copied
verbatim from a page that already states it (after checking they agree), or
(c) written as an explicit bracketed placeholder and flagged in the PR body
as **needs founder confirmation**. There is no fourth category. "Plausible
for an e-commerce store" is how every incident above happened.

## Runbook

1. **Before writing a number, grep for the fact everywhere:**
   ```
   grep -rn "business days\|CAD\|48\|14-day\|free shipping" client/src/locales/
   ```
   Adapt the pattern to the claim. A claim that appears in N places must be
   changed in N places or not at all. Remember `announcement` in common.json —
   the navbar banner is the most-missed spot.
2. **Classify per the two-tier honesty framework** (CLAUDE.md): is this an
   *old object made with an old craft* (Hebron ceramics) or a *new object
   made with an old craft* (glass pomegranate)? Copy must never let tier-two
   pieces borrow tier-one age. "History, still handmade." works for both;
   "centuries-old piece" only for tier one.
3. **Unknown fact → placeholder, not guess.** Write
   `[X — founder to confirm]` in the copy itself, keep it in the PR diff so
   it cannot ship silently, and list it under a "Needs founder confirmation"
   heading in the PR body. PR #17 established this pattern; follow it.
4. **Never promise what the backend can't do.** Contact form and newsletter
   have no backend (routes disabled behind `AUTH_ENABLED = false` in
   `server/routes.ts`; the form fakes success). No copy may promise
   responses, subscriptions, or confirmation emails until they're wired.
5. **No manufactured scarcity or social proof, ever.** No reviews, ratings,
   counts, "selling fast", drop language. "Last pieces until discontinued"
   is allowed only when literally true (aging-artisan supply). This is a
   brand-positioning rule (Apple, not Gucci), not a style preference.
6. **EN/FR/AR sweep:** any claim you change must change in all locales that
   state it (see `turath-i18n-copy` for mechanics).

## When NOT to use this skill

- Pure code changes with no user-visible string in the diff — skip it.
- String *mechanics* (which JSON file, which namespace, RTL) —
  that's `turath-i18n-copy`; this skill governs what the words may claim.
- General verify-before-done discipline — that's `fable-mode` Gate 4. This
  skill is the Turath-specific list of claims that have actually burned us.
