---
name: Turath Collective Project Guidelines
description: "Workspace-level instructions for the Turath Collective ecommerce website. Use when: working on any file in this project, implementing features, or making architecture decisions."
---

# Turath Collective Website – Project Guidelines

## Project Overview

**Turath Collective** is a luxury ecommerce website showcasing heritage products. Built with React (Vite) + TypeScript, Tailwind CSS v4, Shopify integration, Drizzle ORM, and i18n support (English, French, Arabic).

- **Frontend**: React + TypeScript, Vite, Tailwind CSS v4
- **Backend**: Node.js with Express, Drizzle ORM (SQLite/PostgreSQL)
- **Ecommerce**: Shopify Headless (Storefront API) for products & payments
- **Localization**: i18n (en, fr, ar) with dynamic locale switching
- **Deployment**: Vercel (frontend), custom Node.js server (backend)

## 🎯 Core Principle: Shopify Headless First

**Everything eventually flows from Shopify Admin.**

All components, data structures, and content must be designed to seamlessly accept **Shopify GraphQL Storefront API responses**. Build with the assumption that static assets and mock data are **temporary**—they will be replaced with live Shopify data.

### What This Means
- ✅ Components accept **pre-normalized data** from Shopify
- ✅ Images use **responsive URLs** compatible with Shopify CDN (`cdn.shopify.com`)
- ✅ Product fields **match Shopify schema** (variants, metafields, collections)
- ✅ No hardcoded product data in components
- ✅ Fallback gracefully when Shopify API is unavailable
- ❌ Never make API calls inside components (API layer only)
- ❌ Never hardcode product names, descriptions, or prices

See [shopify-integration.instructions.md](.github/instructions/shopify-integration.instructions.md) for detailed patterns and examples.

## Tech Stack

| Layer | Tech | Version | Notes |
|-------|------|---------|-------|
| Build | Vite | Latest | Fast dev/build, ESM-first |
| Framework | React | 18+ | TypeScript strict mode |
| Styling | Tailwind CSS | v4 | Custom CSS variable color system |
| UI Components | shadcn/ui | Custom fork | Located in `client/src/components/ui/` |
| Database | Drizzle ORM | Latest | Type-safe SQL queries |
| Server | Express | Latest | Node.js HTTP API layer |
| Internationalization | i18n | Custom | 3 languages: en, fr, ar |
| Testing | Vitest | (if used) | Recommended for unit tests |

## Styling Conventions

### Tailwind CSS v4 Setup
- Pure utility-first approach, no CSS modules
- Custom color variables defined in `client/src/index.css` (CSS variables bound to Tailwind)
- PostCSS + Autoprefixer for cross-browser compatibility
- All colors meet WCAG AAA contrast standards

### Color Palette
```css
/* Primary Brand Colors */
--color-primary: #3A0606 (Maroon) /* hsl(0 81% 13%) */
--color-secondary: #262C1B (Forest Green) /* hsl(82 24% 14%) */
--color-background: #FAF9F6 (Cream) /* hsl(40 17% 97%) */

/* Neutral tones, surface colors, accents defined in index.css */
```

### Typography
- **Headings**: PlayfairDisplay (serif) – elegant, luxe aesthetic
- **Body/UI**: Comfortaa (sans-serif) – friendly, readable

### Responsive Breakpoints

| Prefix | Width | Usage |
|--------|-------|-------|
| (none) | Mobile first | Default styles |
| `md:` | 768px | Tablets, small laptops |
| `lg:` | 1024px | Desktop |
| `xl:` | 1280px | Large desktop (less common) |

**Pattern**: Mobile-first utility structure. Define base behavior, then override with `md:`, `lg:`, `xl:` variants.

### Spacing Scale
| Class | Size | Usage |
|-------|------|-------|
| `gap-4`, `px-4` | 16px | Tight spacing |
| `gap-6`, `px-6` | 24px | Standard padding |
| `gap-8` | 32px | Medium sections |
| `gap-12` | 48px | Large components |
| `gap-20` | 80px | Extra-large section breaks |
| `pt-36` | 144px | Page top padding |
| `pb-24` | 96px | Page bottom padding |

