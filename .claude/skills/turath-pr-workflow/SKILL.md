---
name: turath-pr-workflow
description: >
  Use BEFORE creating any branch, commit, or PR in this repo, and the moment
  you're about to run `gh` (it is NOT installed here), push anywhere, pick a
  base branch, or open a PR that depends on another open PR. Also use when
  `main` looks stale or missing files you expected (preview is intentionally
  ahead of main), when a PR needs to target something other than main, or
  when tempted to merge anything yourself. Covers the GitHub-REST-API PR
  workflow this machine requires, stacked-PR base handling, and the
  preview/main split — all discovered the hard way in the 2026-07
  overnight sessions.
---

# PR Workflow on This Machine — no gh CLI, preview ≠ main

## Why this skill exists (real incidents)

- `gh` CLI is **not installed** on this machine; the first session to need a
  PR had to derive a REST-API workflow from scratch. It's written down below
  so no session re-derives it (or worse, prints the token).
- As of 2026-07-12, **`preview` is intentionally ahead of `main`**: the
  overnight PRs merged into `preview` via PR #12, and `main` stays behind
  until the founder merges preview→main. Fix Batch 2 (PRs #17–#20) had to be
  cut from and targeted at `preview`. A branch naively cut from `main` in
  that window would re-fix already-fixed code — one batch instruction was
  already stale for exactly this reason (sticky-bar strings "hardcoded" that
  were already i18n'd on the newer base).
- PRs #7–#11 were **stacked** on `feature/posthog-analytics` (base = that
  branch, not main); GitHub retargets to main when the base PR merges.
  Getting the base wrong makes the diff unreviewable.

## Hard rules (from CLAUDE.md — restated because they're absolute)

- **Never push to `main` or `preview`.** Not even "just docs".
- Every branch gets its own PR. **Never merge your own PRs** — the founder
  merges. Prefixes: `fix/…`, `feature/…`, `chore/…`, `plans/…`.

## Runbook

1. **Pick the base by asking "where does the code I'm fixing currently
   live?"** — not "main by default". Check:
   ```
   git log --oneline main..preview
   ```
   If preview is ahead and your change touches files changed there, branch
   from `preview` and target `preview`; note in the PR body that it rides
   the preview→main merge. Otherwise branch from `main`, target `main`.
2. **Stacked work**: if your change depends on an open PR, branch from that
   PR's branch and set the PR base to it. GitHub retargets automatically on
   merge. Say "stacked on #N — merge #N first" in the PR body.
3. **Creating the PR without gh** — GitHub REST API with the token from the
   local credential store. Pattern (Node, run from repo root; **never echo
   the token**):
   ```js
   // create-pr.mjs
   import { execSync } from "node:child_process";
   const cred = execSync("git credential fill", {
     input: "protocol=https\nhost=github.com\n\n",
   }).toString();
   const token = cred.match(/^password=(.+)$/m)[1];
   const res = await fetch(
     "https://api.github.com/repos/Osamajarrar/Turath-Collective/pulls",
     {
       method: "POST",
       headers: {
         Authorization: `Bearer ${token}`,
         Accept: "application/vnd.github+json",
       },
       body: JSON.stringify({
         title: "…",
         head: "your-branch",
         base: "main", // or "preview" / a stacked base — see steps 1–2
         body: "…",
       }),
     },
   );
   console.log((await res.json()).html_url); // URL only — never the token
   ```
   Write the script in the scratchpad, pass the body as a file or heredoc,
   and delete nothing from the repo to make it work.
4. **PR body requirements** (per CLAUDE.md, plus session practice): what
   changed, why, what to check; a "Needs founder confirmation" section for
   any placeholder/business-fact left open (see `turath-claims-audit`);
   explicit **needs extra scrutiny** flag for payments/checkout, env
   handling, or legal copy.
5. **Windows hygiene**: expect CRLF warnings (harmless); never commit
   `.env.local`.

## When NOT to use this skill

- Deciding WHAT goes in the PR (scope, verification) — `fable-mode` and
  `turath-local-verify`.
- If `gh` has since been installed (`(Get-Command gh)` succeeds), prefer it
  over the REST pattern — then update this skill.
