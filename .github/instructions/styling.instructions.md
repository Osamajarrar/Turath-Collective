---
name: Styling & Layout Conventions
description: "Component-level styling guide. Use when: updating layouts, creating grids, adjusting spacing, implementing responsive designs, or working with product displays."
applyTo: "client/src/components/**/*.tsx"
---

# Styling & Layout Conventions

## Container & Layout System

### Max-Width Container Pattern (Required for ALL Containers)
**ALL** content containers throughout the site must use this centered, responsive max-width pattern:

```tsx
<div className="container mx-auto  max-w-[1820px]">
  {/* Content constrained to 1820px at desktop, scales proportionally on larger screens */}
</div>
```

**Behavior**:
- **Mobile** (< 768px): Full width with 24px left/right padding
- **Tablet** (768px – 1024px): Full width with 48px padding
- **Desktop** (1024px+): Centered with max-width of 1820px, side margins auto-calculated

**Where to apply**:
- Navbar container ✅ (applies to all pages)
- Footer container ✅ (applies to all pages)
- Hero sections ✅
- All feature components (collections, stories, values, etc.) ✅
- Product grids ✅
- Page sections ✅

**Examples of correct usage**:
```tsx
// In navbar.tsx
<div className="w-full container mx-auto  max-w-[1820px] flex items-center justify-between">
// In footer.tsx
<div className="container mx-auto  max-w-[1820px]">

// In any component
<div className="container mx-auto  max-w-[1820px]">
  <h2>Section Title</h2>
  {/* content */}
</div>
```

### PageLayout Component
Located at `client/src/components/PageLayout.tsx`. Wraps all pages with:
- Navbar (sticky top, max-w constrained)
- Main content (with responsive container + max-w [1820px])
- Footer (sticky bottom, max-w constrained)
- Automatic padding: `pt-36 pb-24` (144px top, 96px bottom)

**How it works**:
- Pages with `noStyling={false}` (default) → PageLayout adds the max-width container wrapper
- Pages with `noStyling={true}` (e.g., home) → Each internal section must have its own max-width container

## Product Grid System

### Grid Breakpoints
The product grid adapts across screen sizes with **2 columns as the mobile base**:

```tsx
<div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-5 gap-y-6">
  {/* Products - starts at 2 columns for mobile, expands at larger breakpoints */}
</div>
```

| Breakpoint | Columns | Best For |
|-----------|---------|----------|
| Mobile (default) | 2 | Small screens – better use of space |
| md (768px) | 2 | Tablets (no change, stays at 2) |
| lg (1024px) | 3 | Laptops |
| xl (1280px) | 4 | Desktop / Full HD / 4K |

**Gap Sizing**:
- Horizontal gap (x): `gap-x-5` = 20px
- Vertical gap (y): `gap-y-6` = 24px
- Mobile uses tighter gaps for better use of space

### Product Card Images
Product images should be **square** with proper aspect ratio handling:

```tsx
<div className="aspect-square overflow-hidden rounded-lg bg-gray-100">
  <img src={imageUrl} alt={productName} className="w-full h-full object-cover" />
</div>
```

**Image Requirements**:
- Aspect ratio: `1:1` (square), not `4:5`
- Use `object-cover` for consistent square display without distortion
- Ensure images are optimized (lazy load, proper sizes attribute)
- Fallback background color for loading states

### Product Card Layout
Full product card pattern:

```tsx
<div className="flex flex-col gap-4">
  {/* Image Container */}
  <div className="aspect-square overflow-hidden rounded-lg bg-gray-100">
    <img src={imageUrl} alt={productName} className="w-full h-full object-cover" />
  </div>
  
  {/* Product Info */}
  <div className="flex flex-col gap-2">
    <h3 className="font-serif text-lg font-semibold">{productName}</h3>
    <p className="text-sm text-gray-600">{productDescription}</p>
    <p className="font-semibold">${price}</p>
  </div>
</div>
```

## Spacing Guidelines

### Vertical Spacing (Section Breaks)
```tsx
<section className="py-12 md:py-20">  {/* 48px / 80px top & bottom */}
  <h2 className="text-4xl mb-8">Section Title</h2>
  <p>Content...</p>
</section>
```

| Class | Size | Usage |
|-------|------|-------|
| `py-6 md:py-12` | 24px / 48px | Small sections |
| `py-12 md:py-20` | 48px / 80px | Medium sections (most common) |
| `py-16 md:py-32` | 64px / 128px | Large sections |

### Horizontal Spacing (Padding Within Containers)
```tsx
<div className="">
  {/* 24px padding / 48px padding */}
</div>
```

### Component Gaps (Internal Spacing)
```tsx
<div className="flex flex-col gap-4 md:gap-6">  {/* 16px / 24px */}
  <div>Item 1</div>
  <div>Item 2</div>
</div>
```

## Typography & Color

### Headings
```tsx
{/* Hero/Title */}
<h1 className="font-serif text-6xl md:text-8xl lg:text-[10rem] font-bold">
  Large Title
</h1>

{/* Section Heading */}
<h2 className="font-serif text-4xl md:text-6xl font-semibold">
  Section Title
</h2>

{/* Subsection */}
<h3 className="font-serif text-2xl md:text-4xl font-semibold">
  Subsection
</h3>
```

### Body Text
```tsx
<p className="font-sans text-base md:text-lg leading-relaxed text-gray-700">
  Body paragraph with comfortable line height.
</p>

<p className="font-sans text-sm text-gray-600">Small secondary text.</p>
```

