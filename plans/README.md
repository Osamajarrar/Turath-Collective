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
| [10](10-cloudflare-migration.md) | Move hosting Vercel → Cloudflare Workers + D1 | Fully specified, not started | Stronger model (CSP/routing); phases 1 & 5–6 cheap |
| [09](09-mvp-demand-test.md) | MVP demand test: checkout intent, Resend, Sentry, tests | Fully specified, not started; copy decisions open | Stronger model (copy + CASL consent); tests cheap |
| [11](11-dev-backlog.md) | Dev backlog: the founder's item list → one branch each, ordered | Sequenced, not started | Per branch — see its table |

Architecture decisions and their rationale — including alternatives rejected — live in
[DECISIONS.md](DECISIONS.md) (session of 2026-07-31). Read it before executing 09 or 10.

Written directly (not planned): `MARKETING_STRATEGY.md`, `CLAUDE.md`, `AGENTS.md` (repo root).

Suggested execution order after review: 04 (cleanup) → 02 (legal) → 03 (consent, after PR #5
merges) → 06 PR A → 07. Plans 01 and 06 PR B need founder input first.

Revised 2026-07-31: **09 before 10** — the demand test answers whether there's a market; the
Cloudflare migration is infrastructure that doesn't move that question. 03 (consent) must account
for Sentry, added in 09.

Revised 2026-08-01: **[plan 11](11-dev-backlog.md) is the current execution order.** It slices the
founder's dev list into ten branches and supersedes the ordering above where they disagree — it
also overrides plan 03 §5 (consent is now a centered modal, not a bottom bar) and closes plan 09's
"reserve vs we'll tell you first" question in favour of notification-only.
