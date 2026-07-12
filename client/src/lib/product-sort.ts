// Shop-page product sorting.
//
// HONESTY CONSTRAINT (see CLAUDE.md): "best seller" ordering must be driven
// by REAL sales data — actual per-product order counts — never by a Shopify
// tag, a hardcoded flag, or any other editorial designation. No orders exist
// yet, so getSalesRanking() returns null, the shop UI does not offer the
// best-seller option, and sortProducts() falls back to newest-first if asked
// for it anyway. The wiring is complete: once real order counts are returned
// here, the option activates on its own.

export type SortKey = "newest" | "price-low" | "price-high" | "best-seller";

/** Minimal shape a product needs to be sortable (structural, so both the
 *  shop page's DisplayProduct and future shapes qualify). */
export interface SortableProduct {
  handle: string;
  price: number;
  dateAdded: string;
}

/** Units ordered per product handle, computed from real order records. */
export type SalesRanking = ReadonlyMap<string, number>;

/**
 * Real sales ranking, or null while none exists.
 *
 * Replace the body with a lookup over actual order data (e.g. an API endpoint
 * that aggregates the orders store by product) once orders are recorded.
 * Do NOT substitute tags or invented numbers — a null here is the honest
 * state and the UI is built to handle it.
 */
export function getSalesRanking(): SalesRanking | null {
  return null;
}

function byNewest<T extends SortableProduct>(products: T[]): T[] {
  return products.sort(
    (a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime(),
  );
}

/** Pure sort — never mutates the input array. */
export function sortProducts<T extends SortableProduct>(
  products: readonly T[],
  sortBy: SortKey | string,
  ranking: SalesRanking | null,
): T[] {
  const result = [...products];
  switch (sortBy) {
    case "price-low":
      return result.sort((a, b) => a.price - b.price);
    case "price-high":
      return result.sort((a, b) => b.price - a.price);
    case "best-seller":
      if (ranking) {
        return result.sort(
          (a, b) => (ranking.get(b.handle) ?? 0) - (ranking.get(a.handle) ?? 0),
        );
      }
      // No real sales data yet — fall back instead of faking an order.
      return byNewest(result);
    case "newest":
    default:
      return byNewest(result);
  }
}
