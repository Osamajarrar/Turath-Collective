# Plan 11 — Dev backlog: one branch per feature

**Session:** 2026-08-01. Founder listed eleven dev items off the top of his head; this plan turns
each into a branch with concrete steps, a dependency order, and a model recommendation.

Most items already have a specification in an earlier plan. **This file does not restate those —
it points at them.** Where an item had no plan (slogan, design decision, consent strength), the
steps are written out here in full.

All branches cut from `dev` and merge back into `dev` (CLAUDE.md hard rule 1: never push `test`
or `main`). PR workflow: `gh` is not installed on this machine — see the `turath-pr-workflow`
skill before opening anything.

---

## Decisions taken this session

| Question | Decision | Consequence |
|---|---|---|
| Checkout dialog promise | **"We'll tell you first"** — notification only, no priority claim | Closes plan 09's open question. No per-piece reservation tracking needed; copy must not use the word "reserve" |
| Consent UI strength | **Centered modal**, two equal-weight buttons, closes only by choosing | Overrides plan 03 §5 (bottom bar). Not a cookie-wall — see B2 below |
| Navbar tagline | **Recommendation: remove** (founder to confirm) | See item 8 |

---

## Dependency order

Not the order of the founder's list — the order in which each branch's output feeds the next.

```
1  fix/remove-unreal-data ──┐  (independent, do first: shrinks every later diff)
2  fix/brand-tagline ───────┤
3  chore/vitest ────────────┘  (independent; tests land before the code that needs them)
                │
4  feature/analytics-consent  (blocks 5 and 6 — both add CSP origins + consent scope)
                │
5  chore/sentry
                │
6  feature/resend-contact ──> 7 feature/email-templates
                │
8  feature/checkout-intent    (needs 6's Resend audience + 4's consent gate)
                │
9  chore/design-decision      (founder task, can run in parallel any time)
                │
10 feature/cloudflare-migration  (last — it rewrites the server every earlier branch touched)
```

**Why Cloudflare is last.** Plan 10 replaces Express with Hono and rewrites CSP handling. Every
branch above that touches `server/` or CSP would conflict with it. Migrating first would mean
building all the MVP features twice, or on an unfamiliar stack while the demand question is still
unanswered. DECISIONS.md already sets 09 before 10; this keeps that.

---

## The branches

### 1 — `fix/remove-unreal-data`  · Sonnet 5

Founder item: *remove unreal data (writing and components)*.

Fully specified across three existing plans; nothing to re-derive. **Run the `turath-claims-audit`
skill before touching any string.**

