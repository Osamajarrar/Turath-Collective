import { lazy, type LazyExoticComponent, type ComponentType } from "react";

/**
 * The homepage design variants that were explored on separate branches and
 * collected here so they can be compared side by side at /design.
 *
 * Preview-only. The real homepage (client/src/pages/home.tsx) is untouched by
 * everything in this directory — variants keep private copies of the
 * components they changed and their own i18n namespaces.
 *
 * Each page is lazy-loaded so none of this lands in the main bundle.
 */
export interface DesignVariant {
  /** URL segment — /design/<id> */
  id: string;
  /** Display name, as used in the design conversation */
  label: string;
  /** One or two calm sentences: what this variant changes and why */
  description: string;
  /** Branch the variant was ported from, for tracing history */
  branch: string;
  /** Worth noting when reviewing this one */
  note?: string;
  component: LazyExoticComponent<ComponentType>;
}

export const DESIGN_VARIANTS: DesignVariant[] = [
  {
    id: "object-first",
    label: "Object First",
    description:
      "The hero leads with the object itself rather than a scene — one product shot, a short supporting line, and a secondary browse link.",
    branch: "design/object-first",
    component: lazy(() => import("./object-first/page")),
  },
  {
    id: "editorial-split",
    label: "Editorial Split",
    description:
      "A two-column hero, copy left and object right, with a kicker and supporting subheading. Featured products gain a left-aligned editorial heading.",
    branch: "design/editorial-split",
    component: lazy(() => import("./editorial-split/page")),
  },
  {
    id: "warm-immersive",
    label: "Golden Hour Immersive",
    description:
      "Warmer and slower: a full-bleed hero, a dark craft band as a pause mid-scroll, and a closing call to action before the newsletter.",
    branch: "design/warm-immersive",
    note: "Proposed a warmer cream palette; see design-variants/warm-immersive/README.md for how that is previewed here.",
    component: lazy(() => import("./warm-immersive/page")),
  },
  {
    id: "quiet-commerce",
    label: "Quiet Commerce",
    description:
      "Compresses the path to product — a shorter hero, a values strip directly beneath it, and tightened product and story sections.",
    branch: "design/quiet-commerce",
    component: lazy(() => import("./quiet-commerce/page")),
  },
  {
    id: "mobile-narrative",
    label: "Mobile Narrative",
    description:
      "Three vertical story chapters in place of a single hero, for visitors arriving from process content on a phone, with a thumb-reach shop bar.",
    branch: "design/mobile-narrative",
    note: "Designed for phone width — narrow the window to judge it fairly.",
    component: lazy(() => import("./mobile-narrative/page")),
  },
  {
    id: "conversion-hybrid",
    label: "Conversion Hybrid",
    description:
      "Takes the strongest lever from each of the others: the split hero, the values strip, the craft band pause, and the repeated closing action.",
    branch: "design/conversion-hybrid",
    component: lazy(() => import("./conversion-hybrid/page")),
  },
];

export function getDesignVariant(id: string | undefined) {
  return DESIGN_VARIANTS.find((variant) => variant.id === id);
}
