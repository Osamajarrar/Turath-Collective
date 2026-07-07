# AGENTS.md

Guide for AI coding agents working in this repository.

**Read `CLAUDE.md` — it is the canonical operating guide** (brand hard rules, honesty framework,
design guide, env vars, gotchas, branch/PR workflow). This file exists so agents that look for
the `AGENTS.md` convention find the same instructions.

Quick summary of the non-negotiables (full detail in `CLAUDE.md`):

1. Never push to `main` or `preview`. New branch from `main` → PR → human merges.
2. No music in any content; no founder-on-camera content.
3. Honesty framework: never fake reviews/testimonials/stats; distinguish historical objects from
   new objects made with traditional techniques; keep factual claims consistent across pages.
4. Theme tokens + i18n (EN/FR/AR) for all user-facing UI; quiet editorial copy, no hype.
5. `VITE_SHOW_PLACEHOLDER_CONTENT` must never be set in Vercel; `POSTHOG_API_KEY` is sensitive.
6. Deferred-v1 scaffolding (auth, contact/newsletter backends, buyNow) is intentional — neither
   delete it nor wire it live without being asked.

Architecture reference: `replit.md` (despite the name — it's the maintained architecture doc).
Launch state: `MVP_LAUNCH_CHECKLIST.md`. Implementation plans awaiting execution: `plans/`.