1. Plan 06 PR A, copy fixes 1–5: the `"Top Rated"` badge ([product.tsx:775](../client/src/pages/product.tsx#L775)),
   the hardcoded shipping sentence contradicting the shipping policy ([product.tsx:913](../client/src/pages/product.tsx#L913)),
   the orphaned `about.collections.*` keys with the "five hundred years" claim, the two tone
   outliers, the `story.stats.stat2` value/label inversion.
2. Plan 07 items 1–2: make `home.tsx` use the `VITE_SHOW_PLACEHOLDER_CONTENT` gate instead of
   commented-out imports, and add the loud header comment to `review-carousel.tsx` /
   `social-proof.tsx`.
3. Plan 06 PR B, the `product.tsx:307` "Notify Me" flow that ends in `console.log` — a customer
   who taps it believes they subscribed. Hide the control until item 8 gives it a real backend.
4. Plan 09 Part E: strip the ~8 `console.log` calls printing cart internals in
   [cart-context.tsx](../client/src/context/cart-context.tsx).

**Do not** delete the fabricated reviewer quotes in `common.json` or the fake Instagram usernames
— plan 07 verified they cannot render, and they are deliberate scaffolding for real content.
Removing them is a bigger diff with no honesty gain.

**Open, needs a human:** the "2,000 years of continuous pottery tradition" figure in the live FAQ
(plan 06 A.3). Do not let any model invent a replacement number. Either verify it or switch to
"a craft tradition passed down for generations".

**Done =** no user-facing string states a fact we can't support; `npm run check` clean; the
product page verified in all three availability states (`turath-local-verify` skill — a bug
already shipped from testing only one).

---

### 2 — `fix/brand-tagline`  · Sonnet 5

Founder item: *change slogan in logo*. See item 8 below for the decision itself.

1. Apply the chosen option to `navbar.tagline` in `client/src/locales/{en,fr,ar}/common.json`
   **and** `commerce.json:68` — the string is duplicated in two namespaces, which is how they
   drift apart.
2. If **remove**: delete the key from all six files and the render site, don't leave it empty.
3. Leave `footer.tagline` and `comingSoon.tagline` alone — they are different, longer sentences
   serving a different purpose.

Trivial diff, but it is a user-facing string in three locales: run `turath-i18n-copy` first.

---

### 3 — `chore/vitest`  · Sonnet 5

Founder item: *add vitest*. Plan 09 Part D specifies it completely.

1. `vitest` + `@testing-library/react` + `jsdom`, `test` script in `package.json` (there is none
   today), config merged into the existing `vite.config.ts`.
2. The five test areas in plan 09 D, highest value first: cart logic → i18n key parity →
   Shopify proxy validation → `product-sort.ts` → (checkout-intent interception, after branch 8).
3. **Don't chase coverage.** Plan 09 is explicit about this.

The i18n key-parity test is the cheapest high-value one in the repo — it catches the "Arabic page
renders a raw `pages.product.title`" class of bug, which every other branch in this backlog can
introduce.

---

### 4 — `feature/analytics-consent`  · Opus 5

Founder item: *analytics in front of people so they have to choose*.

Plan 03 specifies the mechanism (blocked-by-default init, `consent.ts`, Consent Mode v2 defaults
in the GA snippet, locale keys). **Two changes to plan 03**, both from this session:

**A. Placement: centered modal, not a bottom bar.** Two equal-weight buttons ("Accept analytics" /
"Essential only"), no X, no "continue without choosing". Dismissable by choosing, and by Esc /
browser-back — the site itself stays fully functional either way. That is the strongest form of
"they have to choose" that isn't a cookie-wall. Declining must stay exactly as easy as accepting
(Law 25); no dark patterns, no dimmed decline button, no pre-checked anything.

**B. Cookieless pre-consent mode — founder decision required, flagged as a grey zone.**

The honest problem with any consent prompt: a large share of visitors never answer, and you learn
nothing about them. The mitigation is to run PostHog before consent with **no persistent
identifier at all** — `persistence: "memory"`, no session recording, no autocapture of form
contents — so you get aggregate pageview and funnel counts but cannot follow one person across a
reload. On accept, upgrade to full persistence.

- **The case for it:** with no cookie, no localStorage and no cross-session identifier, this is
  much closer to aggregate statistics than to tracking.
- **The case against it:** Law 25 and PIPEDA regulate *collection of personal information*, not
  only cookies, and PostHog still receives an IP address server-side. Regulators have not settled
  this. Anyone telling you it is definitively fine is guessing.
- **If you take it:** enable PostHog's IP anonymization/discarding, and say plainly in the privacy
  policy that anonymous aggregate counts are collected before a choice is made. Undisclosed is the
  version that is actually indefensible.
- **If you don't:** nothing fires until Accept, and you accept the blind spot.

The founder noted other projects simply don't prompt at all. That is the one option genuinely off
the table — for a Montreal business selling to Canadians it is a Law 25 violation with real
penalties, and it contradicts the repo's own honesty rules.

**Also in this branch:** the privacy policy's cookie section (coordinate with plan 02, which edits
the same section), and consent scope must be written to include Sentry — added in branch 5.

**Done =** the Playwright check from plan 01/03: zero requests to GA measurement endpoints and
zero PostHog `/e/` requests in the no-choice state (or, under option B, only the anonymous ones),
verified in all three states, in EN/FR/AR including RTL. Read the `turath-analytics-consent` skill
first — this repo has already leaked an email into event properties once.

---

### 5 — `chore/sentry`  · Sonnet 5

Founder item: *add sentry*. Plan 09 Part C.

1. Client-side `@sentry/react` only — that's where customer-facing breakage happens.
2. **Gate init behind the consent state from branch 4**, and add Sentry to the consent copy's
   stated scope. Error monitoring that starts before consent re-opens the question branch 4 just
   closed.
3. Add Sentry's ingest origin to the CSP in [server/index.ts](../server/index.ts) **and**
   [vercel.json](../vercel.json) — the CSP is hand-duplicated today (DECISIONS.md §1) and a
   missing entry fails silently in the browser.
4. Scrub PII: `beforeSend` must drop email addresses, so the checkout dialog in branch 8 can never
   put a customer's address into an error payload.

**Done =** a deliberately thrown error appears in the Sentry dashboard *after* accepting consent,
and does not appear before it.

---

### 6 — `feature/resend-contact`  · Opus 5

Founder item: *contact form with resend*. Plan 09 Part B. Most of the code already exists —
[server/email.ts](../server/email.ts) has `sendContactEmail` and `sendContactConfirmation`
written against Resend, and `resend` is already a dependency. The route is merely commented out at
[routes.ts:110-112](../server/routes.ts#L110-L112).

1. Uncomment and wire the contact route; `RESEND_API_KEY` in `.env.local` and Vercel.
2. Keep `escapeHtml` on every user-submitted field ([email.ts:17](../server/email.ts#L17)).
3. **[email.ts:80](../server/email.ts#L80) promises a reply "within 1–2 business days."** Hard rule
   4: ship that only if it's true, otherwise change the sentence. This is a founder call.
4. Rate-limit the endpoint. `express-rate-limit`'s in-memory store is already per-instance and
   therefore weak on Vercel (DECISIONS.md §2) — acceptable now, fixed properly in branch 10.
5. Update the CLAUDE.md gotcha that says the contact form is not connected to any backend.

**Done =** a real submission arrives in the founder's inbox, the confirmation lands, and the
promised reply time on the page matches what he will actually do.

---

### 7 — `feature/email-templates`  · Opus 5  · stacked on branch 6

Founder item: *email templates*. Not covered by an existing plan beyond what `email.ts` already
contains. This is where CASL bites.

1. Inventory what exists: `sendContactEmail`, `sendContactConfirmation`, `sendNewsletterWelcome`.
2. **`sendNewsletterWelcome` is never called by anything and has no unsubscribe link while
   promising "exclusive offers"** ([email.ts:102-110](../server/email.ts#L102-L110)). That is a
   CASL violation the moment it sends. Fix it or delete it before anything can call it.
3. Every commercial email needs, by law: sender identification with a physical mailing address, a
   working unsubscribe honoured within 10 business days, and provable consent. Prefer Resend's
   managed unsubscribe over hand-rolling it.
4. Templates to write: contact confirmation (transactional — no unsubscribe needed), notify-me
   confirmation (branch 8), notify-me "it's available now" (branch 8), newsletter welcome.
5. Brand register applies to email exactly as to the site — quiet, editorial, 1–3 sentences, no
   exclamation marks, no urgency. Plain-text fallback for every template.
6. **No timeline may be stated** that isn't known. No "shipping in X weeks".
7. EN/FR/AR. A Quebec business emailing Quebec customers in English only is its own problem.

**Done =** each template rendered and read end-to-end in all three locales, with a real
unsubscribe link clicked and verified on every commercial one.

---

### 8 — `feature/checkout-intent`  · Opus 5

Founder item: *checkout will show a dialog to get email*. Plan 09 Part A, with the copy question
now closed: **notification only, not "reserve."**

1. **Intercept the CTA, don't overlay it.** Audit every path to `cart.checkoutUrl` — including
   `shopifyService.buyNow` (deferred; confirm it's unreachable). If any path survives, the user
   lands on `checkout.turathcollective.com/password`, which is both a dead end and a leak that the
   store isn't live.
2. Dialog: explanation → email field → submit → calm confirmation. **No payment fields of any
   kind.** Cart contents stay in the cart afterwards.
3. Copy: quiet, 1–3 sentences, no timeline, no urgency, no countdown, no "limited spots". Avoid
   the word "reserve" entirely — it implies a claim on a specific piece we are not making. All
   strings via `useTranslation`, EN/FR/AR, `commerce` namespace.
4. **Two separate consents (CASL).** "Tell me when this is available" ≠ "sign me up for the
   newsletter." Two Resend audiences, or one audience plus an explicit **unticked** checkbox.
   Record consent basis and timestamp per address. Getting this wrong makes the first real
   campaign non-compliant.
5. Analytics: `checkout_intent` with product handle, variant, quantity, **cart value**, currency,
   locale; `checkout_intent_email_submitted` as the conversion step. Cart value at intent is the
   number that answers "will people pay these prices". Gated by branch 4's consent, and the email
   address must **never** become an event property (this repo has done that once already).
6. Displayed prices must be the prices you intend to charge. This is where the honesty rules
   genuinely bind — a wrong price makes the signal worthless *and* misleading.
7. Replaces [server/newsletter.ts](../server/newsletter.ts) (file-backed store, deleted in plan 10
   phase 6c). Reuse it for nothing.

**Done =** clicking checkout in every entry path opens the dialog and performs no navigation
(covered by a Vitest case from branch 3); an email submitted locally appears in the correct Resend
audience with a consent timestamp; PostHog shows the full funnel ad click → product view → add to
cart → checkout intent → email submitted.

---

### 9 — `chore/design-decision`  · founder task, no model

Founder item: *decide on designs I want to get feedback on*.

Six homepage variants are already built and isolated behind `/design` —
[client/src/design-variants/README.md](../client/src/design-variants/README.md). The real homepage
is untouched, the routes are noindexed and lazy-loaded, so this costs nothing to leave in place
while deciding.

Concrete steps:

1. `npm run dev`, open `http://localhost:5000/design`, walk all six. Use the floating **Variants**
   button to compare the same scroll position across directions.
2. Check each on a phone-width viewport — Mobile Narrative exists because that's where the
   traffic will be, and ad clicks land on mobile.
3. Narrow to **two**, not one. A/B feedback on two distinct directions is informative; feedback on
   six is noise and people will just pick the prettiest thumbnail.
4. For outside feedback, send the two routes directly. Ask one question — "which of these feels
   like an object worth $180?" — not "which do you like".
5. Once chosen: promote the winner into the real components, then delete
   `client/src/design-variants/`, the `design-*.json` locale files, and the two `/design` routes
   (removal steps are at the bottom of the variants README).

Feedback gathering itself is outside my reach — I can't send anything to anyone, and shouldn't.

---

### 10 — `feature/cloudflare-migration`  · Opus 5

Founder item: *migrate to cloudflare from vercel*. Plan 10, fully specified in six phases;
DECISIONS.md §1–§4 holds the rationale and the rejected alternatives.

Runs **last**, and only after ads have run against the demand test. It is infrastructure — it does
not move the question of whether anyone wants the product, and it rewrites the server layer that
branches 4–8 all touch.

Two things to re-check when it starts, because this backlog changes them:

- Plan 10's CSP phase must carry **Sentry's origins** (branch 5), which didn't exist when plan 10
  was written.
- Plan 10 phase 6c deletes `server/newsletter.ts`. Branch 8 already replaced it with Resend, so
  confirm nothing new references it.

Plan 10 phases 1 and 5–6 are mechanical enough for Sonnet 5; the Hono port and CSP consolidation
are not.

---

## Item 8 — the navbar tagline decision

The founder asked for help deciding rather than choosing. Current state, verified:

- `navbar.tagline` = **"Heritage Craftsmanship"**, duplicated in `common.json:13` and
  `commerce.json:68`.
- `pages.brandStory.heading` = **"History, still handmade."** — already live on the homepage.
- CLAUDE.md names "History, still handmade." as the brand tagline, chosen because it stays true
  across both tiers of the honesty framework.

**Recommendation: remove the tagline from the navbar.**

Three reasons, in order of weight:

1. **It's already duplicated.** Putting "History, still handmade." in the navbar means the same
   sentence appears twice on the homepage, a few hundred pixels apart. That doesn't reinforce it —
   it makes it read as filler. Keeping it homepage-only is what gives it weight.
2. **The brand model is Apple, not Gucci** (CLAUDE.md). Apple's nav is a wordmark and nothing
   else. A tagline glued to the logo is a mid-market signal; the confident version is a wordmark
   standing alone.
3. **"Heritage Craftsmanship" is the weakest of the three options anyway.** It's a category label,
   not a line — it says the same thing every competitor says, and it carries none of the two-tier
   honesty framing that "History, still handmade." was chosen for.

**Pick "History, still handmade." instead if** you plan to reduce or remove the homepage brand-story
heading, so the line has exactly one home. That's a coherent alternative, just a larger change.

**Don't keep "Heritage Craftsmanship."** It's the status quo by inertia, not by choice.

---

## Model recommendations, summarised

| Branch | Model | Why |
|---|---|---|
| 1 `fix/remove-unreal-data` | Sonnet 5 | Fully specified in plans 06/07/09; mechanical. One human fact-check carved out |
| 2 `fix/brand-tagline` | Sonnet 5 | Six-file string change |
| 3 `chore/vitest` | Sonnet 5 | Standard setup, test areas already chosen |
| 4 `feature/analytics-consent` | **Opus 5** | Gating correctness — a subtle miss silently defeats the entire compliance goal |
| 5 `chore/sentry` | Sonnet 5 | Well-trodden, but the consent gate and CSP entries must not be skipped |
| 6 `feature/resend-contact` | **Opus 5** | Live email + a truth claim about response time |
| 7 `feature/email-templates` | **Opus 5** | CASL, copy voice, three locales |
| 8 `feature/checkout-intent` | **Opus 5** | Copy under honesty constraints + the two-consent split + interception audit |
| 9 `chore/design-decision` | — | Founder's taste, not a model's |
| 10 `feature/cloudflare-migration` | **Opus 5** | Server rewrite, CSP consolidation, routing |

## Still open after this plan

- The Hebron "2,000 years" figure (branch 1) — needs a human or verified source.
- Contact-form reply-time promise (branch 6) — must be true before it ships.
- Cookieless pre-consent analytics, option B (branch 4) — founder's call, grey zone.
- Whether to remove the Shopify storefront password — gates any move to real checkout. Decide
  after ad results, per plan 09.
