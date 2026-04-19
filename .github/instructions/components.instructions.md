---
name: Component Architecture & Patterns
description: "Use when: creating new components, refactoring component structure, understanding file organization, or establishing naming conventions."
applyTo: "client/src/components/**/*.tsx"
---

# Component Architecture & Patterns

## Component Organization

### Directory Structure
```
client/src/components/
├── ui/                      # shadcn/ui & primitive components (button, card, input, etc.)
├── PageLayout.tsx           # Main layout wrapper for all pages
├── Navbar.tsx               # Navigation bar (feature component)
├── Footer.tsx               # Footer (feature component)
├── product-grid.tsx         # Product grid (feature component)
├── hero.tsx                 # Hero section (feature component)
├── story-carousel.tsx       # Story carousel (feature component)
├── newsletter.tsx           # Newsletter signup (feature component)
└── ... other feature components
```

### Naming Conventions

**UI Components** (primitive, reusable):
- Lowercase with hyphens: `button.tsx`, `card.tsx`, `input.tsx`, `dialog.tsx`
- Exported as PascalCase: `export { Button } from "./button"`
- Locations: `client/src/components/ui/`
- Usage: Base building blocks (no business logic)

**Feature Components** (composed from UI components, domain-specific):
- PascalCase: `Navbar.tsx`, `Footer.tsx`, `ProductCard.tsx`, `HeroSection.tsx`
- Locations: `client/src/components/` (root level or subdirectories)
- Usage: Assembled from UI components + custom styling

**Page Components** (full pages):
- PascalCase: `Home.tsx`, `Shop.tsx`, `ProductDetail.tsx`
- Locations: `client/src/pages/`
- Wrapped with `PageLayout` component

### File Naming Rules

| Category | Pattern | Example | Notes |
|----------|---------|---------|-------|
| UI component files | lowercase-hyphenated | `button.tsx`, `product-grid.tsx` | Always singular |
| Feature components | PascalCase | `Navbar.tsx`, `ReviewCarousel.tsx` | Describes what it is |
| Page components | PascalCase | `Home.tsx`, `Shop.tsx` | Exported from `pages/` |
| Hooks | `use-` prefix | `use-auth.ts`, `use-mobile.tsx` | Always lower camelCase |
| Utilities | camelCase | `shopify.ts`, `utils.ts` | Helpers & external integrations |
| Context | context suffix | `cart-context.tsx` | React Context providers |

## Component Props Pattern

### Standard Props Interface
```tsx
import { ReactNode } from "react";

interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  children?: ReactNode;
  className?: string;
}

export default function Button({
  label,
  onClick,
  variant = "primary",
  size = "md",
  disabled = false,
  children,
  className = "",
}: ButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`btn btn-${variant} btn-${size} ${className}`}
    >
      {children || label}
    </button>
  );
}
```

**Best Practices**:
- Always define a `Props` interface (never use `any`)
- Provide defaults for optional props
- Keep optional props with `?` minimal
- Pass through `className` for composition flexibility
- Document prop types with comments for complex props

## Common Component Patterns

### Feature Component with Translation
```tsx
import { useTranslation } from "react-i18next";

interface ProductCardProps {
  productId: string;
  name: string;
  price: number;
  image: string;
}

export default function ProductCard({ productId, name, price, image }: ProductCardProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-4">
      <img src={image} alt={name} className="w-full aspect-square object-cover rounded-lg" />
      <div>
        <h3 className="font-serif text-lg font-semibold">{name}</h3>
        <p className="text-gray-600 text-sm">{t("common.price")}: ${price}</p>
      </div>
    </div>
  );
}
```

### Feature Component with Context
```tsx
import { useContext } from "react";
import { CartContext } from "@/context/cart-context";

export default function AddToCartButton({ productId, productName }: { productId: string; productName: string }) {
  const { addItem } = useContext(CartContext);

  const handleClick = () => {
    addItem({ id: productId, name: productName, quantity: 1 });
  };

  return (
    <button onClick={handleClick} className="w-full bg-[#3A0606] text-white py-3 rounded-lg hover:bg-opacity-90 transition-all">
      Add to Cart
    </button>
  );
}
```

### Responsive Feature Component
```tsx
import { useMobile } from "@/hooks/use-mobile";

export default function ResponsiveHero() {
  const isMobile = useMobile();

  return (
    <section className="w-full py-12 md:py-20">
      <div className="container mx-auto px-6 md:px-12">
        <h1 className="text-4xl md:text-6xl lg:text-8xl font-serif font-bold mb-6">
          {isMobile ? "Mobile Title" : "Desktop Title"}
        </h1>
        <p className="text-base md:text-lg max-w-2xl">
          Responsive description adapting to screen size.
        </p>
      </div>
    </section>
  );
}
```

## Composition Patterns

### Building a Complex Component from Simpler Ones
```tsx
// Bad: Monolithic component
export default function ProductGrid({ products }: { products: Product[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
      {products.map((product) => (
        <div key={product.id} className="flex flex-col gap-4">
          <img src={product.image} alt={product.name} className="aspect-square object-cover" />
          <h3>{product.name}</h3>
          <p>${product.price}</p>
          <button>Add to Cart</button>
        </div>
      ))}
    </div>
  );
}

// Good: Composed from smaller components
export default function ProductGrid({ products }: { products: Product[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 md:gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
```

