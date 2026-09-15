import { describe, it, expect } from "vitest";
import {
  getAvailableCategories,
  getVisibleCategories,
  getAvailableCollections,
} from "./collections";

// Guards the catalogue-honesty fix: the site advertised embroidery/tatreez as
// a live, shoppable collection ("SHOP EMBROIDERY", linking to an empty shop
// filter) for a craft that is not sourced. These functions feed the navbar,
// the collection cards, the about page and the shop filters, so a regression
// here re-advertises it everywhere at once.

// The real `t` is not needed — these functions only pass the key through.
const t = (key: string) => key;

describe("category visibility", () => {
  it("does not advertise embroidery anywhere", () => {
    const surfaces = {
      "marketing surfaces (navbar, collection cards)": getVisibleCategories(t),
      "shoppable surfaces (shop, about)": getAvailableCategories(t),
    };

    for (const [label, categories] of Object.entries(surfaces)) {
      expect(
        categories.map((c) => c.handle),
        `embroidery is not part of the catalogue and must not appear in ${label}`,
      ).not.toContain("embroidery");
    }

    expect(getAvailableCollections(t).map((c) => c.handle)).not.toContain("embroidery");
  });

  it("shows ceramics as shoppable", () => {
    expect(getAvailableCategories(t).map((c) => c.handle)).toContain("ceramics");
  });

  it("shows glass on marketing surfaces but not as shoppable", () => {
    // comingSoon: the pieces exist and are on the way, so it is advertised —
    // but it must never be purchasable until that is true.
    expect(getVisibleCategories(t).map((c) => c.handle)).toContain("glass");
    expect(getAvailableCategories(t).map((c) => c.handle)).not.toContain("glass");
  });

  it("getAvailableCategories is a subset of getVisibleCategories", () => {
    const visible = new Set(getVisibleCategories(t).map((c) => c.handle));
    for (const c of getAvailableCategories(t)) {
      expect(visible.has(c.handle)).toBe(true);
    }
  });

  it("no available category is flagged hidden or comingSoon", () => {
    for (const c of getAvailableCategories(t)) {
      expect(c.hidden).toBe(false);
      expect(c.comingSoon).toBe(false);
    }
  });

  it("a category's nested collections carry the same visibility as the category", () => {
    // The two are spread from the same flags; if they ever diverge, a hidden
    // category can still surface a shoppable collection.
    for (const category of getVisibleCategories(t)) {
      for (const collection of category.collections) {
        expect(collection.hidden).toBe(category.hidden);
        expect(collection.comingSoon).toBe(category.comingSoon);
      }
    }
  });
});
