# API Reference

## Overview

The Turath Collective API provides a single serverless endpoint that proxies requests to the **Shopify Storefront API v2024-01**. There are no custom backend APIs—all product, variant, and cart data flows through Shopify.

### Architecture

```
Client (React) 
  ↓ 
/api/shopify (Vercel Function)
  ↓ 
Shopify Storefront API v2024-01 (GraphQL)
```

---

## Endpoints

### `POST /api/shopify`

Proxies GraphQL queries to Shopify Storefront API.

**Request:**
```json
{
  "query": "query { ... }",
  "variables": { ... }
}
```

**Response (200 OK):**
```json
{
  "data": { ... }
}
```

**Response (503 Service Unavailable):**
Returned when `SHOPIFY_STORE_DOMAIN` or `SHOPIFY_STOREFRONT_TOKEN` is not configured. Client falls back to mock data (in "mock" mode only).

```json
{
  "shopifyDisabled": true
}
```

**Response (502 Bad Gateway):**
Shopify API returned an error or network issue occurred.

---

## Client Library

### `shopifyService`

The `client/src/lib/shopify.ts` module exports a service object with methods for common Shopify operations:

#### `shopifyService.getProducts(first?: number, after?: string)`
Fetches products with pagination.

**Arguments:**
- `first` (number, default: 12) — Number of products to fetch
- `after` (string, optional) — Cursor for pagination

**Returns:** `Promise<ShopifyProduct[] | null>`

**Example:**
```tsx
import { shopifyService } from "@/lib/shopify";

const products = await shopifyService.getProducts(12);
```

---

#### `shopifyService.getProductByHandle(handle: string)`
Fetch a single product by its URL handle.

**Arguments:**
- `handle` (string) — Product URL handle (e.g., "damascus-vase")

**Returns:** `Promise<ShopifyProduct | null>`

**Example:**
```tsx
const product = await shopifyService.getProductByHandle("damascus-vase");
```

---

#### `shopifyService.searchProducts(query: string, first?: number)`
Search for products by title or description.

**Arguments:**
- `query` (string) — Search term
- `first` (number, default: 12) — Results per page

**Returns:** `Promise<ShopifyProduct[] | null>`

**Example:**
```tsx
const results = await shopifyService.searchProducts("vase", 20);
```

---

#### `shopifyService.getCollectionByHandle(handle: string, first?: number, after?: string)`
Fetch a collection with paginated products.

**Arguments:**
- `handle` (string) — Collection URL handle
- `first` (number, default: 12) — Products per page
- `after` (string, optional) — Pagination cursor

**Returns:** `Promise<ShopifyCollection | null>`

**Example:**
```tsx
const collection = await shopifyService.getCollectionByHandle("damascus-collection", 20);
```

---

#### `shopifyService.createCart()`
Create a new empty Shopify cart.

**Returns:** `Promise<ShopifyCart | null>`

**Example:**
```tsx
const cart = await shopifyService.createCart();
// Cart ID stored in localStorage
```

---

#### `shopifyService.getCart(cartId: string)`
Retrieve an existing cart by ID.

**Arguments:**
- `cartId` (string) — Shopify cart ID

**Returns:** `Promise<ShopifyCart | null>`

**Example:**
```tsx
const cart = await shopifyService.getCart("gid://shopify/Cart/...");
```

---

#### `shopifyService.addToCart(cartId: string, lines: CartLineInput[])`
Add items to a cart.

**Arguments:**
- `cartId` (string) — Shopify cart ID
- `lines` (CartLineInput[]) — Array of `{ merchandiseId, quantity }`

**Returns:** `Promise<ShopifyCart | null>`

**Example:**
```tsx
const updatedCart = await shopifyService.addToCart(cartId, [
  { merchandiseId: "gid://shopify/ProductVariant/...", quantity: 2 }
]);
```

---

#### `shopifyService.removeFromCart(cartId: string, lineIds: string[])`
Remove items from a cart.

**Arguments:**
- `cartId` (string) — Shopify cart ID
- `lineIds` (string[]) — Line item IDs to remove

