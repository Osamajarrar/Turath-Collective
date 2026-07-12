# Plan 04 — Repo cleanup (`chore/repo-cleanup`)

One dedicated PR, no behavior changes. Inventory below was verified against the working tree on
2026-07-07.

## 1. Tracked files to remove from git

| Path | Why | Action |
|---|---|---|
| `lighthouse-report*.json` (6 root) + `client/lighthouse-report-{optimized,v4}.json` | One-off audit output (~9k lines each) | Already untracked by commit `1e44416` on `feature/posthog-analytics` — **merging PR #5 handles this on main**. If PR #5 is rejected, redo: `git rm --cached` all 8 + keep the `.gitignore` rule `lighthouse-report*.json` (extend to cover `client/`: use `**/lighthouse-report*.json`). |
| `baseline-report.json` | Same category — one-off perf audit output | `git rm --cached baseline-report.json`, add to `.gitignore` |
| `.replit` | Replit platform config; project now runs on Vercel | `git rm .replit` |
| `replit.md` | **KEEP the content — do not delete.** It's the authoritative AI-agent architecture doc, not Replit junk. | Fold into the new agent docs (Plan on CLAUDE.md/AGENTS.md): rename via `git mv replit.md ARCHITECTURE.md` (or merge its content into `AGENTS.md`) and fix any references. |

Also check `dist/` is not tracked (it wasn't in `git ls-files` — confirm before PR) and that
`.gitignore` covers it.

## 2. Untracked scratch files to delete from disk (never commit them)

From the 2026-07-05/07 debugging sessions, all at repo root:

- `drive2.mjs` … `drive7.mjs`, `drive-tmp.mjs` — ad-hoc Playwright driver scripts
- `after-add-to-cart.png`, `after-checkout.png`, `product.png`, `shop.png` — screenshots
- `devlog.txt` — session notes (skim once for anything worth keeping, then delete)

`rm` them. They are untracked, so no git surgery needed.

## 3. `.design-sync/`, `ds-bundle/`, `.ds-sync/` (design tooling)

Untracked local design-sync tooling with its own branch (`chore/design-sync-import`). **Do not
delete** — not this PR's call. Instead commit the `.gitignore` entries that are currently sitting
in a stash (`git stash list` → "design-sync gitignore entries (uncommitted, from 2026-07-05
session)"):

```gitignore
# design-sync (staged scripts, build output, machine state)
.ds-sync/
ds-bundle/
.design-sync/.cache/
.design-sync/learnings/
.design-sync/node_modules
```

Apply the stash (`git stash pop`) on the cleanup branch, or hand-copy the block; either way the
stash should end up dropped so it doesn't linger.

## 4. Dead code to delete (verified zero imports)

- `client/src/components/story-carousel.tsx` — unused **duplicate** of review-carousel (even
  exports a function named `ReviewCarousel`); nothing imports it.
- `client/src/components/Logo-new.tsx` — unused; `Logo.tsx` is the live one.

Verify with `grep -rn "story-carousel\|Logo-new" client/src` before deleting (should only hit the
files themselves).

## 5. Keep (explicitly NOT cleanup targets)

- `review-carousel.tsx`, `social-proof.tsx` — intentionally parked placeholder components
  (see Plan 07).
- `server/auth.ts`, `server/routes.ts` AUTH_ENABLED block, `server/storage.ts` stub,
  `shared/schema.ts` commented tables — deferred v1 scaffolding per `MVP_LAUNCH_CHECKLIST.md`.
- `shopifyService.buyNow` + `buyNow` locale strings — future Buy Now button (PR #5 notes).
- `api/` directory (Vercel serverless entry) and `script/` (build/check tooling) — live.

## 6. Nice-to-have (same PR, only if trivial)

- `client/src/components/review-carousel.tsx:22` — `useEffect` interval is missing
  `reviews.length` in its dependency array (latent bug if it's ever re-enabled).
- Root `.gitignore` final-newline hygiene (the file currently ends without one).

## Order of operations

Branch from main **after PR #5 merges** (avoids re-untracking the lighthouse reports and
conflicts on `.gitignore`). Then: §3 gitignore block → §1 leftovers (`baseline-report.json`,
`.replit`, `replit.md` rename) → §4 dead components → §2 disk scratch → typecheck + build to
prove nothing referenced the deleted files.

## Model recommendation

**Cheap/fast model is fine** — every step is mechanical and fully specified above; the only
judgment calls (what to keep) are already made.
