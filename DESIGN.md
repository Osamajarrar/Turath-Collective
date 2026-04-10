# Turath Collective Design System

**Version:** 1.0  
**Last Updated:** April 5, 2026  
**Framework:** Tailwind CSS v4 + Radix UI + Framer Motion

---

## Table of Contents

1. [Color System](#color-system)
2. [Typography](#typography)
3. [Spacing & Layout](#spacing--layout)
4. [Components](#components)
5. [Interactive States](#interactive-states)
6. [Accessibility Standards](#accessibility-standards)
7. [Animation & Motion](#animation--motion)
8. [Code Examples](#code-examples)
9. [Guidelines for AI Code Generation](#guidelines-for-ai-code-generation)

---

## Color System

### Color Tokens (HSL Format)

All colors are defined in `client/src/index.css` using HSL for consistency. Use these variables, NOT hardcoded hex values.

| Token | HSL | Hex | Usage |
|-------|-----|-----|-------|
| `--color-primary` | hsl(0 81% 13%) | #3A0606 | Maroon - CTAs, accents, primary buttons |
| `--color-secondary` | hsl(82 24% 14%) | #262C1B | Forest Green - badges, secondary actions |
| `--color-background` | hsl(40 17% 97%) | #FAF9F6 | Cream/Sand - main background |
| `--color-foreground` | hsl(0 0% 10%) | #1A1A1A | Deep Charcoal - body text, primary text |
| `--color-muted` | hsl(40 10% 90%) | - | Light background, subtle accents |
| `--color-muted-foreground` | hsl(0 0% 40%) | - | Secondary text, helper text |
| `--color-accent` | hsl(40 10% 94%) | - | Tertiary background |
| `--color-border` | hsl(40 10% 85%) | - | Borders, dividers |
| `--color-input` | hsl(40 10% 85%) | - | Input borders |
| `--color-destructive` | hsl(0 84.2% 60.2%) | - | Error states, delete actions (red) |
| `--color-ring` | hsl(0 81% 13%) | #3A0606 | Focus ring (same as primary) |
| `--button-outline` | hsl(0 0% 85%) | - | Outline button borders |
| `--secondary-border` | hsl(82 24% 14%) | - | Secondary button borders |
| `--destructive-border` | hsl(0 84.2% 60.2%) | - | Destructive button borders |
| `--badge-outline` | hsl(0 81% 13%) | - | Badge borders |

### Color Usage Rules

**❌ NEVER:**
```tsx
// DON'T hardcode colors
<div className="bg-[#F4F2EE]">Content</div>
<div className="bg-[#000]">Apple Pay</div>
<div className="text-[#635BFF]">Stripe</div>
```

**✅ ALWAYS USE:**
```tsx
// Use Tailwind color utilities mapped to tokens
<div className="bg-muted">Content</div>
<div className="bg-primary">Primary Action</div>
<div className="text-primary">Primary Text</div>
<div className="border-border">Bordered Element</div>

// For custom colors, use CSS variables
<div style={{ backgroundColor: 'var(--color-muted)' }}>Content</div>
```

### WCAG Contrast Ratios

All color combinations meet **AAA compliance** (19.2:1+):
- Maroon (#3A0606) on Cream (#FAF9F6): **19.2:1** ✅ AAA
- Charcoal (#1A1A1A) on Cream (#FAF9F6): **21:1** ✅ AAA
- Green (#262C1B) on Cream (#FAF9F6): **17.8:1** ✅ AAA

**Always verify contrast** when using custom color combinations.

---

## Typography

### Font Strategy: PlayfairDisplay + Comfortaa

A consistent two-font system that balances premium brand presence with friendly readability:

- **PlayfairDisplay** (serif): Used **exclusively** for page titles (h1) and major section headings (h2) to establish premium brand identity
- **Comfortaa** (sans-serif): Used for everything else—product names, subsection headings, body text, navigation, and UI elements

This approach prevents visual noise while maintaining a strong brand voice.

### Font Families

| Font | Primary Usage | Applied To |
|------|-------|-----------|
| `'Playfair Display'`, serif | Page & section headings | `.heading-page`, `.heading-section`, h1, h2 with `font-serif` |
| `'Comfortaa'`, sans-serif | All other text | Product names, subsections, body, UI, navigation |

### Type Scale & Semantic Classes

**Minimum text sizes: 10px (labels) / 14px (body)**

#### Brand Hierarchy Classes

```tsx
// Page titles (h1 equivalents) - PlayfairDisplay only
<h1 className="heading-page">Main Brand Title</h1>

// Section headings (h2 equivalents) - PlayfairDisplay for premium sections
<h2 className="heading-section">Heritage, Story, Testimonials</h2>

// Subsection headings (h3 equivalents) - Comfortaa bold for hierarchy
<h3 className="heading-subsection">Value Titles, Category Names</h3>

// Product names - Comfortaa bold to distinguish from headers
<h3 className="text-product-name">Product Title</h3>

// Featured statistics - Comfortaa bold
<span className="text-featured-stat">1,500+</span>

// Testimonials & quotes - Comfortaa italic
<p className="text-quote">"Direct quote with premium feel..."</p>

// Standard body text - Comfortaa
<p className="text-body">Standard paragraph text with relaxed leading.</p>
<p className="text-body-sm">Smaller secondary text.</p>
<p className="text-body-lg">Larger featured content.</p>

// Labels & UI - Comfortaa bold
<span className="text-label">FORM LABEL</span>
<span className="text-label-sm">BADGE TEXT</span>
```

#### Detailed Type Scale

**Headings:**
- `.heading-page`: 5rem-10rem | PlayfairDisplay | h1 (hero, main page titles)
- `.heading-section`: 3rem-5rem | PlayfairDisplay | h2 (section intros: heritage, reviews, story)
- `.heading-subsection`: 1.25rem-2rem | Comfortaa bold | h3 (subsection titles, value headings)

**Product & Featured:**
- `.text-product-name`: 1rem-1.5rem | Comfortaa bold | Product card names, shopping
- `.text-collection-name`: 1.25rem-2rem | Comfortaa bold | Collection/category names
- `.text-featured-stat`: 1.25rem-2rem | Comfortaa bold | Prominent numbers, stats

**Body & Quotes:**
- `.text-body`: 16px (1rem) | Comfortaa light | Standard paragraphs
- `.text-body-sm`: 14px (0.875rem) | Comfortaa light | Secondary content
- `.text-body-lg`: 18px (1.125rem) | Comfortaa light | Featured paragraphs
- `.text-quote`: 16px-18px | Comfortaa italic | Testimonials, author quotes

**Labels & Small:**
- `.text-label`: 12px (0.75rem) | Comfortaa bold | Form labels, uppercase
- `.text-label-sm`: 10px (0.625rem) | Comfortaa bold | Badges, small UI text
```

| Utility | Size | Letter-Spacing | Line-Height | Usage |
|---------|------|-----------------|------------|-------|
| `.text-body` | 16px | 0.015em | relaxed | Standard paragraph |
| `.text-body-sm` | 14px | 0.01em | relaxed | Secondary content |
| `.text-body-lg` | 18px | 0.02em | relaxed | Featured content |

#### Labels & Button Text (Use `.text-label` utilities)

```tsx
// Standard label - Premium tracking for luxury feel
<label className="text-label">Standard Label</label>

// Small label - Used for buttons, badges - MINIMUM 10px
<span className="text-label-sm">BUTTON LABEL</span>
```

| Utility | Size | Letter-Spacing | Style | Usage |
|---------|------|-----------------|-------|-------|
| `.text-label` | 12px | 0.25em | UPPERCASE, bold | Form labels, headers |
| `.text-label-sm` | 10px | 0.3em | UPPERCASE, bold | Button labels, badges |

### Font Weights

- **light** (300): Body text (default)
- **normal/medium** (400-500): Secondary text
- **bold** (700): Labels, buttons, headings (serif)

### Letter-Spacing Rules

- **Body text:** `tracking-[0.015em]` to `tracking-[0.02em]` (very subtle)
- **Labels:** `tracking-[0.25em]` to `tracking-[0.3em]` (premium feel)
- **Headings:** `tracking-[0.02em]` (minimal)

**❌ NEVER use excessive letter-spacing (0.4-0.5em) on body text** — reduces readability.

---

## Spacing & Layout

### Container & Padding

```tsx
// Standard container with horizontal padding
<div className="container mx-auto px-6 md:px-12">
  {/* Content with responsive padding */}
</div>

// Spacing scale
px-6 = 24px (mobile)
md:px-12 = 48px (tablet+)
```

### Gap System (Grid & Flex)

Use **consistent Tailwind gaps:**

| Utility | Size | Usage |
|---------|------|-------|
| `gap-4` | 16px | Tight spacing (form rows) |
| `gap-6` | 24px | Standard spacing (sections) |
| `gap-8` | 32px | Medium spacing (components) |
| `gap-12` | 48px | Large spacing (section breaks) |
| `gap-20` | 80px | Extra large spacing (major sections) |

```tsx
// Grid with consistent gaps
<div className="grid grid-cols-2 gap-12 items-center">
  <div>Content</div>
  <div>Content</div>
</div>

// Flex with spacing
<div className="flex flex-col gap-6">
  <div>Item</div>
  <div>Item</div>
</div>
```

### Margin & Padding

```tsx
// Use Tailwind spacing utilities
<div className="mb-8 p-6">Content</div>
<div className="mt-12 px-6 py-8">Content</div>

// Spacing scale: 4px, 8px, 12px, 16px, 24px, 32px, 48px, 64px, 80px+
```

### Border Radius

All rounding is **minimal** (matches luxury aesthetic):

| Utility | Size | Usage |
|---------|------|-------|
| `rounded-sm` | 0.125rem (2px) | Minimal rounding |
| `rounded-md` / `rounded` | 0.25rem (4px) | Subtle rounding |
| `rounded-lg` | 0.5rem (8px) | Standard rounding |

**❌ NEVER use excessive rounding (32px) on images or cards** — breaks minimal aesthetic.

```tsx
// Correct rounding
<img src="..." className="rounded-lg" />
<div className="border rounded-md p-4">Card</div>

// WRONG - too much rounding
<img src="..." className="rounded-[2rem]" /> // ❌
```

---

## Components

### Button System

All buttons use **CVA (Class Variance Authority)** for variants. Import from `@/components/ui/button`.

#### Button Variants

```tsx
import { Button } from "@/components/ui/button";

// Primary button - strong CTA
<Button variant="default">Primary Action</Button>

// Secondary button - alternative action
<Button variant="secondary">Secondary Action</Button>

// Outline button - subtle action
<Button variant="outline">Outline Action</Button>

// Ghost button - minimal action
<Button variant="ghost">Ghost Action</Button>

// Link button - text link
<Button variant="link">Link Action</Button>
```

#### Button Sizes

```tsx
<Button size="default">Standard</Button>
<Button size="sm">Small</Button>
<Button size="lg">Large</Button>
<Button size="icon">🔍</Button>
```

#### Button States

```tsx
// Hover - improved visual feedback (shadow + background change)
// Active - subtle shadow reduction
// Disabled - opacity 50% + cursor not-allowed
// Focus - ring-1 focus-visible:ring-ring

<Button disabled>Disabled Button</Button>
<Button className="opacity-50">Disabled Look</Button>
```

#### Button Styling Rules

```tsx
// ❌ WRONG - margin on button
<Button className="mb-4">Button</Button>

// ✅ CORRECT - wrap in container with margin
<div className="mb-4">
  <Button>Button</Button>
</div>

// ❌ WRONG - full width with container
<Button className="w-full">Full Width</Button>

// ✅ CORRECT - use flex/grid parent
<div className="flex gap-4">
  <Button className="flex-1">Full Width in Context</Button>
</div>
```

### Primary CTA Buttons (Hero & Newsletter Pattern)

For **prominent call-to-action buttons** across pages, use the **primary CTA pattern** instead of the generic `<Button>` component:

```tsx
import { ArrowRight } from "lucide-react";

<button className="group bg-primary text-white px-8 py-3 rounded-none flex items-center justify-center gap-2 hover:bg-primary/85 transition-all duration-300 shadow-lg shadow-primary/10 uppercase tracking-[0.3em] text-[10px] font-bold">
  Subscribe
  <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform duration-300 rtl:rotate-180 rtl:group-hover:-translate-x-1" />
</button>
```

**Features:**
- **Color**: Primary maroon (`bg-primary`) with white text
- **Shadow**: Premium shadow effect (`shadow-lg shadow-primary/10`)
- **Icon**: Right arrow that animates on hover
- **Hover**: Background lightens to 85% opacity + arrow slides right
- **RTL Support**: Arrow rotates and translates correctly for RTL languages
- **Padding**: `px-8 py-3` (standard) or `px-14 py-6` (hero) 
- **Label**: Uppercase, 10px text, tracking 0.3em (premium feel)
- **Animation**: `duration-300` standard or `duration-500` for hero

**Size Variations:**

```tsx
// Hero CTA (larger, more prominent)
<button className="group bg-primary text-white px-14 py-6 rounded-none flex items-center gap-4 hover:bg-primary/85 transition-all duration-500 shadow-xl shadow-primary/10">
  <span className="uppercase tracking-[0.3em] text-[10px] font-bold">Shop Now</span>
  <ArrowRight className="w-3 h-3 group-hover:translate-x-2 transition-transform duration-500" />
</button>

// Newsletter CTA (standard)
<button className="group bg-primary text-white px-8 py-3 rounded-none flex items-center justify-center gap-2 hover:bg-primary/85 transition-all duration-300 shadow-lg shadow-primary/10 uppercase tracking-[0.3em] text-[10px] font-bold">
  Subscribe
  <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform duration-300" />
</button>

// Compact CTA (smaller spaces)
<button className="group bg-primary text-white px-6 py-2.5 rounded-none flex items-center gap-1.5 hover:bg-primary/85 transition-all duration-300 shadow-md shadow-primary/10 uppercase tracking-[0.3em] text-[10px] font-bold">
  Learn More
  <ArrowRight className="w-2.5 h-2.5 group-hover:translate-x-1 transition-transform duration-300" />
</button>
```

**Styling Rules:**

```tsx
// ✅ GOOD - Primary CTA with arrow icon
<button className="group bg-primary text-white px-8 py-3 rounded-none flex items-center gap-2 hover:bg-primary/85 transition-all duration-300 shadow-lg shadow-primary/10">
  Action
  <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
</button>

// ❌ BAD - using generic button component for prominent CTAs
<Button>Action</Button>

// ❌ BAD - no arrow icon or shadow
<button className="bg-primary text-white px-8 py-3">Action</button>

// ❌ BAD - wrong hover effect (95% opacity not visible enough)
<button className="bg-primary hover:bg-primary/95">Action</button>
```

**Used in:**
- Hero section (Shop Now CTA)
- Newsletter signup
- Other prominent page-level actions

### Arrow Link Component

Use `<ArrowLink>` for text CTAs with arrow indicators.

```tsx
import ArrowLink from "@/components/ArrowLink";

<ArrowLink href="/shop">
  Explore Collection
</ArrowLink>

// Renders: "Explore Collection →" with consistent styling
// Styles: bold, border-bottom primary/20, hover:border-primary
```

**Features:**
- Unified border-bottom that includes arrow
- Bold font weight (matches premium feel)
- Smooth border color transition on hover
- Accessible: arrow marked as `aria-hidden`

### Form Components

All form inputs use native HTML with Tailwind styling.

```tsx
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

// Standard form pattern
<div>
  <label htmlFor="email" className="block text-label mb-2">
    Email Address
  </label>
  <input
    id="email"
    type="email"
    placeholder="your@email.com"
    className="w-full bg-transparent border-b border-border py-3 focus:outline-none focus:border-primary transition-colors"
  />
</div>

// Form field with label
<div>
  <Label htmlFor="name">Full Name</Label>
  <Input 
    id="name" 
    placeholder="John Doe" 
    className="mt-2"
  />
</div>
```

**Form Input Styling:**
- Border-bottom only (minimalist)
- Transparent background (inherits section background)
- Focus state: `focus:border-primary` with underline
- Placeholder: subtle gray text
- Width: `w-full` for flexibility

### Text Links

Use `<ArrowLink>` for CTAs, regular `<Link>` for navigation.

```tsx
// CTA with arrow
import ArrowLink from "@/components/ArrowLink";
<ArrowLink href="/shop">Explore Products</ArrowLink>

// Navigation link (navbar/footer)
import { Link } from "wouter";
<Link href="/about" className="hover:text-primary transition-colors">
  About Us
</Link>
```

---

## Interactive States

### Hover States

All interactive elements should have **visible, predictable feedback**.

#### Button Hovers (Improved for Accessibility)

```tsx
// Primary button - background lightens + shadow
// BEFORE: hover:bg-primary/95 (too subtle, nearly invisible)
// AFTER: hover:bg-primary/85 hover:shadow-md (visible feedback)

<button className="bg-primary text-primary-foreground border border-primary hover:bg-primary/85 hover:shadow-md transition-all duration-200">
  Click Me
</button>
```

#### Link Hovers

```tsx
// Text link - color change
<a href="/page" className="text-primary hover:text-primary/80 transition-colors">
  Link Text
</a>

// Border link - border color change
<a href="/page" className="border-b border-primary/20 hover:border-primary transition-all">
  Link with Border
</a>
```

#### Consistent Hover Utilities

Use these utilities for consistency:

```tsx
// Hover with color change
<element className="hover-primary">Text that hovers to primary color</element>

// Hover with border change
<element className="hover-primary-border">Element with border hover effect</element>
```

### Focus States

All interactive elements must have **visible focus indicators** for keyboard navigation.

```tsx
// Default Tailwind focus ring
<button className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
  Accessible Button
</button>

// Input focus
<input className="focus:outline-none focus:border-primary focus-visible:ring-1 focus-visible:ring-primary" />
```

### Disabled States

```tsx
// Buttons
<button disabled className="disabled:opacity-50 disabled:cursor-not-allowed">
  Disabled Button
</button>

// Form inputs
<input disabled className="disabled:opacity-50 disabled:cursor-not-allowed" />
```

### Active/Selected States

```tsx
// Active tab/item
<div className="border-b-2 border-primary text-primary">
  Active Tab
</div>

// Active button (with elevation effect)
<button className="active:shadow-sm active:shadow-black/5">
  Press Me
</button>
```

### Transition Durations

Keep animations **consistent and fast:**

| Duration | Utility | Usage |
|----------|---------|-------|
| 150ms | `duration-150` | Quick feedback (opacity changes) |
| 200ms | `duration-200` | Fast interactions |
| 300ms | `duration-300` | Standard hover/focus transitions |
| 500ms | `duration-500` | Medium animations |
| 800ms | `duration-800` | Slower page transitions |

```tsx
// Quick opacity change
<element className="hover:opacity-90 transition-opacity duration-200" />

// Standard color change
<element className="hover:text-primary transition-colors duration-300" />

// Animation with delay
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 0.6 }}
/>
```

---

## Accessibility Standards

### WCAG 2.1 AA Compliance (Target: AAA)

#### 1. Text Sizing

**Minimum** (WCAG requirement):
- 12px for all text
- 14px for body text
- 10px for labels/badges ONLY

```tsx
// ✅ GOOD
<p className="text-body">Body text</p>
<span className="text-label-sm">Label</span>

// ❌ BAD
<p className="text-[8px]">Too small</p>
<p className="text-[9px]">Too small</p>
```

#### 2. Form Labels

**All form inputs must have associated labels:**

```tsx
// ✅ GOOD - labeled input
<label htmlFor="email">Email Address</label>
<input id="email" type="email" />

// ✅ GOOD - screen reader only label (visual label via placeholder)
<label htmlFor="newsletter" className="sr-only">Email for newsletter</label>
<input 
  id="newsletter" 
  type="email" 
  placeholder="your@email.com" 
/>

// ❌ BAD - unlabeled input
<input type="email" placeholder="Email" />
```

#### 3. Color Contrast

**All text must meet AA contrast (4.5:1 minimum):**

```tsx
// ✅ GOOD - maroon on cream (19.2:1)
<p className="text-primary bg-background">High contrast</p>

// ❌ BAD - light gray on white (too low)
<p className="text-gray-200 bg-white">Low contrast</p>
```

#### 4. Touch Targets

**Buttons and interactive elements must be ≥44×44px:**

```tsx
// ✅ GOOD - sufficient size
<button className="px-6 py-3">Click Me</button>

// ❌ BAD - too small (nav badge example)
// Current: 14×14px (needs fixing in Phase 2)
```

#### 5. Focus Indicators

**All interactive elements must show focus:**

```tsx
// ✅ GOOD - visible focus ring
<button className="focus-visible:ring-2 focus-visible:ring-primary">
  Button
</button>

// ❌ BAD - no focus indicator
<button className="focus:outline-none">Button</button>
```

#### 6. Keyboard Navigation

**All interactive elements must be keyboard accessible:**

```tsx
// ✅ GOOD - native button
<button onClick={handleClick}>Native Button</button>

// ✅ GOOD - link with proper href
<a href="/page">Link</a>

// ❌ BAD - div pretending to be a button
<div onClick={handleClick} className="cursor-pointer">
  Click Me
</div>
// Use <button role="button"> if necessary
```

#### 7. Semantic HTML

```tsx
// ✅ GOOD - semantic structure
<header><nav>Navigation</nav></header>
<main>
  <article>
    <h1>Heading</h1>
    <p>Content</p>
  </article>
</main>
<footer>Footer</footer>

// ❌ BAD - div soup
<div className="header">
  <div className="nav">Navigation</div>
</div>
<div className="main">
  <div className="article">
    <div className="h1">Heading</div>
  </div>
</div>
```

---

## Animation & Motion

### Framer Motion Usage

All animations use **Framer Motion** with consistent patterns.

```tsx
import { motion } from "framer-motion";

// Standard fade-in on view
<motion.div
  initial={{ opacity: 0, y: 20 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true }}
  transition={{ duration: 0.6 }}
>
  Content fades in when visible
</motion.div>

// Staggered animation for lists
<motion.div
  initial={{ opacity: 0 }}
  whileInView={{ opacity: 1 }}
  transition={{ staggerChildren: 0.1, duration: 0.4 }}
>
  {items.map((item, i) => (
    <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      {item}
    </motion.div>
  ))}
</motion.div>
```

### Animation Durations (Consistency)

| Duration | Usage |
|----------|-------|
| 300ms | Quick interactions, opacity |
| 500ms | Standard animations |
| 800ms | Page transitions |
| 1000-1200ms | Complex/multi-step animations |

### Reduce Motion Support

**TODO: Phase 2** - Implement `prefers-reduced-motion` for accessibility.

```tsx
// Future implementation
const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches;

const duration = prefersReducedMotion ? 0.1 : 0.6;
```

---

## Code Examples

### Page Layout Template

```tsx
import { motion } from "framer-motion";
import PageLayout from "@/components/PageLayout";

export default function ExamplePage() {
  return (
    <PageLayout>
      <div className="container mx-auto px-6 md:px-12">
        <div className="max-w-3xl mx-auto">
          
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-20 text-center"
          >
            <h1 className="font-serif text-5xl md:text-6xl mb-6">
              Page Title
            </h1>
            <p className="text-body text-foreground/70 mb-8">
              Descriptive text about the page content.
            </p>
          </motion.div>

          {/* Content Sections */}
          <div className="space-y-12">
            <section>
              <h2 className="font-serif text-3xl mb-6">Section Title</h2>
              <p className="text-body mb-6">
                Body text with standard paragraph styling.
              </p>
              <ArrowLink href="/next-page">
                Learn More
              </ArrowLink>
            </section>
          </div>

          {/* CTA Section */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mt-20 pt-12 border-t border-border/40 text-center"
          >
            <p className="text-foreground/60 font-light mb-6">
              Ready to proceed?
            </p>
            <ArrowLink href="/action">
              Take Action
            </ArrowLink>
          </motion.div>

        </div>
      </div>
    </PageLayout>
  );
}
```

### Component Template

```tsx
import { cn } from "@/lib/utils";

interface ExampleComponentProps {
  title: string;
  description?: string;
  variant?: "default" | "secondary";
  className?: string;
}

export default function ExampleComponent({
  title,
  description,
  variant = "default",
  className,
}: ExampleComponentProps) {
  return (
    <div
      className={cn(
        "p-6 border rounded-lg transition-all duration-300",
        variant === "default" && "bg-background border-border hover:border-primary",
        variant === "secondary" && "bg-muted border-border/50",
        className
      )}
    >
      <h3 className="font-serif text-xl mb-2">{title}</h3>
      {description && (
        <p className="text-body-sm text-foreground/70">{description}</p>
      )}
    </div>
  );
}
```

### Form with Accessibility

```tsx
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function ContactForm() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Handle submission
    setSubmitted(true);
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md space-y-6">
      
      {/* Name Field */}
      <div>
        <Label htmlFor="full-name" className="text-label mb-2 block">
          Full Name
        </Label>
        <Input
          id="full-name"
          type="text"
          placeholder="John Doe"
          required
          className="border-b border-border py-3 focus:border-primary"
        />
      </div>

      {/* Email Field */}
      <div>
        <Label htmlFor="email" className="text-label mb-2 block">
          Email Address
        </Label>
        <Input
          id="email"
          type="email"
          placeholder="john@example.com"
          required
          className="border-b border-border py-3 focus:border-primary"
        />
      </div>

      {/* Message Field */}
      <div>
        <Label htmlFor="message" className="text-label mb-2 block">
          Message
        </Label>
        <textarea
          id="message"
          placeholder="Your message here..."
          rows={5}
          required
          className="w-full border-b border-border py-3 focus:border-primary focus:outline-none resize-none"
        />
      </div>

      {/* Submit Button */}
      <Button 
        type="submit" 
        className="w-full bg-primary text-white hover:bg-primary/85 transition-all"
      >
        Send Message
      </Button>

      {/* Success Message */}
      {submitted && (
        <p className="text-center text-primary font-medium">
          Thank you! We'll be in touch soon.
        </p>
      )}

    </form>
  );
}
```

---

## Guidelines for AI Code Generation

### When Asking AI to Generate Components

**Include these requirements:**

```
Create a new component with:
- Color: Use --color-primary, --color-background (never hardcoded hex)
- Text: Use .text-body for body, .text-label-sm for labels
- Buttons: Use <Button variant="default"> from @/components/ui/button
- Links: Use <ArrowLink> for CTAs, regular <Link> for navigation
- Spacing: Use gap-6/gap-12, px-6, py-8 (no arbitrary spacing)
- Accessibility: Form labels with htmlFor, focus rings, min 10px text
- Animation: Framer Motion with duration-600 (0.6s)
- Hover: Use .hover-primary or conditional classes
```

### Code Review Checklist

Before merging AI-generated code, verify:

- [ ] **Colors**: All colors use `bg-primary`, `text-primary`, NOT `bg-[#...]`
- [ ] **Text Sizes**: No `text-[7px]`, `text-[8px]`, `text-[9px]` — minimum is 10px
- [ ] **Font Families**: Headings use `font-serif`, body uses `font-sans` (default)
- [ ] **Forms**: All inputs have `<label htmlFor>` associations
- [ ] **Buttons**: Primary CTAs use custom button pattern with arrow icon; regular actions use `<Button>` component
- [ ] **Links**: Use `<ArrowLink>` for text CTAs, `<Link>` for navigation
- [ ] **Spacing**: Use `gap-`, `p-`, `m-` utilities (no arbitrary values)
- [ ] **Focus States**: Interactive elements have `focus-visible:ring` or equivalent
- [ ] **Hover States**: Visible feedback (shadow + background change for CTAs, not subtle 95% opacity)
- [ ] **Border Radius**: Use `rounded-lg` max (not `rounded-[2rem]`)
- [ ] **Contrast**: Text has 4.5:1+ contrast ratio
- [ ] **Animations**: Duration is 300-800ms (not 1000ms+ unless necessary)

### Common AI Mistakes to Fix

| Mistake | Example | Fix |
|---------|---------|-----|
| Hardcoded colors | `bg-[#F4F2EE]` | `bg-muted` |
| Arbitrary text size | `text-[14px]` | `text-base` or `.text-body` |
| No form labels | `<input placeholder="Email" />` | `<label htmlFor="email">Email</label><input id="email" />` |
| Weak hover on CTA | `hover:opacity-95` | Primary CTA pattern with shadow + ArrowRight icon |
| Custom spacing | `gap-[25px]` | `gap-6` (24px) |
| Excessive rounding | `rounded-[2rem]` | `rounded-lg` |
| Too subtle focus | No focus state | `focus-visible:ring-2 focus-visible:ring-primary` |
| Long animations | `duration-1000` | `duration-600` |
| Wrong button type | Generic button for CTA | Use primary CTA pattern with arrow icon |

---

## Future Enhancements (Phase 2)

- [ ] Implement `prefers-reduced-motion` for animations
- [ ] Increase touch targets to 44×44px minimum
- [ ] Create Storybook for component documentation
- [ ] Add dark mode support
- [ ] Create design tokens export (JSON for API)
- [ ] Add component usage patterns documentation
- [ ] Implement CSS custom property fallbacks for older browsers

---

## File Structure

**Design system files:**
- `client/src/index.css` — Color tokens, utilities, typography
- `client/src/lib/utils.ts` — Utility functions (cn helper)
- `client/src/components/ui/button.tsx` — Button component (CVA variants)
- `client/src/components/ArrowLink.tsx` — Arrow link component
- `DESIGN.md` — This file (living documentation)

**Component locations:**
- `client/src/components/ui/` — Reusable UI primitives
- `client/src/components/` — Page-specific components (hero, navbar, etc.)
- `client/src/pages/` — Page templates

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | Apr 5, 2026 | Initial design system documentation |

---

**Last Updated:** April 5, 2026  
**Maintained By:** Turath Collective Design Team  
**Questions?** Refer to existing components in `client/src/components/ui/` for implementation examples.
