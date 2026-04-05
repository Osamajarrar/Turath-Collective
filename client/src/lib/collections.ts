import ceramicCard from "@/assets/burgundy-olive-set.png";
import embroideryCard from "@/assets/embroidery.jpg";

export type Collection = {
  title: string;
  description: string;
  cta: string;
  image: string;
  link: string;
  category: string;
  comingSoon: boolean;
  hidden: boolean;
};

export const getCollections = (t: (key: string) => any): Collection[] => [
  {
    title: t("collections.ceramics.title"),
    description: t("collections.ceramics.description"),
    cta: t("collections.ceramics.cta"),
    image: ceramicCard,
    link: "/shop?category=ceramics",
    category: "ceramics",
    comingSoon: false,
    hidden: false,
  },
  {
    title: t("collections.embroidery.title"),
    description: t("collections.embroidery.description"),
    cta: t("collections.embroidery.cta"),
    image: embroideryCard,
    link: "/shop?category=embroidery",
    category: "embroidery",
    comingSoon: false,
    hidden: true,
  },
];

// Fallback collections for when translations aren't available yet
export const collections: Collection[] = [
  {
    title: "Ceramics",
    description: "Hand-thrown Hebron clay vessels, painted with the rhythm of the wheel.",
    cta: "SHOP CERAMICS",
    image: ceramicCard,
    link: "/shop?category=ceramics",
    category: "ceramics",
    comingSoon: false,
    hidden: false,
  },
  {
    title: "Embroidery",
    description: "Centuries-old Tatreez patterns, hand-stitched on the finest local linens.",
    cta: "SHOP EMBROIDERY",
    image: embroideryCard,
    link: "/shop?category=embroidery",
    category: "embroidery",
    comingSoon: false,
    hidden: true,
  },
];
  
export const availableCategories = collections
  .filter(c => !c.comingSoon && !c.hidden)
  .map(c => c.category);

// Includes "all" — safe to use anywhere
export const shopCategories = ["all", ...availableCategories];

export const isCategoryAvailable = (category: string) =>
  category === "all" || availableCategories.includes(category);