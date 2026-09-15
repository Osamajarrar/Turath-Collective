import { describe, it, expect } from "vitest";
import {
  sortProducts,
  getSalesRanking,
  type SortableProduct,
  type SalesRanking,
} from "./product-sort";

const products: SortableProduct[] = [
  { handle: "b", price: 38, dateAdded: "2026-01-02" },
  { handle: "a", price: 45, dateAdded: "2026-03-01" },
  { handle: "c", price: 12, dateAdded: "2026-02-01" },
];

const handles = (p: SortableProduct[]) => p.map((x) => x.handle);

describe("sortProducts", () => {
  it("never mutates the input array", () => {
    const input = [...products];
    const snapshot = handles(input);
    sortProducts(input, "price-low", null);
    expect(handles(input)).toEqual(snapshot);
  });

  it("sorts by price ascending and descending", () => {
    expect(handles(sortProducts(products, "price-low", null))).toEqual(["c", "b", "a"]);
    expect(handles(sortProducts(products, "price-high", null))).toEqual(["a", "b", "c"]);
  });

  it("sorts newest first", () => {
    expect(handles(sortProducts(products, "newest", null))).toEqual(["a", "c", "b"]);
  });

  it("falls back to newest for an unknown sort key", () => {
    expect(handles(sortProducts(products, "nonsense", null))).toEqual(["a", "c", "b"]);
  });

  // HONESTY CONSTRAINT (product-sort.ts header, CLAUDE.md hard rule 4):
  // "best seller" ordering must come from real order counts. With no orders,
  // asking for it must NOT invent an order — it falls back to newest.
  it("falls back to newest for best-seller when no real ranking exists", () => {
    expect(handles(sortProducts(products, "best-seller", null))).toEqual(["a", "c", "b"]);
  });

  it("uses a real ranking for best-seller when one is supplied", () => {
    const ranking: SalesRanking = new Map([
      ["b", 50],
      ["a", 10],
      ["c", 1],
    ]);
    expect(handles(sortProducts(products, "best-seller", ranking))).toEqual(["b", "a", "c"]);
  });

  it("treats products absent from the ranking as zero sales", () => {
    const ranking: SalesRanking = new Map([["c", 5]]);
    expect(handles(sortProducts(products, "best-seller", ranking))[0]).toBe("c");
  });

  it("handles empty input", () => {
    expect(sortProducts([], "price-low", null)).toEqual([]);
  });
});

describe("getSalesRanking", () => {
  // This is the guard on the honesty constraint: the day someone returns a
  // hardcoded map here to make the UI "look right", this test fails and says
  // why.
  it("returns null while no real order data exists", () => {
    expect(
      getSalesRanking(),
      "getSalesRanking must stay null until it reads REAL order counts — " +
        "never tags, flags or invented numbers (see product-sort.ts header)",
    ).toBeNull();
  });
});
