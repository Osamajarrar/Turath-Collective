# Plan 08 — Content management / "backend CMS" assessment

*2026-07-19. Requested: "a plan to build a backend CMS that can manage all of this website —
but only if you think it's a good idea." Honest answer first, plan second.*

---

## The honest answer: a custom CMS backend is NOT a good idea right now

Recommendation: **do not build a custom backend CMS at this stage.** Reasons, in order of
weight:

1. **The website's most important content already has a CMS: Shopify.** Products, variants,
   prices, inventory, collections, images, and (via metafields — already on the launch
   checklist §11) specs, artisan name, and region of origin are all managed in Shopify admin,
   which is mature, secure, and free with the plan you'll already be paying for. A custom CMS
   would duplicate this badly.

2. **What's left is small and changes rarely.** Outside Shopify, the site's content is:
   homepage/section copy in `client/src/locales/{en,fr}/` JSON, legal/FAQ/care pages (same
   files), a handful of images in `client/src/assets/`, and build-time feature flags. This is
   a few dozen strings that change a few times a month at most, by one person.

3. **The git flow is a feature, not friction — because of the honesty rules.** Every copy
   change today goes through a branch → PR → founder review on `dev`, where the claims audit
   catches invented numbers and contradictory claims (this repo's history shows how often
   that mattered). A CMS edit box bypasses exactly that gate. For a brand whose premise is
   verifiable honesty, making copy *harder* to change casually is protective.

4. **Security and maintenance surface.** A CMS means auth, sessions, a database, an admin UI,
   backups, and a new attack surface — on a site that just went through deliberate security
   hardening and *removed* placeholder auth from scope. All of that would be built and
   maintained by the same one person who should be shooting content and talking to suppliers,
   at $0 budget, pre-revenue.

5. **Every serious need already has a cheaper path** (see the phased plan below): Shopify
   metafields/metaobjects first, a free-tier headless CMS second, and the repo's own deferred
   admin scaffolding third — each adopted only when a real, recurring need appears.

**Decision rule for revisiting:** build/adopt more content tooling only when a concrete
editing task recurs more than ~2×/month AND the current git/AI-session path is demonstrably
the bottleneck. Until then, the answer stays no.

---

## What to do instead — phased content-management plan

### Phase 1 (now → launch): Shopify is the only CMS

- Define the metafield namespace from checklist §11 (`turath.specs`: dimensions, materials,
  care, artisan, region, edition size) so product detail pages render real data from Shopify
  instead of hardcoded fallbacks. This is the single highest-value "CMS" work available and
  is already planned.
- Keep site copy in the locale JSON files, edited via AI sessions/PRs as today.
- Collections (`ceramics`, `new-arrivals`, …) drive shop filters and homepage modules from
  Shopify admin — content management with zero new code.

**Effort: small (metafields wiring is already on the checklist). New infrastructure: none.**

### Phase 2 (post-launch, only on the decision rule above): dynamic bits without a backend

If specific strings genuinely need founder-editable-without-deploy status, move *only those*
to **Shopify metaobjects** (e.g. announcement-bar text, a "currently in the kiln" note), read
through the existing `/api/shopify` proxy. This gets a hosted edit UI, versioning, and zero
new auth/database, because it rides the Shopify integration that already exists.

- Candidate content, strictly ranked by realistic edit frequency: announcement bar,
  FAQ answers, care-page details. Everything else stays in git.
- A third-party headless CMS (Sanity/Contentful free tier) is the fallback if metaobjects
  prove too limited — but it adds a second external dependency and its own honesty risk
  (copy editable outside review), so it needs a real justification.
- Mitigation for the review-bypass concern in either case: keep anything resembling a
  *claim* (numbers, promises, provenance) in git; metaobjects hold only operational notes.

**Effort: days, not weeks. New infrastructure: none beyond what Shopify already provides.**

### Phase 3 (post-revenue, if operations demand it): revive the deferred admin scaffolding

The repo already contains intentionally-deferred groundwork: `server/admin.ts`,
`ADMIN_EMAILS`, `AUTH_ENABLED`/`ADMIN_ENABLED` in `server/routes.ts`, stubbed storage, and
schema tables. If and when there are recurring operational tasks Shopify cannot do, flip this
on for a minimal internal admin — not a general CMS. Realistic candidates, each built only
when its need is weekly:

- **Review moderation** — once real customer reviews exist (reviews groundwork branch), an
  approve/reject queue is genuinely needed (honesty rules require curation of real content).
- **Newsletter management** — only if/when the newsletter backend is wired and a provider
  dashboard (Mailchimp/Klaviyo) isn't already sufficient (it usually is — prefer the
  provider's UI).
- **Order/damage-claim notes** — only if Shopify's own order timeline/notes prove
  insufficient at real volume.

Architecture, kept minimal when the day comes: email-allowlist auth for the founder only
(magic-link or Shopify staff SSO — no password storage), the existing Express routes behind
`ADMIN_ENABLED`, Postgres via the existing drizzle setup, and the admin UI as unrouted pages
already scaffolded. Fail-closed: admin routes 404 unless explicitly enabled in env.

**Trigger to start Phase 3: real reviews exist and moderating them via code edits has become
a weekly chore — not before.**

---

## Summary table

| Need | Where it's managed | When |
|---|---|---|
| Products, prices, inventory, collections, product specs | Shopify admin (+ metafields) | Phase 1 (now) |
| Site copy, legal, FAQ (anything with claims) | Git + PR review (claims audit) | Permanent |
| Announcement bar / operational notes | Shopify metaobjects | Phase 2, on demonstrated need |
| Review moderation, newsletter ops | Deferred admin scaffolding, revived minimally | Phase 3, post-revenue trigger |
| Full custom CMS | — | Not planned; revisit only if all of the above fail a real recurring need |
