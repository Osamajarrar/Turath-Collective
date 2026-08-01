# Shop filtering variants (`/shop-filters`)

Four ways to group the catalogue, behind their own routes so they can be
compared before one is committed to.

This is a **site-wide taxonomy, not a shop-page filter**: the same grouping
drives the landing page collection cards, the navbar menu, the about page and
the care page — they all read `lib/collections.ts`. So each preview shows BOTH
surfaces, landing cards first and then the shop. Choosing a grouping for the
shop while the homepage kept saying "Ceramics" would be two taxonomies for one
catalogue. **The real pages are untouched.**

Same pattern and same rules as [`../design-variants/`](../design-variants/README.md).

## Routes

| Route | Grouping |
|---|---|
| `/shop-filters` | The menu — all four, with the case for and against each |
| `/shop-filters/material` | By craft (Ceramics / Glass) — what the shop does today |
| `/shop-filters/use` | By where it lives (For the Table / For the Room) |
| `/shop-filters/none` | No filter bar at all, sort only |
| `/shop-filters/availability` | Available now / still being made |

A floating **Variants** button sits bottom-right for flicking between them —
the only way to judge grouping is to compare at the same scroll position.

## How isolation works

**One preview component, four strategies.** `ShopPreview.tsx` is rendered with
a different `FilterStrategy` from `strategies.ts`. It is deliberately *not* a
copy of `shop.tsx`: duplicating that page would mean maintaining two of it,
and the question here is the grouping, not the product card.

It uses the **same mock catalogue** (`MOCK_PRODUCTS`) and the **same sort
function** (`lib/product-sort.ts`) as the real shop, so the grouping is the
only variable.

**Catalogue rules are respected.** The preview filters through
`getAvailableCategories`, so a craft hidden in `lib/collections.ts` is hidden
here too. Otherwise the previews would be judging a shop we do not have.

**Not for production.**
- Not linked from the navbar or footer. Reach it by typing `/shop-filters`.
- `noindex, nofollow` while any preview page is mounted.
- A visible banner sits above every preview — these pages are reachable by URL
  and must never be mistaken for the real shop.
- Preview chrome is intentionally **not** translated, for the same reason as
  the design gallery: preview-only keys in the production locale namespaces
  would put strings in front of translators no visitor will ever read.
- Lazy-loaded, so none of it is in the main bundle.

## ⚠ If "By use" is chosen

It needs a **real field** on each product — a Shopify metafield or tag. The
preview infers table-vs-room by matching the product name, which is fine to
look at and must never ship: the first product that breaks the naming pattern
gets silently miscategorised.

## Removing the gallery

Once a grouping is chosen: apply it to `client/src/pages/shop.tsx`, then delete
`client/src/shop-variants/` and the two `/shop-filters` routes and `lazy(...)`
imports in `client/src/App.tsx`.
