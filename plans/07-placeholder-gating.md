# Plan 07 — Placeholder content gating (review-carousel / social-proof)

**Status: verified safe today; one consolidation decision recommended.**

## Findings (verified 2026-07-07)

- `client/src/pages/home.tsx` (both `main` and `feature/posthog-analytics`): `<ReviewCarousel />`
  and `<SocialProof />` are fully commented out (lines 21–22) with no imports — they cannot render.
- Repo-wide search confirms **no other render site** for either component.
- On `feature/posthog-analytics` (PR #5), both components additionally self-gate:
  `import.meta.env.VITE_SHOW_PLACEHOLDER_CONTENT === "true"` → return null otherwise. So after
  PR #5 merges there is defense-in-depth: commented out AND env-gated.
- `VITE_SHOW_PLACEHOLDER_CONTENT` is set only in `.env.local` (local dev). **It must never be set
  in Vercel** — re-confirm in the Vercel dashboard (it cannot be verified from the repo).
- The fake content itself still exists in the tree: reviewer quotes in
  `locales/en/common.json` (`reviewCarousel.reviews` — fabricated names/locations) and fake
  Instagram usernames hardcoded in `social-proof.tsx`. Acceptable while unrendered and gated,
  because these components are intentionally kept as scaffolding for real content later.

## Recommended follow-up (single small PR, after PR #5 merges)

1. Keep the components, keep the env gate — but make home.tsx use it instead of comments:
   restore the two imports/renders in `home.tsx` and let the components' internal
   `VITE_SHOW_PLACEHOLDER_CONTENT` gate decide. Comments rot; the env gate is explicit and
   already the documented mechanism. (Alternative: leave as-is; zero risk either way.)
2. Add a loud header comment to both components: `// PLACEHOLDER CONTENT — fake reviews/posts.
   Gated by VITE_SHOW_PLACEHOLDER_CONTENT. Replace with real data before ungating.`
3. When real reviews/Instagram content exist: replace the hardcoded arrays, drop the gate.
   (A real Instagram embed component is listed as a candidate future feature in
   MARKETING_STRATEGY.md.)
4. Delete the unused duplicate `story-carousel.tsx` (already in Plan 04 cleanup).

## Model recommendation

**Cheap/fast model is fine** — mechanical, fully specified, and the risky decision (never set the
env var in Vercel) is a dashboard check, not code.
