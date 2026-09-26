import { describe, it, expect } from "vitest";
import { normaliseShopify } from "./shop";

// normaliseShopify decides which craft a live Shopify product is shown under.
// It used to guess: keyword-match the Type, fall back to the first tag, and
// default anything empty to ceramics. Each case below is one of those guesses
// that is no longer allowed to happen.

type ShopifyProduct = Parameters<typeof normaliseShopify>[0];

const product = (over: Partial<ShopifyProduct>): ShopifyProduct =>
  ({
    id: "gid://shopify/Product/1",
    title: "Test piece",
    handle: "test-piece",
    description: "",
    descriptionHtml: "",
    productType: "",
    tags: [],
    vendor: "",
    availableForSale: true,
    createdAt: "2026-01-01T00:00:00Z",
    images: { edges: [] },
    variants: { edges: [] },
    priceRange: { minVariantPrice: { amount: "10.00", currencyCode: "CAD" } },
    ...over,
  }) as unknown as ShopifyProduct;

describe("normaliseShopify — category comes from Shopify Type, literally", () => {
  it("files a glass bowl under glass, not ceramics", () => {
    const p = normaliseShopify(product({ title: "Indigo Glass Bowl", productType: "Glass" }));
    expect(p.category).toBe("glass");
  });

  it("files a ceramic piece under ceramics", () => {
    const p = normaliseShopify(product({ title: "Indigo Mosaic Bowl", productType: "Ceramics" }));
    expect(p.category).toBe("ceramics");
  });

  it("does not default an empty Type to ceramics", () => {
    const p = normaliseShopify(product({ productType: "" }));
    expect(p.category).toBe("");
  });

  it("never uses a tag as the category", () => {
    // The live product was tagged ["best-seller", "new"]. With an empty Type
    // the old code made its category "best-seller".
    const p = normaliseShopify(product({ productType: "", tags: ["best-seller", "glass"] }));
    expect(p.category).toBe("");
  });

  it("leaves a shape as a shape rather than inferring a craft from it", () => {
    const p = normaliseShopify(product({ productType: "Bowl" }));
    expect(p.category).toBe("bowl");
  });
});