## File Structure & Organization

```
client/
├── src/
│   ├── components/
│   │   ├── ui/              # shadcn/ui & primitive UI components
│   │   ├── feature/         # Feature-specific components (headers, grids, etc.)
│   │   ├── PageLayout.tsx   # Main wrapper for all pages (navbar + footer + content)
│   │   └── ...
│   ├── pages/               # Full-page components (home, shop, product, etc.)
│   ├── context/             # React Context (cart, auth, theme)
│   ├── hooks/               # Custom hooks (useAuth, useMobile, useToast, etc.)
│   ├── lib/                 # Utilities (analytics, i18n, Shopify client, query client)
│   ├── locales/             # i18n translation files (ar/, en/, fr/)
│   └── assets/              # Images, icons, static files

server/
├── index.ts                 # Express server entry
├── routes.ts                # API route definitions
├── auth.ts                  # Authentication logic
├── db.ts                    # Drizzle ORM setup
├── email.ts                 # Email service
└── ...

shared/
└── schema.ts                # Shared types/schemas across client & server
```

## Naming Conventions

### Components
- **UI Components**: Lowercase with hyphens – `button.tsx`, `card.tsx`, `product-grid.tsx`
- **Page Components**: PascalCase – `Home.tsx`, `Shop.tsx`, `ProductDetail.tsx`
- **Feature Components**: PascalCase – `Navbar.tsx`, `Footer.tsx`, `HeroSection.tsx`

### CSS Classes
- Use Tailwind utilities; no custom class names unless absolutely necessary
- If custom classes needed, prefix with project initials: `.tc-{name}`

### Variables & Functions
- Use camelCase for functions, variables, and properties
- Use PascalCase for React components and type definitions

## Common Patterns

### Layout Pattern (Pages)
All pages wrap with `PageLayout` from `client/src/components/PageLayout.tsx`:
```tsx
import PageLayout from "@/components/PageLayout";

export default function MyPage() {
  return (
    <PageLayout>
      {/* Page content here – navbar/footer auto-included */}
    </PageLayout>
  );
}
```

### Responsive Container Pattern
Pages use the standard responsive container:
```tsx
<div className="container mx-auto px-6 md:px-12 max-w-[1820px]">
  {/* Content – centered, max 1820px on desktop */}
</div>
```

### Grid Layouts
- Product grids: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`
- Feature grids: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3` (varies by content)

### i18n Usage
```tsx
import { useTranslation } from "react-i18next";

export default function MyComponent() {
  const { t } = useTranslation();
  return <h1>{t("myKey")}</h1>;
}
```

### Hooks Usage
Common hooks:
- `useAuth()` – Get current user, authentication state
- `useMobile()` – Detect mobile breakpoint (768px)
- `useToast()` – Show toast notifications
- `useReducedMotion()` – Respect prefers-reduced-motion

## Anti-Patterns (Avoid)

1. **Don't hardcode colors** – Use Tailwind color classes or CSS variables
2. **Don't use px-3, px-5, px-8** – Use the spacing scale (px-4, px-6, px-12, etc.)
3. **Don't create new breakpoint variants** – Stick to md/lg/xl
4. **Don't mix styled-components or CSS modules** – Stay pure Tailwind
5. **Don't hardcode pixel widths** – Use Tailwind responsive classes & max-w utilities
6. **Don't skip TypeScript types** – Always type props, returns, contexts

## When Making Changes

**Update `.github/instructions/` files** with discoveries or new patterns:
- If you refactor a component pattern and find a better approach, document it in `components.instructions.md`
- If you add new styling conventions, update `styling.instructions.md`
- If you discover new setup steps or dependencies, update `setup.instructions.md`

This keeps the project documentation evergreen and helps future sessions understand the codebase better.

## Key Resources

- **Tailwind Docs**: https://tailwindcss.com/docs
- **shadcn/ui**: https://ui.shadcn.com/
- **React i18next**: https://react.i18next.com/
- **Drizzle ORM**: https://orm.drizzle.team/
- **Vite**: https://vitejs.dev/
