// i18n namespaces for the /design homepage-variant previews.
//
// Each design branch redefined overlapping keys in `common` (two variants set
// a different `hero.secondaryCta`, two set a different `craftBand.kicker`), so
// they cannot share one file. Instead each variant gets its own namespace
// holding ONLY the keys it added or changed. Its components call
// useTranslation(["design-<id>", "common"]) and i18next searches a namespace
// array in order, so the variant's copy wins and everything it left alone
// falls through to the real translations.
//
// Preview-only: nothing outside client/src/design-variants reads these, and
// the real `common` / `pages` namespaces are untouched.

import enWarmImmersive from "../locales/en/design-warm-immersive.json";
import enEditorialSplit from "../locales/en/design-editorial-split.json";
import enMobileNarrative from "../locales/en/design-mobile-narrative.json";
import enMobileNarrativePages from "../locales/en/design-mobile-narrative-pages.json";
import enQuietCommerce from "../locales/en/design-quiet-commerce.json";
import enConversionHybrid from "../locales/en/design-conversion-hybrid.json";
import enObjectFirst from "../locales/en/design-object-first.json";

import frWarmImmersive from "../locales/fr/design-warm-immersive.json";
import frEditorialSplit from "../locales/fr/design-editorial-split.json";
import frMobileNarrative from "../locales/fr/design-mobile-narrative.json";
import frMobileNarrativePages from "../locales/fr/design-mobile-narrative-pages.json";
import frQuietCommerce from "../locales/fr/design-quiet-commerce.json";
import frConversionHybrid from "../locales/fr/design-conversion-hybrid.json";
import frObjectFirst from "../locales/fr/design-object-first.json";

import arWarmImmersive from "../locales/ar/design-warm-immersive.json";
import arEditorialSplit from "../locales/ar/design-editorial-split.json";
import arMobileNarrative from "../locales/ar/design-mobile-narrative.json";
import arMobileNarrativePages from "../locales/ar/design-mobile-narrative-pages.json";
import arQuietCommerce from "../locales/ar/design-quiet-commerce.json";
import arConversionHybrid from "../locales/ar/design-conversion-hybrid.json";
import arObjectFirst from "../locales/ar/design-object-first.json";

export const designVariantResources = {
  en: {
    "design-warm-immersive": enWarmImmersive,
    "design-editorial-split": enEditorialSplit,
    "design-mobile-narrative": enMobileNarrative,
    "design-mobile-narrative-pages": enMobileNarrativePages,
    "design-quiet-commerce": enQuietCommerce,
    "design-conversion-hybrid": enConversionHybrid,
    "design-object-first": enObjectFirst,
  },
  fr: {
    "design-warm-immersive": frWarmImmersive,
    "design-editorial-split": frEditorialSplit,
    "design-mobile-narrative": frMobileNarrative,
    "design-mobile-narrative-pages": frMobileNarrativePages,
    "design-quiet-commerce": frQuietCommerce,
    "design-conversion-hybrid": frConversionHybrid,
    "design-object-first": frObjectFirst,
  },
  ar: {
    "design-warm-immersive": arWarmImmersive,
    "design-editorial-split": arEditorialSplit,
    "design-mobile-narrative": arMobileNarrative,
    "design-mobile-narrative-pages": arMobileNarrativePages,
    "design-quiet-commerce": arQuietCommerce,
    "design-conversion-hybrid": arConversionHybrid,
    "design-object-first": arObjectFirst,
  },
} as const;

export const designVariantNamespaces = Object.keys(designVariantResources.en);
