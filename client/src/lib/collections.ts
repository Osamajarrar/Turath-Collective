import ceramicCard from "@/assets/burgundy-olive-set.png";
import embroideryCard from "@/assets/embroidery.jpg";
import glassCard from "@/assets/product-vase-1.png";

export type Collection = {
  title: string;
  description: string;
  cta: string;
  image: string;
  handle: string;
  comingSoon: boolean;
  hidden: boolean;
  aboutDescription?: string;
};

export type Category = {
  title: string;
  description: string;
  image: string;
  handle: string;
  collections: Collection[];
  comingSoon: boolean;
  hidden: boolean;
  aboutDescription?: string;
};

export type FaqCategory = {
  key: string;
  title: string;
  items: Array<{
    question: string;
    answer: string;
  }>;
};

type VisibilityFlags = {
  comingSoon: boolean;
  hidden: boolean;
};

// Single source of truth for which crafts the site advertises.
//
//   hidden:     the category does not appear anywhere — no nav link, no
//               collection card, no shop filter. Use this when we do not sell
//               the craft and have not committed to selling it.
//   comingSoon: the category is shown, visibly marked as not yet purchasable.
//               Use this ONLY when the pieces genuinely exist and are on the
//               way — it is a promise to the customer.
//
// Honesty rule (CLAUDE.md #4): a category that is neither hidden nor
// comingSoon asserts "you can buy this today". Do not flip a flag to false
// until that is true.
const categoryVisibility: Record<string, VisibilityFlags> = {
  ceramics: { comingSoon: false, hidden: false },
  // Tatreez/embroidery is NOT part of the catalogue — we do not source it and
  // have not committed to it. It was previously advertised as a live,
  // shoppable collection ("SHOP EMBROIDERY", linking to an empty shop filter).
  // The copy and imagery are kept so the category can be switched back on in
  // one line if we ever do carry it.
  embroidery: { comingSoon: false, hidden: true },
  glass: { comingSoon: true, hidden: false },
};

const getVisibilityFlags = (handle: string): VisibilityFlags =>
  categoryVisibility[handle] ?? { comingSoon: false, hidden: false };

// Example structure: categories with nested collections
const allCategories = (t: (key: string) => any): Category[] => [
  {
    ...getVisibilityFlags("ceramics"),
    title: t("collections.ceramics.title"),
    description: t("collections.ceramics.description"),
    image: ceramicCard,
    handle: "ceramics",
    collections: [
      {
        ...getVisibilityFlags("ceramics"),
        title: t("collections.ceramics.title"),
        description: t("collections.ceramics.description"),
        cta: t("collections.ceramics.cta"),
        image: ceramicCard,
        handle: "ceramics",
      },
    ],
  },
  {
    ...getVisibilityFlags("embroidery"),
    title: t("collections.embroidery.title"),
    description: t("collections.embroidery.description"),
    image: embroideryCard,
    handle: "embroidery",
    collections: [
      {
        ...getVisibilityFlags("embroidery"),
        title: t("collections.embroidery.title"),
        description: t("collections.embroidery.description"),
        cta: t("collections.embroidery.cta"),
        image: embroideryCard,
        handle: "embroidery",
      },
    ],
  },
  {
    ...getVisibilityFlags("glass"),
    title: t("collections.glass.title"),
    description: t("collections.glass.description"),
    image: glassCard,
    handle: "glass",
    collections: [
      {
        ...getVisibilityFlags("glass"),
        title: t("collections.glass.title"),
        description: t("collections.glass.description"),
        cta: t("collections.glass.cta"),
        image: glassCard,
        handle: "glass",
      },
    ],
  },
];

/**
 * Get only available categories (not hidden, not coming soon)
 */
export const getAvailableCategories = (t: (key: string) => any): Category[] =>
  allCategories(t).filter(cat => !cat.hidden && !cat.comingSoon);

/**
 * Get visible categories for marketing surfaces (includes coming soon, excludes hidden)
 */
export const getVisibleCategories = (t: (key: string) => any): Category[] =>
  allCategories(t).filter(cat => !cat.hidden);

export const getAvailableCollections = (t: (key: string) => any): Collection[] =>
  allCategories(t)
    .flatMap(cat => cat.collections)
    .filter(col => !col.hidden && !col.comingSoon);

// Fallback categories for when translations aren't available yet.
//
// DEPRECATED: use allCategories(t) instead. Nothing imports this today —
// verified 2026-08-01; shop.tsx builds its own list from
// getAvailableCategories.
//
// ⚠ It does NOT read categoryVisibility above, so its flags must be kept in
// sync by hand or it will re-advertise a craft we do not sell. That is exactly
// what happened with embroidery. Prefer deleting this block over reviving it.
export const allCategoriesData: Category[] = [
  {
    comingSoon: false,
    hidden: false,
    title: "Ceramics",
    description: "Hand-thrown Hebron clay vessels, painted with the rhythm of the wheel.",
    image: ceramicCard,
    handle: "ceramics",
    collections: [
      {
        comingSoon: false,
        hidden: false,
        title: "Ceramics",
        description: "Hand-thrown Hebron clay vessels, painted with the rhythm of the wheel.",
        cta: "SHOP CERAMICS",
        image: ceramicCard,
        handle: "ceramics",
      },
    ],
  },
  {
    // Not sold — mirrors categoryVisibility.embroidery above.
    comingSoon: false,
    hidden: true,
    title: "Embroidery",
    description: "Centuries-old Tatreez patterns, hand-stitched on the finest local linens.",
    image: embroideryCard,
    handle: "embroidery",
    collections: [
      {
        comingSoon: false,
        hidden: true,
        title: "Embroidery",
        description: "Centuries-old Tatreez patterns, hand-stitched on the finest local linens.",
        cta: "SHOP EMBROIDERY",
        image: embroideryCard,
        handle: "embroidery",
      },
    ],
  },
];


export const availableCategories = allCategoriesData.filter(c => !c.comingSoon && !c.hidden);
export const availableCollections = allCategoriesData.flatMap(cat => cat.collections).filter(col => !col.comingSoon && !col.hidden);

// Includes "all" — safe to use anywhere
export const shopCategories = ["all", ...availableCategories.map(c => c.handle)];

export const isCategoryAvailable = (category: string) =>
  category === "all" || availableCategories.some(c => c.handle === category);

/**
 * Get FAQ categories with translations
 * Currently pulls from i18n, can be easily replaced with Shopify API call later
 */
export const getFaqCategories = (t: any): FaqCategory[] => [
  {
    key: "aboutCraft",
    title: t("faq.categories.aboutCraft.title"),
    items: t("faq.categories.aboutCraft.items", { returnObjects: true }) as Array<{ question: string; answer: string }>,
  },
  {
    key: "productCare",
    title: t("faq.categories.productCare.title"),
    items: t("faq.categories.productCare.items", { returnObjects: true }) as Array<{ question: string; answer: string }>,
  },
  {
    key: "shippingDelivery",
    title: t("faq.categories.shippingDelivery.title"),
    items: t("faq.categories.shippingDelivery.items", { returnObjects: true }) as Array<{ question: string; answer: string }>,
  },
  {
    key: "returnsExchanges",
    title: t("faq.categories.returnsExchanges.title"),
    items: t("faq.categories.returnsExchanges.items", { returnObjects: true }) as Array<{ question: string; answer: string }>,
  },
  {
    key: "sustainability",
    title: t("faq.categories.sustainability.title"),
    items: t("faq.categories.sustainability.items", { returnObjects: true }) as Array<{ question: string; answer: string }>,
  },
];