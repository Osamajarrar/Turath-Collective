# Turath Collective — building with this design system

Turath Collective is a heritage-craft e‑commerce brand. The look is warm and editorial: a cream canvas, deep maroon and forest accents, serif display type over light sans body text. Build with the library's real components and style layout with **Tailwind utility classes bound to the brand tokens** — never invent hex values or ad‑hoc colors.

## Styling idiom: Tailwind v4 + semantic tokens

Style everything with Tailwind utilities that map to the design tokens (defined in the bound stylesheet, so they work out of the box). Use the **token utilities**, not raw colors:

| Purpose | Utilities |
|---|---|
| Surfaces | `bg-background` (cream), `bg-card`, `bg-muted`, `bg-accent` |
| Brand accents | `bg-primary` / `text-primary-foreground` (maroon), `bg-secondary` / `text-secondary-foreground` (forest green) |
| Text | `text-foreground`, `text-muted-foreground`, `text-primary` |
| Lines / states | `border-border`, `ring-ring`, `bg-destructive` |
| Radius | `rounded-md` (default), `rounded-lg` |

**Type:** `font-serif` = Playfair Display (all headings), `font-sans` = Comfortaa (body). Prefer the ready-made **semantic type classes** over raw sizes:
`heading-page`, `heading-section`, `heading-subsection`, `text-product-name`, `text-collection-name`, `text-featured-stat`, `text-quote`, `text-body` / `text-body-sm` / `text-body-lg`, and the uppercase eyebrow labels `text-label` / `text-label-sm`.

**Brand touches:** `hover-elevate` + `active-elevate-2` for interactive lift; `badge-product` for the darker-cream product badge. Uppercase, wide‑tracked labels (`text-label`) are a signature — use them for section eyebrows ("EXPLORE THE COLLECTIONS").

## Components

Import from the library and compose real parts (`Button`, `Badge`, `Input`, `Accordion`, `Sheet`, `DropdownMenu`, `SuggestedProductCard`, `Navbar`, `Footer`, …). `Button` variants: `default` (maroon), `secondary` (forest), `outline`, `ghost`, `destructive`, `link`; sizes `sm` / `default` / `lg` / `icon`. `Badge` variants: `default`, `secondary`, `destructive`, `outline`.

**Providers:** styling needs none (tokens live in the stylesheet). A few connected pieces need app context — `Navbar` reads a cart context, and `Tooltip`/`Sheet`/`DropdownMenu` want their Radix provider — but plain layout and the primitives do not.

## Where the truth lives

Read the bound stylesheet (`styles.css` and its `@import` closure, incl. `_ds_bundle.css`) for the full token + utility set, and each component's `.prompt.md` / `.d.ts` for its API. Match the existing components' density and idiom rather than restyling from scratch.

## Idiomatic snippet

```tsx
<section className="bg-background px-6 py-16">
  <p className="text-label text-primary">Explore the Collections</p>
  <h2 className="heading-section mt-3">Handmade in Montreal</h2>
  <p className="text-body mt-4 max-w-prose text-muted-foreground">
    Slow, intentional objects that carry the mark of the human hand.
  </p>
  <div className="mt-6 flex gap-3">
    <Button>Shop Ceramics</Button>
    <Button variant="secondary">Our Story</Button>
    <Badge variant="secondary">Made in Montreal</Badge>
  </div>
</section>
```
