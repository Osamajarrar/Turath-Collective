---
name: Shopify Headless Integration Patterns
description: "Use when: building components that will receive Shopify data, structuring API calls, mapping fields, handling images from Shopify CDN, or preparing for Shopify headless migration."
applyTo: "client/src/**/*.tsx, client/src/lib/shopify.ts, server/routes.ts"
---

# Shopify Headless Integration Patterns

## Core Principle

**Everything eventually flows from Shopify.**

All component data structures, image URLs, text content, pricing, inventory, and metadata are designed to seamlessly accept Shopify GraphQL Storefront API responses. Build with the assumption that static assets and mock data are temporary—they will be replaced with live Shopify data.

---

## Data Shape Compatibility

### Product Data: Match Shopify Schema

**Current Component Interface** (temporary, mock data):
```typescript
interface DisplayProduct {
  id: string;
  handle: string;
  name: string;
  price: number;
  description: string;
  variations: Variation[];
  isBestSeller: boolean;
  availableForSale: boolean;
  currencyCode: string;
}
```

**Shopify Storefront API Response** (target):
```graphql
{
  product(handle: "indigo-mosaic-bowl") {
    id: "gid://shopify/Product/123456789"
    title: "Indigo Mosaic Bowl"
    handle: "indigo-mosaic-bowl"
    description: "A hand-painted indigo bowl..."
    productType: "Dinnerware > Bowls"
    tags: ["best-seller", "heritage", "handmade"]
    vendor: "Turath Collective"
    availableForSale: true
    
    priceRange {
      minVariantPrice { amount: "45.00", currencyCode: "CAD" }
      maxVariantPrice { amount: "48.00", currencyCode: "CAD" }
    }
    
    variants(first: 10) {
      edges {
        node {
          id: "gid://shopify/ProductVariant/456789"
          title: "Indigo"
          price { amount: "45.00", currencyCode: "CAD" }
          selectedOptions {
            name: "Color"
            value: "Indigo"
          }
          availableForSale: true
        }
      }
    }
    
    images(first: 10) {
      edges {
        node {
          url: "https://cdn.shopify.com/s/files/1/0123/4567/8901/products/bowl.jpg"
          altText: "Indigo Mosaic Bowl on cream background"
          width: 1024
          height: 1024
        }
      }
    }
  }
}
```

**Key Rule**: Components accept the normalized `DisplayProduct` type. **Normalization happens at the API layer** (`client/src/lib/shopify.ts`), not in components.

---

## Image URLs: Shopify CDN Pattern

### Shopify Image URL Format
```
https://cdn.shopify.com/s/files/1/{shop_id}/{product_id}/product.jpg?v={timestamp}&width={px}
```

### Examples
- Base: `https://cdn.shopify.com/.../indigo-bowl.jpg?v=1764089925`
- Responsive variant: `https://cdn.shopify.com/.../indigo-bowl.jpg?v=1764089925&width=330`
- Desktop fallback: `https://cdn.shopify.com/.../indigo-bowl.jpg?v=1764089925&width=1440`

### Responsive Image Implementation

All images should use the `ResponsiveImage` component which automatically generates `srcset` for Shopify CDN URLs:

```tsx
import ResponsiveImage from "@/components/ui/responsive-image";

export function ProductCard({ product }: { product: DisplayProduct }) {
  const imageUrl = product.variations[0]?.images[0] ?? fallbackImage;

  return (
    <ResponsiveImage
      src={imageUrl}  // Works with BOTH static assets AND Shopify URLs
      alt={product.name}
      layout="product-hero"  // Presets sizes attribute based on context
    />
  );
}
```

### How ResponsiveImage Works

1. **Detects URL type**:
   - Static asset (e.g., `/assets/bowl.png`): No srcset generated
   - Shopify CDN: srcset automatically generated with width parameters

