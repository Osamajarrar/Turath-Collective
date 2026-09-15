# Plan 05 — story-section.tsx unverified claims

**Status: already resolved on main — verification only, no code change needed.**

## Findings (verified 2026-07-07)

The flagged stats ("100% Local Clay", "48hrs Kiln Fired") no longer exist anywhere in the
codebase. `client/src/components/story-section.tsx` renders `story.stats.*` from the `pages`
locale namespace, which now reads:

| Locale | stat1 | stat2 |
|---|---|---|
| EN (`locales/en/pages.json`) | "100%" / "Handmade" | "Curated in" / "Montreal" |
| FR | "100%" / "Fait Main" | "Sélectionné à" / "Montréal" |
| AR | "١٠٠٪" / "صناعة يدوية" | "اختيارات" / "مونتريال" |

Both are defensible: the launch pieces are genuinely handmade, and curation genuinely happens in
Montreal. A repo-wide search for "local clay" / "kiln" finds only the Heritage section's
"wood-fired kilns" line describing Hebron's craft tradition generally (technique claim, not a
per-object claim) — consistent with the honesty framework.

## Remaining recommendations (small, optional)

1. **"100% Handmade"** — keep, but confirm with suppliers before scaling the catalog: if any
   future SKU has machine-made elements (e.g. glass pomegranate stand, packaging inserts sold as
   part of a set), this claim must be scoped per-product rather than brand-wide.
2. `heritage` copy ("center of ceramic artistry for over five hundred years") — accurate as a
   statement about Hebron's tradition; keep the phrasing anchored to the *craft/city*, never to
   the objects. Any future copy edit should preserve that distinction.
3. Product-level specs in mock data say "Hebron Clay" (`product.tsx` MOCK_PRODUCTS) — mock-only,
   never shown when `VITE_USE_MOCK_PRODUCTS=false`, but if mocks are ever demoed publicly the same
   supplier-confirmation caveat applies.

## Model recommendation

**No execution needed** (already resolved); the supplier-confirmation items are founder to-dos,
not code tasks.
