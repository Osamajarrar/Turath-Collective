import type { DisplayProduct } from "@/pages/shop";

/**
 * Ways the site could group its products, compared at /shop-filters before one
 * is committed to.
 *
 * ── This is a SITE-WIDE TAXONOMY, not a shop-page filter ─────────────────
 * The same grouping drives the landing page's collection cards, the navbar's
 * collections menu, the about page and the care page — they all read
 * lib/collections.ts today. Choosing "by use" for the shop while the homepage
 * still says "Ceramics" would be two taxonomies for one catalogue, which is
 * the "one owner per fact" problem in plans/12-reversibility.md.
 *
 * So each preview shows BOTH surfaces: the landing-page cards and the shop.
 * Judge them together — a grouping that works as a filter bar can look thin as
 * a set of full-bleed collection cards, and vice versa.
 *
 * PREVIEW ONLY. The real shop and homepage are untouched. Nothing here is
 * imported by production code.
 *
 * The underlying question: with a very small catalogue, is *any* grouping
 * worth the interface it costs? Each strategy answers differently, and one of
 * them is "don't".
 */

export interface FilterGroup {
  /** Stable key, used for the active-state comparison */
  key: string;
  /** Button label. Preview chrome is intentionally untranslated. */
  label: string;
  /** Which products belong in this group */
  test: (product: DisplayProduct) => boolean;
}

export interface FilterStrategy {
  id: string;
  label: string;
  /** What this grouping is, in one or two calm sentences */
  description: string;
  /** The honest case for it */
  argues: string;
  /** The honest case against — every option has one */
  against: string;
  /** What this does to the LANDING PAGE collection cards, which read the same taxonomy */
  landing: string;
  /** null = no grouping at all: no filter bar, and no collection cards */
  groups: ((products: DisplayProduct[]) => FilterGroup[]) | null;
}

/** Groups that would be empty are dropped — never show a filter that leads nowhere. */
export function resolveGroups(
  strategy: FilterStrategy,
  products: DisplayProduct[],
): FilterGroup[] {
  if (!strategy.groups) return [];
  return strategy.groups(products).filter((g) => products.some(g.test));
}

/**
 * PREVIEW-ONLY inference. There is no `use` field on a product, so this reads
 * the name to decide whether something belongs on a table or in a room. If
 * this grouping is chosen, it needs a REAL field on the product (a Shopify
 * metafield or tag) — never a name-matching heuristic in production, which
 * would silently miscategorise the first product that breaks the pattern.
 */
function inferredUse(product: DisplayProduct): "table" | "room" {
  return /bowl|plate|mezze|platter|cup|dish/i.test(product.name) ? "table" : "room";
}

export const FILTER_STRATEGIES: FilterStrategy[] = [
  {
    id: "material",
    label: "By material",
    description:
      "What the shop does today: one button per craft — Ceramics, Glass — driven by the category flags in lib/collections.ts.",
    argues:
      "It matches how the crafts are sourced and how the rest of the site is already organised, so nothing else has to change.",
    against:
      "Material is an inventory taxonomy, not a reason to buy. Someone furnishing a table does not think 'I want ceramic'. It also collapses to a single button while only one craft is live.",
    landing:
      "Cards stay as they are today — one per craft. With only ceramics live and glass coming soon, that is one real card plus one blurred placeholder, which is a thin landing page.",
    groups: () => [
      { key: "ceramics", label: "Ceramics", test: (p) => p.category === "ceramics" },
      { key: "glass", label: "Glass", test: (p) => p.category === "glass" },
    ],
  },
  {
    id: "use",
    label: "By use",
    description:
      "Groups by where a piece lives — For the Table, For the Room — rather than what it is made of.",
    argues:
      "Closest to how people actually shop for homeware: they have a place in mind before a material. It also survives adding new crafts, since a new material does not add a new button.",
    against:
      "Needs a real field on each product (a Shopify metafield or tag). The preview infers it from the product name, which is fine to look at and unacceptable to ship.",
    landing:
      "Cards become 'For the Table' and 'For the Room'. Both are populated from day one, so the landing page has two real entry points instead of one card and a blurred placeholder — and they read as invitations rather than as an inventory list.",
    groups: () => [
      { key: "table", label: "For the Table", test: (p) => inferredUse(p) === "table" },
      { key: "room", label: "For the Room", test: (p) => inferredUse(p) === "room" },
    ],
  },
  {
    id: "none",
    label: "No filters",
    description:
      "Every piece in one grid, sort only. The filter bar is removed entirely.",
    argues:
      "With a small catalogue the whole shop fits on a screen or two, so filtering hides nothing and costs an interface. It is also the most confident presentation — a gallery, not a warehouse. Easiest to add filters later; harder to take them away once people expect them.",
    against:
      "Stops scaling somewhere around 20–30 pieces, and gives a visitor arriving with a specific intent no shortcut.",
    landing:
      "There are no collection cards at all — the landing page shows featured pieces directly, so a visitor goes hero → product instead of hero → category → product. One fewer click, but nothing to browse INTO, and the homepage loses a whole section it currently uses to fill space.",
    groups: null,
  },
  {
    id: "availability",
    label: "By availability",
    description: "Available now versus still being made.",
    argues:
      "Honest about the current state of the catalogue, and it lets someone who wants to buy today skip everything they cannot have yet.",
    against:
      "Makes scarcity the organising idea of the shop, which reads as drop culture — explicitly not the brand model. It also becomes meaningless the moment everything is in stock.",
    landing:
      "Cards become 'Available Now' and 'Still Being Made'. Honest, but it puts what you cannot buy on the homepage as a headline, which is an odd first impression.",
    groups: () => [
      { key: "available", label: "Available Now", test: (p) => p.availableForSale },
      { key: "coming", label: "Still Being Made", test: (p) => !p.availableForSale },
    ],
  },
];

export function getFilterStrategy(id: string | undefined) {
  return FILTER_STRATEGIES.find((s) => s.id === id);
}