### Composition with Slots
```tsx
interface CardProps {
  header?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
}

export default function Card({ header, footer, children }: CardProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
      {header && <div className="border-b px-6 py-4">{header}</div>}
      <div className="p-6">{children}</div>
      {footer && <div className="border-t px-6 py-4">{footer}</div>}
    </div>
  );
}
```

## Hooks Usage

### Using Built-in Hooks
```tsx
import { useAuth } from "@/hooks/use-auth";
import { useMobile } from "@/hooks/use-mobile";
import { useToast } from "@/hooks/use-toast";

export default function MyComponent() {
  const { user, isAuthenticated } = useAuth();
  const isMobile = useMobile();
  const { showToast } = useToast();

  if (!isAuthenticated) {
    return <p>Please log in</p>;
  }

  const handleAction = () => {
    showToast({ message: "Action completed!", type: "success" });
  };

  return (
    <div className={isMobile ? "flex flex-col" : "flex flex-row"}>
      <p>Welcome, {user?.name}</p>
      <button onClick={handleAction}>Perform Action</button>
    </div>
  );
}
```

## Export Patterns

### Single Export (Most Common)
```tsx
export default function Button({ label }: { label: string }) {
  return <button>{label}</button>;
}
```

### Named Exports (Shadcn/ui Pattern)
```tsx
export { Button } from "./button";
export type { ButtonProps } from "./button";
export { Input } from "./input";
```

## Anti-Patterns to Avoid

1. **Don't create prop-heavy components**: Break into smaller composed components
   - ❌ `<ProductCard variant="..." size="..." color="..." shape="..." ... />`
   - ✅ `<ProductCard><ProductImage /><ProductInfo /></ProductCard>`

2. **Don't duplicate UI logic**: Extract to reusable components
   - ❌ Create same button styling in 3 different components
   - ✅ Create `Button.tsx` UI component and use everywhere

3. **Don't skip types**: Always type props and returns
   - ❌ `export default function Button(props: any)`
   - ✅ `export default function Button(props: ButtonProps)`

4. **Don't mix concerns**: Separate UI from business logic
   - ❌ API calls inside render
   - ✅ Use hooks/context for state management, pass data as props

5. **Don't hardcode values**: Use props, context, or configuration
   - ❌ `<h1 className="text-6xl">Fixed Title</h1>`
   - ✅ `<h1 className="text-6xl">{title}</h1>`

## Accessibility (a11y)

### Essential Practices
```tsx
{/* Always provide alt text */}
<img src="/product.jpg" alt="Product name and description" />

{/* Semantic button element for keyboard navigation */}
<button className="...">Click me</button>

{/* Not clickable div */}
❌ <div onClick={handleClick}>Not semantic</div>

{/* Proper form labels */}
<label htmlFor="email">Email</label>
<input id="email" type="email" />

{/* Focus states for keyboard users */}
<button className="... focus:outline-none focus:ring-2 focus:ring-[#3A0606]">
  Keyboard accessible
</button>
```

## Shopify Data Compatibility

### Rule: Components Accept Pre-Normalized Data Only

**All feature components must accept data that's already been normalized from Shopify responses.** Never perform API calls, data fetching, or Shopify-specific logic inside components.

**Bad** ❌:
```tsx
export function ProductCard({ productHandle }: { productHandle: string }) {
  const [product, setProduct] = useState(null);
  
  useEffect(() => {
    shopifyService.getProduct(productHandle).then(setProduct); // ❌ API logic in component
  }, [productHandle]);
  
  return <div>{product?.name}</div>;
}
```

**Good** ✅:
```tsx
interface ProductCardProps {
  product: DisplayProduct;  // Pre-normalized
}

export function ProductCard({ product }: ProductCardProps) {
  return <div>{product.name}</div>;  // Only receives + displays data
}
```

### Image URL Compatibility

**All image props must support both static assets and Shopify CDN URLs without modification:**

```tsx
interface ProductImageProps {
  src: string;  // Works with:
                // "/assets/bowl.png" (static)
                // "https://cdn.shopify.com/.../bowl.jpg?v=123" (Shopify)
  alt: string;
}

export function ProductImage({ src, alt }: ProductImageProps) {
  return (
    <ResponsiveImage
      src={src}  // Automatically detects URL type
      alt={alt}
      layout="product-hero"
    />
  );
}
```

**Use `ResponsiveImage` component** for all product images. It handles:
- srcset generation (Shopify CDN only)
- sizes attribute for responsive sizing
- Both static and Shopify URLs seamlessly
- Bandwidth optimization on mobile

### Variant & Option Handling

**Components must handle product variants from Shopify schema:**

```typescript
interface Variation {
  variantId: string;       // "gid://shopify/ProductVariant/123"
  selectedOptions: Array<{ name: string; value: string }>;  // [{ name: "Color", value: "Indigo" }]
  price: number;
  images: string[];
}
```

Use `selectedOptions` directly from Shopify—don't create custom color/size structures that won't map to real Shopify data.

---

## When to Update This File

When you establish a new component pattern or refactor component architecture:
1. Describe the pattern with brief explanation
2. Add code example showing best practice
3. Optionally note anti-pattern to avoid
4. Commit with message: `docs: document {pattern} component pattern`