2. **Generates responsive attributes**:
   ```tsx
   {
     src: "https://cdn.shopify.com/.../bowl.jpg?v=123",
     srcSet: "https://cdn.shopify.com/.../bowl.jpg?v=123&width=330 165w, ...",
     sizes: "(min-width: 1200px) 1066px, ..."
   }
   ```

3. **Bandwidth optimization**:
   - Mobile device: Downloads ~330px image (~50KB)
   - Desktop: Downloads ~1440px image (~200KB)
   - No oversized images on mobile! ✅

---

## Static Assets → Shopify Migration Path

### Phase 1: Current State (Static Assets)
```tsx
import burgundyBowl from "@/assets/burgundy-bowl.png";

export function ProductCard() {
  return (
    <ResponsiveImage
      src={burgundyBowl}
      alt="Burgundy bowl"
      layout="product-hero"
    />
  );
}
```

### Phase 2: Mixed (Shopify + Fallback)
```tsx
export function ProductCard({ product }: { product: DisplayProduct }) {
  // Shopify images available OR fallback to static
  const imageUrl = product.variations[0]?.images[0] ?? fallbackImage;
  
  return (
    <ResponsiveImage
      src={imageUrl}
      alt={product.name}
      layout="product-hero"
    />
  );
}
```

### Phase 3: Pure Shopify
Same component code. `product` now always contains Shopify URLs from `shopifyService.getProduct()`.

**No component changes needed** when migrating between phases—only API layer changes.

---

## Component Data Flow

```
Shopify Admin
     ↓
Shopify Storefront API (GraphQL)
     ↓
server/routes.ts (proxy)
     ↓
client/lib/shopify.ts (normalize)
     ↓
DisplayProduct (normalized interface)
     ↓
React Components (consume data)
```

### Example: Product Page Lifecycle

```tsx
// 1. Fetch from Shopify via API layer
const result = await shopifyService.getProduct("indigo-bowl");

// 2. Normalize response (in shopifyService)
const normalized = normalizeShopifyProduct(result);
// → DisplayProduct with shape matching component props

// 3. Pass to components
<ProductCard product={normalized} />

// 4. Component renders (no API knowledge)
export function ProductCard({ product }: { product: DisplayProduct }) {
  return <h1>{product.name}</h1>;  // Just displays data
}
```

---

## Environment Variables for Shopify

Add to `.env.local` and `.env.local.example`:

```env
# Shopify Headless Configuration

# Frontend (Storefront API - public token, customer-facing)
VITE_SHOPIFY_STOREFRONT_TOKEN=shpat_xxxxxxxxxxxxxxx
VITE_SHOPIFY_STORE_DOMAIN=turath-collective.myshopify.com
VITE_SHOPIFY_STORE_API_VERSION=2024-01

# Backend (Admin API - private, server-only)
SHOPIFY_API_KEY=sk_live_xxxxxxxx
SHOPIFY_API_SECRET=shpss_xxxxxxx
SHOPIFY_ADMIN_ACCESS_TOKEN=shpat_xxxxxxx
```

### Security Rules
- ❌ **Never** expose Admin tokens on frontend
- ✅ **Always** use Storefront API for public data (products, collections)
- ✅ **Always** use Admin API on backend only (orders, webhooks, analytics)
- ✅ **Keep `.env.local` in `.gitignore`**

---

## API Integration Patterns

### Fetching Products with Graceful Fallback

Located at `client/src/lib/shopify.ts`:

```typescript
export async function getProduct(handle: string): Promise<ShopifyProduct | null> {
  try {
    // Request goes through server proxy (/api/shopify)
    const response = await fetch("/api/shopify/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        query: PRODUCT_QUERY, 
        variables: { handle } 
      }),
    });
    
    if (!response.ok) throw new Error("Failed to fetch");
    const { data, errors } = await response.json();
    
    if (errors) {
      console.warn("Shopify GraphQL error:", errors);
      return null;  // Fall back to mock data
    }
    
    return data.product ?? null;
  } catch (error) {
    console.warn("Shopify API unavailable, using mock data:", error);
    return null;  // Fall back to mock data
  }
}
```

