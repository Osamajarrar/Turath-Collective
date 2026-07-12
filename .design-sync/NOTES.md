# design-sync notes — Turath Collective

This repo is a **Vite + Express app**, not a component-library package, so the sync bundles components directly from source (synth entry + `componentSrcMap`). Key wiring:

- **Bundle entry** is a generated barrel `.design-sync/ds-entry.mjs` (built by `.ds-sync/gen-barrel.mjs`). It re-exports every component as a NAMED export (defaults aliased) and imports `client/src/lib/i18n` as a side-effect so `useTranslation` gets real translations. Regenerate with `node .ds-sync/gen-barrel.mjs` if components are added/removed, then rebuild.
- **`globalName`: `Turath`**; components import in previews from `"turath-collective"` (shimmed to `window.Turath`).
- **CSS** is a Tailwind v4 build of `client/src/index.css` → `.design-sync/.cache/ds-tailwind.css` (`cfg.cssEntry`), with a Google-Fonts `@import` prepended (Comfortaa + Playfair Display load remotely → `[FONT_REMOTE]`, expected). Regenerate: `./.ds-sync/node_modules/.bin/tailwindcss -i client/src/index.css -o .design-sync/.cache/ds-tailwind.raw.css` then prepend the fonts `@import`. `.cache/` is gitignored, so this must be regenerated on a fresh clone before building.
- **`cfg.tsconfig` = `.design-sync/tsconfig.build.json`** — self-contained (the esbuild paths plugin does NOT follow `extends`). It maps `@/`, `@shared/`, and stubs all `client/src/assets/*` images/video to `.design-sync/asset-stub.ts` (a neutral "Turath" placeholder). This is deliberate: real media (37 MB of PNGs + an MP4) would blow past the 12 MB upload limit and a design system supplies its own imagery. Regenerate the image map if assets change (see the node one-liner that built it).
- **`cfg.provider` = `DsProvider`** (`.design-sync/preview-providers.tsx`) wraps previews in QueryClient + Cart + Tooltip providers so connected components (e.g. `Navbar`) render.
- **Playwright**: render check needs playwright **1.61.0** (matches the cached chromium build 1228). Installed into `.ds-sync`.

## Excluded / floor-card components
- **`sonner`** dropped from the barrel (collided with `toaster` on the `Toaster` global). `toaster.tsx` is the canonical `Toaster`.
- **`LogoNew`** excluded (`componentSrcMap: null`) — experimental duplicate of `Logo` that renders a broken image.
- **Floor cards (behavioral/gated, render empty by design):** `ScrollToTop` (returns null), `Sidebar` (needs SidebarProvider), `Toast`/`Toaster` (imperative), `ReviewCarousel`/`SocialProof` (**gated behind `VITE_SHOW_PLACEHOLDER_CONTENT`** — render null in a normal build; do NOT enable that flag to "fix" them).

## Known render warns (triaged — not new)
- The 6 **animated page sections** — `Hero`, `Heritage`, `CollectionCards`, `StorySection`, `StoryCarousel`, `ValuesSection` — use framer-motion `whileInView` scroll-reveal. They render **full content in the live app** (and in the full-html render check) but come up **blank in the isolated `?story` grading capture** (the IntersectionObserver never fires). They are intentionally left as **floor cards** (which render the real component), NOT authored previews. If a future run authors previews for them, expect blank grading screenshots — that's the capture artifact, not a defect.
- `[FONT_REMOTE]` for Comfortaa / Playfair Display is expected (fonts load from Google Fonts at runtime).

## Re-sync risks
- **`.design-sync/.cache/ds-tailwind.css` is gitignored and must be regenerated** before every build (it's `cfg.cssEntry`). If missing, styling disappears. Regen steps above.
- The **asset image stub list** in `tsconfig.build.json` is enumerated per-file; new images under `client/src/assets/` won't be stubbed automatically and will either bloat the bundle (png→dataurl) or fail the build (jpg/mp4/webp — no loader). Re-run the image-map generator when assets change.
- Component previews import from the bare `"turath-collective"` specifier (shimmed). This is not a real npm package — it only resolves inside the design-sync preview build.
