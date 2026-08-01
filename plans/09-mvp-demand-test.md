# Plan 09 — MVP demand test: checkout intent, Resend, Sentry, tests

**Status:** specified, not started. No branch created, no commits made.
**Suggested branches:** `feature/checkout-intent`, `feature/resend-forms`, `chore/sentry`, `chore/tests`
**Execution model:** stronger model for the checkout dialog (copy + honesty constraints) and the
Resend consent split; Vitest setup is cheap.
**Decisions and rationale:** [DECISIONS.md](DECISIONS.md) §5–§7.
**Priority: higher than [plan 10](10-cloudflare-migration.md).** This plan answers whether anyone
wants the product; plan 10 is infrastructure that doesn't move that question.

---

## The goal

Run paid ads at a fully real storefront and measure **willingness to pay**, without taking payment.

The store cannot take money today anyway — the Shopify dev store still has a storefront password, so
any checkout click currently dead-ends on `checkout.turathcollective.com/password`. Something must
change here regardless of the demand test.

**Founder's design, adopted:** let people browse real products at real prices, add to cart, and click
checkout. Intercept at that click with a dialog explaining the pieces are still being made, and
capture an email to notify them when they're available. That list becomes the preorder list later.

**Why this beats a waitlist banner:** someone who chose a product, added it, and clicked buy has
revealed far more intent than someone typing an email into a footer — and it tells you *which*
product at *which* price. That is precisely the question being asked.

**Why it is honest** (see [DECISIONS.md](DECISIONS.md) §7): an unfinished checkout is a true
statement about a true state. The hard rules target provenance claims and fabricated social proof.
The dishonest version would be promising a delivery date known to be wrong.

---

## Part A — Checkout-intent dialog

### Behaviour

