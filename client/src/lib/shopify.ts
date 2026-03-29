/**
 * Shopify Storefront API v2024-01 — Full GraphQL Service Layer
 *
 * All requests are proxied through /api/shopify to:
 *   1. Keep the Storefront token server-side
 *   2. Avoid CORS issues
 *
 * Feature flag: when SHOPIFY_STOREFRONT_TOKEN is not set on the server,
 * the proxy returns { shopifyDisabled: true } and every method returns
 * null / empty array so callers fall back to local mock data silently.
 */

// ── Types ─────────────────────────────────────────────────────────────────────

export interface ShopifyImage {
  url: string;
  altText: string | null;
}

export interface ShopifyMoneyV2 {
  amount: string;
  currencyCode: string;
}

export interface ShopifyProductVariant {
  id: string;
  title: string;
  availableForSale: boolean;
  price: ShopifyMoneyV2;
  compareAtPrice: ShopifyMoneyV2 | null;
  selectedOptions: Array<{ name: string; value: string }>;
}

export interface ShopifyProduct {
  id: string;
  title: string;
  handle: string;
  description: string;
  descriptionHtml: string;
  productType: string;
  tags: string[];
  vendor: string;
  availableForSale: boolean;
  createdAt: string;
  priceRange: {
    minVariantPrice: ShopifyMoneyV2;
    maxVariantPrice: ShopifyMoneyV2;
  };
  images: { edges: Array<{ node: ShopifyImage }> };
  variants: { edges: Array<{ node: ShopifyProductVariant }> };
}

export interface ShopifyCollection {
  id: string;
  title: string;
  handle: string;
  description: string;
  image: ShopifyImage | null;
}

export interface ShopifyCartLineMerchandise {
  id: string;
  title: string;
  price: ShopifyMoneyV2;
  image: ShopifyImage | null;
  product: { title: string; handle: string };
}

export interface ShopifyCartLine {
  id: string;
  quantity: number;
  merchandise: ShopifyCartLineMerchandise;
}

export interface ShopifyCart {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  cost: { totalAmount: ShopifyMoneyV2; subtotalAmount: ShopifyMoneyV2 };
  lines: { edges: Array<{ node: ShopifyCartLine }> };
}

// ── GraphQL fragments ─────────────────────────────────────────────────────────

const PRODUCT_FRAGMENT = `
  id title handle description descriptionHtml productType tags vendor availableForSale createdAt
  priceRange {
    minVariantPrice { amount currencyCode }
    maxVariantPrice { amount currencyCode }
  }
  images(first: 10) { edges { node { url altText } } }
  variants(first: 20) {
    edges {
      node {
        id title availableForSale
        price { amount currencyCode }
        compareAtPrice { amount currencyCode }
        selectedOptions { name value }
      }
    }
  }
`;

/** Cart fields reused by create, add, get, update, remove mutations */
const CART_SELECTION = `
  id checkoutUrl totalQuantity
  cost {
    totalAmount { amount currencyCode }
    subtotalAmount { amount currencyCode }
  }
  lines(first: 100) {
    edges {
      node {
        id quantity
        merchandise {
          ... on ProductVariant {
            id title
            image { url altText }
            price { amount currencyCode }
            product { title handle }
          }
        }
      }
    }
  }
`;

// ── Core proxy caller ─────────────────────────────────────────────────────────

async function shopifyQuery<T>(query: string, variables: Record<string, unknown> = {}): Promise<T | null> {
  try {
    const res = await fetch("/api/shopify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, variables }),
    });

    if (res.status === 503) return null; // Shopify not configured — caller falls back to mock

    if (!res.ok) {
      console.warn("[Shopify] Proxy error", res.status);
      return null;
    }

    const json = await res.json();
    if (json.errors) {
      console.warn("[Shopify] GraphQL errors", json.errors);
      return null;
    }
    return json.data as T;
  } catch (err) {
    console.warn("[Shopify] Network error", err);
    return null;
  }
}

// ── Service methods ───────────────────────────────────────────────────────────