### Server Proxy for Storefront API

Located at `server/routes.ts`:

```typescript
import express from "express";

const router = express.Router();

// All Shopify requests proxy through this endpoint
router.post("/shopify/products", async (req, res) => {
  const { query, variables } = req.body;

  try {
    const response = await fetch(
      `https://${process.env.SHOPIFY_STORE_DOMAIN}/api/${process.env.SHOPIFY_STORE_API_VERSION}/graphql.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Storefront-Access-Token": process.env.VITE_SHOPIFY_STOREFRONT_TOKEN!,
        },
        body: JSON.stringify({ query, variables }),
      }
    );

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("Shopify API error:", error);
    res.status(500).json({ errors: [{ message: "Shopify API unavailable" }] });
  }
});

export default router;
```

---

## Collections & Navigation from Shopify

Instead of hardcoding navigation, fetch collections:

```tsx
// In Navbar.tsx
export default function Navbar() {
  const [navItems, setNavItems] = useState<NavItem[]>([]);
  
  useEffect(() => {
    shopifyService.getCollections().then((collections) => {
      const items = collections.map((c) => ({
        label: c.title,
        href: `/collection/${c.handle}`,
      }));
      setNavItems(items);
    });
  }, []);
  
  return (
    <nav>
      {navItems.map((item) => (
        <Link key={item.href} href={item.href}>
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
```

**Benefit**: When you add a new collection in Shopify Admin, it appears in the navbar automatically. No code changes needed.

---

## Variant & Option Handling

Shopify products have **variants** with **selectedOptions**. Each variation typically has:

```typescript
{
  id: "gid://shopify/ProductVariant/123",
  title: "Indigo",
  price: { amount: "45.00", currencyCode: "CAD" },
  selectedOptions: [
    { name: "Color", value: "Indigo" },
    { name: "Size", value: "Medium" }
  ]
}
```

**In components**: Use `selectedOptions` directly from Shopify, don't create custom variant structures:

```tsx
export function ProductVariations({ product }: { product: DisplayProduct }) {
  return (
    <div>
      {product.variations.map((variant) => (
        <button key={variant.variantId}>
          {/* Extract option from Shopify selectedOptions */}
          {variant.color}
        </button>
      ))}
    </div>
  );
}
```

---

## Metafields for Custom Content

Shopify **metafields** store custom data that doesn't fit standard product fields. Use them for:
- Heritage story / artisan bio
- Care instructions
- Material sourcing information
- Custom product attributes

**Example in Shopify Admin**:
```
Product: Indigo Mosaic Bowl
Namespace: custom
Key: heritage_story
Value: "This bowl is hand-painted by artisans in Hebron, Palestine..."
```

**Fetch in component**:
```tsx
export interface ShopifyProduct {
  metafields: {
    edges: Array<{
      node: {
        key: string;
        value: string;
      };
    }>;
  };
}

function HeritageStory({ product }: { product: ShopifyProduct }) {
  const metafield = product.metafields.edges.find(
    (edge) => edge.node.key === "heritage_story"
  );
  
  return <p>{metafield?.node.value}</p>;
}
```

---

## i18n with Shopify

Shopify doesn't natively support multi-language product data. Two approaches:

### Option A: Metafields per Language (Recommended)

Store translations as separate metafields:
- `description.en`: English description
- `description.fr`: French description
- `description.ar`: Arabic description

```tsx
function useProductDescription(product: ShopifyProduct, locale: string) {
  const metafield = product.metafields.edges.find(
    (e) => e.node.key === `description.${locale}`
  );
  return metafield?.node.value ?? product.description;
}
```

### Option B: i18n Keys in Shopify

Store translation keys in Shopify, resolve client-side:

1. In Shopify Admin: Set description to `"key:product.indigo_bowl.description"`
2. In code:
   ```tsx
   const { t } = useTranslation();
   const description = t(product.description.replace("key:", ""));
   ```

---

## Testing with Shopify Data

### Mock Shopify Product for Tests

```typescript
const MOCK_SHOPIFY_PRODUCT: ShopifyProduct = {
  id: "gid://shopify/Product/123",
  title: "Test Product",
  handle: "test-product",
  description: "A test product",
  descriptionHtml: "<p>A test product</p>",
  productType: "Test",
  tags: [],
  vendor: "Test Vendor",
  availableForSale: true,
  createdAt: new Date().toISOString(),
  priceRange: {
    minVariantPrice: { amount: "10.00", currencyCode: "CAD" },
    maxVariantPrice: { amount: "20.00", currencyCode: "CAD" },
  },
  images: {
    edges: [
      {
        node: {
          url: "https://cdn.shopify.com/.../product.jpg?v=123",
          altText: "Test product image",
        },
      },
    ],
  },
  variants: {
    edges: [
      {
        node: {
          id: "gid://shopify/ProductVariant/456",
          title: "Default",
          availableForSale: true,
          price: { amount: "10.00", currencyCode: "CAD" },
          compareAtPrice: null,
          selectedOptions: [],
        },
      },
    ],
  },
};
```

---

## Shopify Headless Readiness Checklist

### Data & API
- [ ] All product components accept `DisplayProduct` interface
- [ ] Components never make API calls (API layer only)
- [ ] API layer normalizes Shopify responses
- [ ] Graceful fallback to mock data when API unavailable
- [ ] Collections fetched from Shopify, not hardcoded

### Images
- [ ] All images use `ResponsiveImage` component
- [ ] Image URLs support both static assets and Shopify CDN
- [ ] srcset/sizes attributes generated correctly
- [ ] Mobile doesn't download oversized images

### Variants & Options
- [ ] Product variants map from Shopify `edges`
- [ ] Uses Shopify `selectedOptions` structure
- [ ] Variant IDs are Shopify GraphQL IDs (`gid://...`)

### Localization
- [ ] i18n strategy chosen (metafields or keys)
- [ ] Collections/categories fetched from Shopify
- [ ] Product names/descriptions not hardcoded

### Environment
- [ ] Shopify API credentials in `.env.local`
- [ ] `.env.local` in `.gitignore`
- [ ] `.env.local.example` documents all required vars

### Testing
- [ ] Mock data matches Shopify schema
- [ ] Product page renders with mock AND real Shopify data
- [ ] Cart integration uses Shopify variant IDs

---

## Quick Start: Connecting to Shopify

### 1. Create Shopify App
```
Shopify Admin → Settings → Apps and integrations → Develop apps → Create app
```

### 2. Enable APIs
- ✅ Storefront API (for frontend)
- ✅ Admin API (for backend)

### 3. Get Credentials
- Storefront API Access Token
- API Key & Secret
- Store Domain

### 4. Add to `.env.local`
```env
VITE_SHOPIFY_STOREFRONT_TOKEN=shpat_xxx
VITE_SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
SHOPIFY_API_KEY=sk_live_xxx
SHOPIFY_ADMIN_ACCESS_TOKEN=shpat_xxx
```

### 5. Test Connection
```bash
curl -X POST https://your-store.myshopify.com/api/2024-01/graphql.json \
  -H "X-Shopify-Storefront-Access-Token: $VITE_SHOPIFY_STOREFRONT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "{ products(first: 1) { edges { node { title } } } }"
  }'
```

---

## Further Reading

- [Shopify Storefront API Docs](https://shopify.dev/docs/api/storefront)
- [Shopify GraphQL Explorer](https://shopify.dev/docs/api/storefront/latest/queries/products)
- [Metafields Guide](https://shopify.dev/docs/apps/custom-apps/admin-rest-api/admin-rest-api-reference#metafield)