**Returns:** `Promise<ShopifyCart | null>`

**Example:**
```tsx
const updatedCart = await shopifyService.removeFromCart(cartId, ["gid://shopify/CartLine/..."]);
```

---

#### `shopifyService.updateLineQuantity(cartId: string, lines: CartLineUpdateInput[])`
Update quantities for cart items.

**Arguments:**
- `cartId` (string) — Shopify cart ID
- `lines` (CartLineUpdateInput[]) — Array of `{ id, quantity }`

**Returns:** `Promise<ShopifyCart | null>`

**Example:**
```tsx
const updatedCart = await shopifyService.updateLineQuantity(cartId, [
  { id: "gid://shopify/CartLine/...", quantity: 5 }
]);
```

---

## Environment Variables

**Required (Production):**
- `SHOPIFY_STORE_DOMAIN` — Your Shopify store domain (e.g., `mystore.myshopify.com`)
- `SHOPIFY_STOREFRONT_TOKEN` — Storefront API access token

**Optional:**
- `VITE_SHOPIFY_MODE` — Fallback mode: `"live"` (production, fail on API error) or `"mock"` (development, fallback to mock data). Default: `"mock"`
- `VITE_GA_MEASUREMENT_ID` — Google Analytics 4 measurement ID (e.g., `G-XXXXXXXXXX`)

---

## Error Handling

### Mode: "live"

When `VITE_SHOPIFY_MODE=live`, errors throw exceptions that bubble up to the caller. This prevents the app from silently falling back to outdated mock data.

```tsx
try {
  const products = await shopifyService.getProducts();
  if (!products) {
    // Handle gracefully - you must have Shopify configured
    showError("Products unavailable. Please try again later.");
  }
} catch (error) {
  // This is expected in live mode if Shopify is misconfigured
  console.error("Shopify API error:", error);
}
```

### Mode: "mock" (Default)

In development, the API returns `null` on failure, allowing components to fall back to local mock data gracefully:

```tsx
const products = await shopifyService.getProducts() || mockProducts;
// No error thrown, app continues with mock data
```

---

## GraphQL Examples

### Query: Get Products

```graphql
query GetProducts($first: Int!) {
  products(first: $first) {
    edges {
      node {
        id
        handle
        title
        description
        variants(first: 100) {
          edges {
            node {
              id
              title
              selectedOptions {
                name
                value
              }
              price {
                amount
                currencyCode
              }
              metafields(identifiers: [{ key: "quantity_style", namespace: "custom" }]) {
                key
                value
              }
            }
          }
        }
        featuredImage {
          url
          altText
        }
      }
    }
  }
}
```

### Query: Get Collection

```graphql
query GetCollection($handle: String!, $first: Int!) {
  collectionByHandle(handle: $handle) {
    id
    title
    description
    products(first: $first) {
      edges {
        node {
          id
          title
          handle
        }
      }
    }
  }
}
```

### Mutation: Create Cart

```graphql
mutation CreateCart {
  cartCreate(input: {}) {
    cart {
      id
      checkoutUrl
      lines(first: 100) {
        edges {
          node {
            id
            quantity
            merchandise {
              ... on ProductVariant {
                id
                title
              }
            }
          }
        }
      }
    }
  }
}
```

---

## Troubleshooting

**Q: API returns `shopifyDisabled: true`**  
A: Ensure `SHOPIFY_STORE_DOMAIN` and `SHOPIFY_STOREFRONT_TOKEN` are set on your Vercel deployment. See [DEPLOYMENT.md](./DEPLOYMENT.md).

**Q: GraphQL errors in console**  
A: Check Shopify query syntax in `.github/API.md`. Validate with Shopify's GraphQL Admin.

**Q: Mock data appears in production**  
A: Set `VITE_SHOPIFY_MODE=live` in your Vercel production environment. This will fail loudly if Shopify is misconfigured instead of silently falling back.

---

## References

- **Shopify Storefront API Docs:** https://shopify.dev/docs/api/storefront
- **GraphQL Playground:** https://yourstorename.myshopify.com/admin/api/2024-01/graphql.json (requires auth)
