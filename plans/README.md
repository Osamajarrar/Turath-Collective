# Overnight session plans — 2026-07-07

Implementation plans produced in planning-only mode. Each file states what to change, which
files, the reasoning, concrete before/after copy where relevant, and whether a cheap/fast model
can execute it or a stronger model is needed.

| Plan | Topic | Status | Execution model |
|---|---|---|---|
| [01](01-posthog-capture-debug.md) | PostHog captures silently not firing | Code shipped in PR #5; dashboard investigation remains | Human (dashboard) + any model |
| [02](02-legal-pages-audit.md) | Legal pages: accuracy fixes + i18n refactor + replacement copy | Audit complete, fixes specified | Stronger model (copy/refactor); mechanical parts cheap |
| [03](03-cookie-consent-banner.md) | PIPEDA/Law 25 cookie consent banner | Fully specified; depends on PR #5 | Stronger model (consent-gating correctness) |
| [04](04-repo-cleanup.md) | Repo cleanup (`chore/repo-cleanup`) | Inventory verified | Cheap/fast model |
| [05](05-story-section-claims.md) | story-section unverified claims | Already resolved on main — verification record | None needed |
| [06](06-design-consistency-pass.md) | Design/tone/token consistency findings | Survey complete, fix list specified | Cheap for PR A; founder decision gates PR B |
| [07](07-placeholder-gating.md) | Placeholder review/social-proof gating | Verified safe; small consolidation suggested | Cheap/fast model |

Written directly (not planned): `MARKETING_STRATEGY.md`, `CLAUDE.md`, `AGENTS.md` (repo root).

Suggested execution order after review: 04 (cleanup) → 02 (legal) → 03 (consent, after PR #5
merges) → 06 PR A → 07. Plans 01 and 06 PR B need founder input first.
