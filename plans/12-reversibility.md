# Plan 12 — What we must get right now, and what we can leave simple

**Session:** 2026-08-01. Founder's standing rule: *"anything we do needs to be the
correct way of doing stuff — I don't want to be fixing data structures or doing
migrations or making changes in the future."*

This file turns that into something checkable, because "build it right" on its own
does not tell you what to do on a Tuesday.

---

## The one distinction that matters

**Not** hardcoded vs dynamic. **Expensive-to-reverse vs cheap-to-reverse.**

A code refactor is cheap: it is a diff, the tests catch what broke, and it ships in an
hour. A *data* migration is expensive: it touches rows that exist, it cannot be tested
against production without risk, and it usually cannot be undone. The founder's rule is
about the second kind.

This matters because the naive reading — "make everything dynamic and reusable from the
start" — is itself a known source of rework. Abstractions built before the second use
case exists are usually built for the wrong second use case, and then you migrate *off
the abstraction*. Indirection is not free and it is not the goal. **No migrations is the
goal.**

So: get the expensive things right today. Keep the cheap things simple and obvious.

---

## Expensive to reverse — decide correctly now

| Decision | Why reversing hurts | Status |
|---|---|---|
| **Analytics event names + properties** | History cannot be backfilled. Rename `checkout_intent` in three months and every funnel built on it splits in two, right when ad data starts mattering | ⚠ **Live now.** Names are set (`checkout_intent`, `checkout_intent_email_submitted`). Fix any naming regret BEFORE ads start, not after |
| **Consent records** | A legal record under Law 25 / CASL. Its shape must stay readable years later, and you cannot re-ask people retroactively | ✅ Basis + ISO timestamp recorded per address; Resend owns unsubscribe |
| **URL / slug structure** | Changing `/product/:handle` later means redirects forever and lost SEO | ✅ Handle-based, matches Shopify |
| **DB dialect** | Converting with live rows is the classic painful migration | ✅ Converted to D1/SQLite while zero tables exist (DECISIONS.md §3) |
| **Where content physically lives** | Moving copy between locale JSON, Shopify metafields and a CMS is manual work per string, times three locales | ⚠ **Open** — see below |
| **System of record per entity** | Two places owning the same fact is a permanent reconciliation problem | ⚠ **One violation live** — see below |

## Cheap to reverse — keep simple, do not pre-build

Component structure, layout, styling, which sort options exist, filter grouping (that
is what `/shop-filters` is for), copy wording, page composition. Change these freely
when there is a reason. Do **not** add configuration, plugin points or abstraction
layers for these in advance.

---

## Violation 1 — category is inferred by string matching (live bug)

[`shop.tsx`](../client/src/pages/shop.tsx) maps a Shopify product to one of our
category handles with `inferCategoryHandle`, which pattern-matches on `productType`
and falls back to the first tag:

```ts
if (value.includes("ceramic") || value.includes("bowl") || value.includes("plate"))
  return "ceramics";
if (!value) return "ceramics";   // silent default
```

This is exactly the failure mode the founder's rule is about. It works on today's five
mock products and breaks quietly on real ones:

- A **glass bowl** matches `bowl` and is filed under ceramics. No error, no warning —
  it just appears in the wrong filter forever.
- A product with an empty `productType` **silently becomes ceramics**.
- Adding a new craft means editing a regex in our code, not adding data in Shopify.

**The correct shape:** Shopify is already the system of record for products
(DECISIONS.md §3). Category must be *read*, not guessed — from a Shopify collection
membership, or a dedicated `custom.category` metafield whose value is the handle. Our
code should map a missing/unknown value to "uncategorised" and surface it, never guess.

**Why now:** the moment real products exist in Shopify, fixing this means re-tagging
the catalogue by hand and correcting anything already indexed by Google under the wrong
filter. Today it is a small change to one function, because the only data is mock data.

## Violation 2 — the same category is defined twice

Categories exist in [`lib/collections.ts`](../client/src/lib/collections.ts) (handle,
title, description, visibility flags) **and** implicitly in Shopify (whatever
`productType` the founder types). Neither knows about the other; `inferCategoryHandle`
is the duct tape between them.

**The correct shape:** one owner. Shopify owns *which category a product is in*;
`collections.ts` owns *whether we advertise that category and how it is described*
(the visibility flags are a merchandising decision, not product data, and belong in
code). The contract between them is a handle string — a real field, matched exactly,
with no inference.

## Open — where page copy lives

Locale JSON is correct **today**: the founder is the only editor, copy changes ship with
a deploy, and three locales in git is genuinely easier to review than three locales in a
CMS. It becomes wrong the moment either (a) someone needs to change copy without a
developer, or (b) content becomes relational — a product ↔ its artisan ↔ their story.

That is a real future migration, so it is worth naming the trigger rather than
discovering it: **when an artisan needs a profile page linked from products, revisit.**
[Plan 08](08-content-management-assessment.md) already assessed this; re-read it at that
point rather than re-deriving.

Not a reason to move now. Moving early would mean migrating copy twice.

---

## Rules that follow from this

1. **Never ship a heuristic where a real field belongs.** If code guesses a fact about
   data (`name.includes(...)`, "default to ceramics", inferring use from a product
   name), that is a data-modelling gap wearing a disguise. Add the field.
   *Already flagged in two places: `inferCategoryHandle` here, and `inferredUse` in
   `shop-variants/strategies.ts`, which is preview-only and marked must-not-ship.*
2. **Anything category-shaped iterates the category list.** Never name a category in
   JSX. Hardcoding is what left a full Tatreez care guide on the site after embroidery
   was hidden everywhere else.
3. **One owner per fact.** Before adding a field, say which system owns it. If the
   answer is "both", that is the design problem.
4. **Name analytics events for what happened, not for the UI that produced it.**
   `checkout_intent` survives a redesign; `dialog_v2_submit` does not.
5. **Do not pre-build flexibility.** A second use case is the earliest honest moment to
   generalise. Speculative abstraction is rework with extra steps.