- **Intercept the CTA; do not overlay it.** The checkout button must open the dialog *instead of*
  navigating. If Shopify's `checkoutUrl` remains reachable, users land on the password page — the
  dead end we're removing, and it leaks that the store isn't live. Audit every path to
  `cart.checkoutUrl`, including `shopifyService.buyNow` (deferred, but confirm it's unreachable).
- Dialog: explanation → email field → submit → calm confirmation. No payment fields of any kind.
- Cart contents stay in the cart afterwards; nothing is cleared.

### Copy constraints (hard)

- **Displayed prices must be the prices we intend to charge.** This is where the honesty rules
  genuinely bind — a wrong price makes the signal worthless *and* misleading.
- **No timeline** unless it is known and true. No "shipping in X weeks".
- **Careful with "reserve."** It implies a claim on a specific piece. Fine if priority will genuinely
  be honoured when stock lands; otherwise "we'll tell you first" is truer and costs nothing in signal.
- Brand register: quiet, editorial, 1–3 sentences, no urgency, no countdown, no "limited spots", no
  exclamation marks.
- All strings via `useTranslation`, EN/FR/AR, `commerce` namespace.

### Analytics

Capture `checkout_intent` in PostHog with: product handle, variant, quantity, **cart value**,
currency, and locale. Cart value at intent is the number that answers "will people pay these prices",
segmented by product and ad source. Add `checkout_intent_email_submitted` as the conversion step.

Funnel to build: ad click → product view → add to cart → checkout intent → email submitted.

### Interpreting the results

Emails are a weaker signal than money — giving an address costs nothing, paying $180 doesn't. Treat
the numbers as **relative** (which products, which prices, which ads, which markets), not as a sales
forecast. Only real checkout gives an absolute answer.

---

## Part B — Resend: contact form + reserve capture

Most of this already exists. [server/email.ts](../server/email.ts) has `sendContactEmail`,
`sendContactConfirmation` and `sendNewsletterWelcome` written against Resend; the contact route is
merely commented out at [routes.ts:110-112](../server/routes.ts#L110-L112).

- **Enable the contact form** — route + `RESEND_API_KEY`. Keep the existing `escapeHtml` on all
  user-submitted fields ([email.ts:17](../server/email.ts#L17)).
  ⚠ [email.ts:80](../server/email.ts#L80) promises a reply "within 1–2 business days". **Only ship
  that if it's true**, per hard rule 4 — otherwise change the copy.
- **Reserve capture → Resend Audiences**, not a local file and not our database. A provider gives us
  the CASL-required unsubscribe, consent records, bounce handling and campaign sending; a JSON file
  or a table gives none of it. This replaces [server/newsletter.ts](../server/newsletter.ts) entirely
  (deleted in [plan 10](10-cloudflare-migration.md) phase 6c).
- **`sendNewsletterWelcome` is currently never called** by anything, and it has **no unsubscribe
  link** while promising "exclusive offers" ([email.ts:102-110](../server/email.ts#L102-L110)) — a
  CASL problem the moment it sends. Fix or let Resend's managed unsubscribe handle it.

### ⚠ Two separate consents (CASL)

We are in Montreal selling to Canadians; CASL requires provable consent, sender identification and a
working unsubscribe, with real penalties.

**"Email me when this piece is available" and "sign me up for the newsletter" are different
consents.** Capturing an address for the first does **not** permit sending the second. Implement as
two Resend audiences, or one audience plus an explicit **unticked** checkbox on the dialog. Getting
this wrong makes the first real campaign non-compliant.

Record the consent basis and timestamp per address.

---

## Part C — Sentry

Reversed from an earlier "PostHog is enough" recommendation: ad spend makes a silently broken page
expensive. PostHog answers *what people did*; Sentry answers *what broke*.

- Client-side Sentry first — that's where customer-facing breakage happens.
- **Add Sentry's origins to the CSP** (`_headers` and the Hono middleware, per
  [plan 10](10-cloudflare-migration.md) phase 3). Missing entries fail silently.
- **Add Sentry to Law 25 / cookie-consent scope** — coordinate with
  [plan 03](03-cookie-consent-banner.md).
- Scrub PII: no email addresses from the reserve dialog in error payloads.

## Part D — Tests

Vitest (native to Vite, near-zero config) + React Testing Library. **Don't chase coverage.** Test
where a silent break costs money:

1. **Cart logic** — [cart-context.tsx](../client/src/context/cart-context.tsx) has real branching:
   mock vs live variant, add-to-existing vs create-new cart, quantity-to-zero removal, localStorage
   round-trip. Highest value in the codebase.
2. **i18n key parity** — assert EN/FR/AR have identical key sets across all namespaces. Cheap, and
   catches the classic "Arabic page renders a raw `pages.product.title`" bug.
3. **Shopify proxy validation** — introspection blocked, oversized query rejected, missing-credential
   503 shape preserved.
4. **`product-sort.ts`** — pure functions, trivial.
5. **Checkout-intent interception** — the dialog opens and no navigation to `checkoutUrl` occurs.

Later, one **Playwright** end-to-end: land on product → add to cart → cart shows correct total →
checkout opens the dialog. That single test would catch most catastrophic regressions.

Add a `test` script to `package.json`; there is none today.

## Part E — Small cleanup

[cart-context.tsx](../client/src/context/cart-context.tsx) has ~8 `console.log` calls printing cart
internals ([170](../client/src/context/cart-context.tsx#L170),
[214](../client/src/context/cart-context.tsx#L214),
[228-230](../client/src/context/cart-context.tsx#L228-L230)). They ship to production and are visible
in every customer's console. Strip them.

---

## Suggested order

1. **Part B** — contact form + Resend Audiences (unblocks everything; also the contact form is
   currently the site's *only* missing way to reach the founder)
2. **Part A** — checkout-intent dialog + PostHog events
3. **Part C** — Sentry
4. **Part D** — Vitest and the five test areas
5. **[Plan 10](10-cloudflare-migration.md)** — Cloudflare migration
6. **Run ads, read results**
7. Then decide, with data: real checkout (remove the Shopify store password), preorders, accounts,
   reviews

## Open questions

- **Exact dialog copy** — needs founder voice; "reserve" vs "we'll tell you first" is a real
  decision, not a wording preference (see Copy constraints).
- **One audience or two** in Resend for the consent split.
- **When to remove the Shopify storefront password** — gates any move to real checkout.
