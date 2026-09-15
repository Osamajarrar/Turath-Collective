# Plan 06 — Design & consistency pass (findings + fix list)

Survey completed 2026-07-07 against the design guide (quiet/editorial tone, no overclaiming,
theme-token consistency). Findings verified with file:line references. Grouped into three
suggested PRs so each stays reviewable.

## PR A — `fix/design-tokens-and-copy` (live pages only; safe, high value)

### Copy/tone fixes
1. `client/src/pages/product.tsx:775` — badge says **"Top Rated"**: implies a rating system that
   doesn't exist (fake social proof). Change to the existing `shop.badges.bestSeller` key
   ("Best Seller"), which is true (curator's designation).
2. `client/src/pages/product.tsx:913` — care accordion hardcodes *"Ships from Montreal in 2–3
   business days. Free shipping on orders above $100 CAD."* — contradicts the shipping policy
   (5–10 days, no threshold mentioned) and FAQ. Replace the sentence with a link to `/shipping`
   ("See shipping & returns") so shipping facts live in exactly one place. (Cross-ref Plan 02 E.)
3. `client/src/locales/en/pages.json` — orphaned `about.collections.*` keys (unused by about.tsx)
   include "center of ceramic artistry for over five hundred years", contradicting the live FAQ's
   "over 2,000 years of continuous pottery tradition". Delete the orphaned keys; fact-check the
   2,000-year claim (Hebron's pottery/glass tradition is commonly dated centuries, not millennia
   — safer: "a craft tradition passed down for generations"). Never keep two different numbers.
4. Tone outliers in `pages.json` about-block: "extraordinary precision" (line ~7) and "a legacy
   that the world cannot afford to lose" (line ~41) — soften to the page's otherwise restrained
   voice, e.g. "…who have inherited generations of skill" / "a heritage worth keeping alive".
5. `story-section` stat2 inversion (`pages.json` story.stats.stat2): value/label are swapped
   versus stat1's big-number-over-small-label pattern — "Curated in" renders huge, "Montreal"
   tiny. Swap: `value: "Montreal"`, `label: "Curated in"` (FR/AR equivalents too).
6. Mock-data descriptions in `product.tsx` ("an heirloom in the making", "timeless") — cliché
   marketing adjectives; low priority (mock-only), tidy if touched.

### Theme-token fixes (all mechanical)
- `hero.tsx:38` `text-black` → `text-foreground` (only heading in the app off-token).
- `review-carousel.tsx:29`, `social-proof.tsx:29` `bg-white` → `bg-background`.
- `social-proof.tsx:122` inline `style={{ color: "hsl(0 81% 13%)" }}` → token class.
- `contact.tsx:137` `bg-white` → `bg-background`/`bg-card`; `contact.tsx:149,163,175,188`
  `placeholder:text-gray-450` is not a real Tailwind color (silently no-ops) →
  `placeholder:text-muted-foreground`.
- `PrivacyPolicy.tsx` hardcoded `#C9A96E` gold → primary/accent token (see Plan 02 B).
- `hero.tsx:53-58` — delete dead commented-out "Watch Our Story" button.

### i18n consistency on the live product page
- `product.tsx:869,997` "Add to Bag"/"Already in Bag" hardcoded → existing `commerce.json`
  `product.addToBag` keys; `product.tsx:951-957` "The Collection" / "You May Also Love" /
  Hebron subtitle hardcoded → add keys. (EN/FR/AR.)

## PR B — decide the fate of the four unrouted pages (needs a founder decision)

`checkout.tsx`, `login.tsx`, `signup.tsx`, `forgot-password.tsx` are **not routed in App.tsx**
(dead pages) but still ship in the bundle. They hardcode `bg-[#FDFCFB]`, `bg-white`, raw hex
Stripe/Apple-Pay button colors, English-only strings, duplicated headers/footers, and
`checkout.tsx` contains a fully fake hardcoded cart. Auth is deferred to a future launch
(MVP_LAUNCH_CHECKLIST), so:
- **Recommend**: delete `checkout.tsx` outright (real checkout is Shopify's; this page misleads);
  move login/signup/forgot-password out of the bundle or leave them but file them under the
  deferred-auth scaffolding explicitly (header comment + note in AGENTS.md). If kept, they do NOT
  need the token/i18n polish until they're routed.
- Also: `product.tsx:307` "Notify Me" flow ends in `console.log` — either hide the Bell control
  until a backend exists or persist requests somewhere real. A customer who taps it believes
  they've subscribed. (Same honesty class as Plan 02 A2.)

## PR C — small a11y pass

- `checkout.tsx:133` `alt="Product"` (moot if page deleted).
- `collection-cards.tsx:29-49` coming-soon tile: image has no descriptive text for screen
  readers; add `sr-only` description or confirm the adjacent text suffices.
- `review-carousel.tsx:78-83` dot buttons lack `aria-label` (compare story-section's dots which
  have them).
- Codebase is otherwise diligent (forms, cart drawer, swatches all labeled).

## Explicitly fine (checked, no action)

Footer, navbar, values-section, heritage, newsletter, shop, care, FAQ pages: consistent
typography (`text-[10px] font-bold uppercase tracking-[0.2em]` labels, `font-serif` headings),
token colors, quiet tone. `// @replit` comments in `ui/button.tsx`/`ui/badge.tsx` are invisible
to users — strip in the Plan 04 cleanup, not here.

## Model recommendation

**Split**: PR A is fully specified above — cheap/fast model fine (mechanical edits + provided
copy). PR B needs the founder's call first, then cheap execution. The Hebron fact-check (A.3)
needs a human or a strong model with web search — do not let any model invent a new number.
