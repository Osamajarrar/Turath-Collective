---
name: turath-i18n-copy
description: >
  Use whenever you add, edit, move, or delete ANY user-facing string in this
  repo — including "just one label", a button, an alt text, an aria-label, a
  toast, or an error message. Also use before acting on an instruction that
  says a string is hardcoded (verify first — one such instruction was stale),
  when touching anything under client/src/locales/, when tempted to create a
  translation.json file, and when wondering why Arabic isn't in the language
  switcher. This repo's string system has three locales, five registered
  namespaces, one dead-file trap, and a deliberately hidden locale; every one
  of those has caused a real mistake or near-miss.
---

# i18n Copy Changes — EN/FR/AR, five namespaces, known traps

## Why this skill exists (real incidents)

- Hardcoded English shipped repeatedly on live pages: the "Top Rated" badge
  string, a hardcoded shipping sentence in the product Care accordion that
  **contradicted the shipping policy page**, and others — all cleaned up in
  commit `20ebb1b` (PR #9). Hardcoded strings don't just skip FR/AR; they
  drift out of sync with the policy copy that IS translated.
- `translation.json` locale files were unregistered dead duplicates of
  `common.json` — keys added there silently did nothing. They were deleted
  in PR #8. **Do not recreate them.**
- A Fix Batch 2 instruction claimed the sticky-bar strings were hardcoded;
  they had already been i18n'd. The lesson: check the current tree before
  executing copy instructions written against an older state.
- `product.related.subtitle` hardcoded "the heritage of Hebron" into a
  string shown for ALL products; fixed in `1d418a3` because the brand is not
  single-origin-locked. Origin-specific wording belongs in per-product data,
  not shared keys.

## The system (verified against `client/src/lib/i18n.ts`)

- Locales: `en`, `fr`, `ar` under `client/src/locales/<lng>/`.
- Registered namespaces — the ONLY files that work:
  `common.json`, `pages.json`, `commerce.json`, `legal.json`, `errors.json`.
  Anything else in a locale folder is dead weight.
- Default namespace `common`, fallback language `en`.
- Cross-namespace access: `t("commerce:product.addToBag")` or
  `useTranslation("commerce")`.
- AR is RTL: `applyRtl()` in `i18n.ts` flips `dir` on `<html>`.

## Runbook

1. **New string → new key in the right namespace**, in **all three
   locales in the same commit**. EN and FR get real translations. AR: match
   the file's current state — if the surrounding AR block is populated,
   translate; if the block is deliberately empty (see below), leave it empty
   rather than half-filling.
2. **Deliberately empty AR blocks** (state as of 2026-07-12):
   `ar/legal.json` is empty and the about/care blocks in `ar/pages.json` are
   empty — English fallback is intentional until real AR translations land.
   Don't "fix" the fallback by machine-filling an entire legal page; don't
   delete the empty files either.
3. **AR is hidden from the switcher on purpose.** `SUPPORTED_LANGUAGES` in
   `client/src/lib/i18n.ts` has the `ar` entry commented out (line ~90) while
   AR resources still load. Founder-confirmed (2026-07-12): intentional until
   translations are complete. Keep maintaining AR keys in parallel; do NOT
   uncomment the switcher entry without founder sign-off.
4. **Before "fixing a hardcoded string", confirm it's still hardcoded:**
   ```
   grep -rn "the exact english text" client/src client/src/locales
   ```
   If it only exists in a locale JSON, the instruction is stale — say so
   instead of re-doing done work.
5. **Verify a key change end-to-end:** grep the key name across all three
   locale folders (same key path present in each), then load the page —
   a missing key renders the raw key string or silently falls back to EN,
   both easy to miss in a quick glance.
6. **Style constraints on the strings themselves** (from CLAUDE.md): quiet
   editorial voice, 1–3 calm sentences, no exclamation marks, no hype.
   Shared keys must not name a specific origin (Hebron) unless the key is
   genuinely origin-scoped.

## When NOT to use this skill

- Deciding whether a claim in the copy is TRUE (numbers, policies, badges) —
  that's `turath-claims-audit`. This skill is plumbing; that one is truth.
- Strings never shown to users (log messages, test IDs, internal errors) —
  those stay plain.
- General "verify against the current tree, not the instruction" discipline
  is `fable-mode` Gate 2; the stale-instruction example above is just its
  local, i18n-flavored instance.