### Color Classes
Use Tailwind color utilities:
- **Primary (Maroon)**: `text-[#3A0606]` or `bg-[#3A0606]`
- **Secondary (Green)**: `text-[#262C1B]` or `bg-[#262C1B]`
- **Background (Cream)**: `bg-[#FAF9F6]`
- **Accents**: Gray palette (`text-gray-600`, `text-gray-700`, etc.)

## Responsive Design Patterns

### Hidden/Shown by Breakpoint
```tsx
{/* Show only on mobile */}
<div className="md:hidden">Mobile menu</div>

{/* Show only on desktop */}
<div className="hidden md:block">Desktop navigation</div>

{/* Different sizes at breakpoints */}
<h1 className="text-3xl md:text-5xl lg:text-6xl">Responsive Heading</h1>
```

### Flex Direction Changes
```tsx
<div className="flex flex-col md:flex-row gap-6">
  <div className="flex-1">Left column</div>
  <div className="flex-1">Right column (stacks on mobile)</div>
</div>
```

### Grid Responsive Sizing
```tsx
{/* Product grid with 4 columns at desktop */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 md:gap-6">
  {products.map(product => <ProductCard key={product.id} product={product} />)}
</div>
```

## Common Component Patterns

### Card Component
```tsx
<div className="rounded-lg border border-gray-200 bg-white p-6">
  {/* Card content */}
</div>
```

### Button Group
```tsx
<div className="flex gap-3">
  <button className="...">Action 1</button>
  <button className="...">Action 2</button>
</div>
```

### Form Input
```tsx
<input 
  type="text" 
  placeholder="Enter text..." 
  className="flex h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#3A0606]" 
/>
```

## Hover & Interaction States

### Smooth Transitions
```tsx
<div className="transition-all duration-300 ease-out hover:scale-105">
  Interactive element (scale on hover)
</div>
```

### Image Swap with Fade
```tsx
<div className="relative overflow-hidden aspect-square rounded-lg">
  <img 
    src={image1Url} 
    alt="Product" 
    className="w-full h-full object-cover transition-opacity duration-500 hover:opacity-0" 
  />
  <img 
    src={image2Url} 
    alt="Product Hover" 
    className="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-500 hover:opacity-100" 
  />
</div>
```

## Anti-Patterns to Avoid

1. **Don't use arbitrary pixel values**: Use Tailwind spacing scale
   - ❌ `px-7`, `gap-9`
   - ✅ `px-6`, `gap-8`

2. **Don't hardcode widths/heights**: Use responsive classes
   - ❌ `style="width: 500px"`
   - ✅ `className="w-full md:w-1/2 lg:w-1/3"`

3. **Don't mix margin/gap**: Be consistent
   - ❌ `<div className="gap-4 mr-2">`
   - ✅ `<div className="flex gap-4">`

4. **Don't override container**: Never change page padding from the standard
   - ❌ `<div className="px-12">`  (if already in container)
   - ✅ `<div className="">` (only at page level)

5. **Don't skip accessibility**: Always add `alt` text, focus states, and ARIA labels

## Responsive Images & Shopify CDN

### ResponsiveImage Component

Use the `ResponsiveImage` component for all product images. It automatically:
- Detects Shopify CDN URLs vs static assets
- Generates `srcset` with width parameters (Shopify only)
- Applies correct `sizes` attribute for responsive sizing
- Optimizes bandwidth (mobile downloads ~330px, desktop ~1440px)

**Usage**:
```tsx
import ResponsiveImage from "@/components/ui/responsive-image";

export function ProductCard({ product }: { product: DisplayProduct }) {
  return (
    <ResponsiveImage
      src={product.variations[0]?.images[0]}  // Works with static OR Shopify URLs
      alt={product.name}
      layout="product-hero"  // Preset: (min-width: 1200px) 1066px, (min-width: 768px) calc((100vw - 48px) / 2), ...
      className="rounded-lg"  // Optional Tailwind classes
    />
  );
}
```

### Shopify Image URL Format

Shopify CDN automatically optimizes images. Append `?width=X` to get specific sizes:

```
Base: https://cdn.shopify.com/.../product.jpg?v=1234567890
330px: https://cdn.shopify.com/.../product.jpg?v=1234567890&width=330
720px: https://cdn.shopify.com/.../product.jpg?v=1234567890&width=720
1440px: https://cdn.shopify.com/.../product.jpg?v=1234567890&width=1440
```

### Image srcset + sizes Pattern

ResponsiveImage generates this automatically for Shopify URLs:

```tsx
<img
  src="https://cdn.shopify.com/.../product.jpg?v=123&width=1066"
  srcSet="
    https://cdn.shopify.com/.../product.jpg?v=123&width=330 165w,
    https://cdn.shopify.com/.../product.jpg?v=123&width=720 360w,
    https://cdn.shopify.com/.../product.jpg?v=123&width=1066 533w,
    https://cdn.shopify.com/.../product.jpg?v=123&width=1440 720w,
    https://cdn.shopify.com/.../product.jpg?v=123&width=1880 940w
  "
  sizes="(min-width: 1200px) 1066px, (min-width: 768px) calc((100vw - 48px) / 2), calc((100vw - 32px) / 2)"
  alt="Product name"
/>
```

### Image Optimization Benefits

- ✅ Automatic compression by Shopify CDN
- ✅ Responsive sizing (smaller files on mobile)
- ✅ Global CDN distribution (fast delivery)
- ✅ WebP format support (fallback to JPG)
- ✅ Mobile devices save bandwidth (~50KB vs ~200KB on desktop)

---

## When to Update This File

If you discover new patterns, refactor a layout component, or establish better practices:
1. Update the relevant section in this file
2. Add examples if helpful
3. Note the reason for the change in a comment
4. Commit with message: `docs: update styling conventions for {feature}`