export const shopifyService = {
  /** Fetch all products (first 50). Returns null when Shopify is not configured. */
  async getProducts(first = 50): Promise<ShopifyProduct[] | null> {
    const data = await shopifyQuery<{ products: { edges: Array<{ node: ShopifyProduct }> } }>(
      `query GetProducts($first: Int!) {
        products(first: $first) {
          edges { node { ${PRODUCT_FRAGMENT} } }
        }
      }`,
      { first }
    );
    return data ? data.products.edges.map(e => e.node) : null;
  },

  /** Fetch a single product by handle. Returns null on miss or when unconfigured. */
  async getProduct(handle: string): Promise<ShopifyProduct | null> {
    const data = await shopifyQuery<{ productByHandle: ShopifyProduct | null }>(
      `query GetProduct($handle: String!) {
        productByHandle(handle: $handle) { ${PRODUCT_FRAGMENT} }
      }`,
      { handle }
    );
    return data?.productByHandle ?? null;
  },

  /** Fetch all collections (first 20). Returns null when unconfigured. */
  async getCollections(first = 20): Promise<ShopifyCollection[] | null> {
    const data = await shopifyQuery<{ collections: { edges: Array<{ node: ShopifyCollection }> } }>(
      `query GetCollections($first: Int!) {
        collections(first: $first) {
          edges {
            node {
              id title handle description
              image { url altText }
            }
          }
        }
      }`,
      { first }
    );
    return data ? data.collections.edges.map(e => e.node) : null;
  },

  /** Create a new cart. Returns null when unconfigured. */
  async createCart(lines: Array<{ merchandiseId: string; quantity: number }> = []): Promise<ShopifyCart | null> {
    const data = await shopifyQuery<{ cartCreate: { cart: ShopifyCart; userErrors: Array<{ message: string }> } }>(
      `mutation CartCreate($input: CartInput!) {
        cartCreate(input: $input) {
          cart { ${CART_SELECTION} }
          userErrors { message }
        }
      }`,
      { input: { lines } }
    );
    if (!data) return null;
    if (data.cartCreate.userErrors.length > 0) {
      console.warn("[Shopify] Cart errors", data.cartCreate.userErrors);
      return null;
    }
    return data.cartCreate.cart;
  },

  /** Fetch cart by id (e.g. after page load). Returns null if missing or unconfigured. */
  async getCart(cartId: string): Promise<ShopifyCart | null> {
    const data = await shopifyQuery<{ cart: ShopifyCart | null }>(
      `query GetCart($cartId: ID!) {
        cart(id: $cartId) { ${CART_SELECTION} }
      }`,
      { cartId }
    );
    return data?.cart ?? null;
  },

  /** Add a line item to an existing cart. Returns the updated cart or null. */
  async addToCart(cartId: string, lines: Array<{ merchandiseId: string; quantity: number }>): Promise<ShopifyCart | null> {
    const data = await shopifyQuery<{ cartLinesAdd: { cart: ShopifyCart; userErrors: Array<{ message: string }> } }>(
      `mutation CartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
        cartLinesAdd(cartId: $cartId, lines: $lines) {
          cart { ${CART_SELECTION} }
          userErrors { message }
        }
      }`,
      { cartId, lines }
    );
    if (!data) return null;
    if (data.cartLinesAdd.userErrors.length > 0) {
      console.warn("[Shopify] Cart add errors", data.cartLinesAdd.userErrors);
      return null;
    }
    return data.cartLinesAdd.cart;
  },

  /** Update line quantities. */
  async updateCartLines(
    cartId: string,
    lines: Array<{ id: string; quantity: number }>
  ): Promise<ShopifyCart | null> {
    const data = await shopifyQuery<{ cartLinesUpdate: { cart: ShopifyCart; userErrors: Array<{ message: string }> } }>(
      `mutation CartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
        cartLinesUpdate(cartId: $cartId, lines: $lines) {
          cart { ${CART_SELECTION} }
          userErrors { message }
        }
      }`,
      { cartId, lines }
    );
    if (!data) return null;
    if (data.cartLinesUpdate.userErrors.length > 0) {
      console.warn("[Shopify] Cart update errors", data.cartLinesUpdate.userErrors);
      return null;
    }
    return data.cartLinesUpdate.cart;
  },

  /** Remove lines by cart line id. */
  async removeCartLines(cartId: string, lineIds: string[]): Promise<ShopifyCart | null> {
    const data = await shopifyQuery<{ cartLinesRemove: { cart: ShopifyCart; userErrors: Array<{ message: string }> } }>(
      `mutation CartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
        cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
          cart { ${CART_SELECTION} }
          userErrors { message }
        }
      }`,
      { cartId, lineIds }
    );
    if (!data) return null;
    if (data.cartLinesRemove.userErrors.length > 0) {
      console.warn("[Shopify] Cart remove errors", data.cartLinesRemove.userErrors);
      return null;
    }
    return data.cartLinesRemove.cart;
  },

  /** Convenience: create a cart with one item and return the checkout URL. */
  async buyNow(variantId: string, quantity = 1): Promise<string | null> {
    const cart = await this.createCart([{ merchandiseId: variantId, quantity }]);
    return cart?.checkoutUrl ?? null;
  },
};
