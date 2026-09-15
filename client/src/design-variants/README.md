# Homepage design variants (`/design`)

Six homepage directions were explored on separate branches and separate
worktrees. Every one of them edited the same files — `hero.tsx`, `home.tsx`,
and `locales/*/common.json` — so they could not simply be merged: two variants
define a different `hero.secondaryCta`, two define a different
`craftBand.kicker`, and merging would have silently kept one and lost the rest.

This directory collects all six behind their own routes instead, so they can be
opened and compared. **The real homepage is untouched.**

## Routes

| Route | Variant | From branch |
|---|---|---|
| `/design` | The menu — all six, with descriptions | — |
| `/design/object-first` | Object First | `design/object-first` |
| `/design/editorial-split` | Editorial Split | `design/editorial-split` |
| `/design/warm-immersive` | Golden Hour Immersive | `design/warm-immersive` |
| `/design/quiet-commerce` | Quiet Commerce | `design/quiet-commerce` |
| `/design/mobile-narrative` | Mobile Narrative | `design/mobile-narrative` |
| `/design/conversion-hybrid` | Conversion Hybrid | `design/conversion-hybrid` |

A floating **Variants** button sits bottom-right on every variant page for
jumping between them without returning to the menu.

## How isolation works

**Components.** Each variant directory holds private copies of only the
components it changed. Anything a variant left alone (navbar, footer,
newsletter, social proof) still imports from `@/components/*`, so there is one
copy of everything that is not variant-specific.

**Translations.** Each variant gets its own i18n namespace — `design-<id>`,
plus `design-<id>-pages` where it also overrode `pages` — holding only the keys
it added or changed. Its components call
`useTranslation(["design-<id>", "common"])`; i18next searches a namespace array
in order, so the variant's keys win and everything else falls through to the
real translations. EN/FR/AR are all preserved. The production `common` and
`pages` namespaces are unmodified.

**Palette.** `design/warm-immersive` proposed warming the global theme tokens.
Applying that would have repainted the other five variants, so it is scoped to
that variant's page — see the block at the bottom of `client/src/index.css`.

## Not for production

- Not linked from the navbar or footer. Reach it by typing `/design`.
- `noindex, nofollow` while any preview page is mounted (`useNoIndex.ts`).
- Preview chrome (the gallery page, the switcher) is intentionally **not**
  translated — it is internal tooling, and adding preview-only keys to the
  production locale namespaces would put strings in front of translators that
  no visitor will ever see.
- All variant pages are lazy-loaded, so none of this is in the main bundle.

## Removing the gallery

Once a direction is chosen: delete `client/src/design-variants/` and
`client/src/locales/*/design-*.json`, drop the two `/design` routes and the two
`lazy(...)` imports in `client/src/App.tsx`, remove the
`designVariantResources` / `designVariantNamespaces` wiring in
`client/src/lib/i18n.ts`, and delete the `.variant-warm-immersive` block at the
bottom of `client/src/index.css`.

## Changes that are *not* preview-only

Two accessibility fixes were folded into the shared components rather than
duplicated per variant, because they are not design-differentiating:

- `ArrowLink` — visible focus ring.
- `newsletter` — visible focus rings, 44px minimum tap targets, and
  `text-white` → `text-primary-foreground` per the token rule.

These are worth cherry-picking to `dev` on their own.
