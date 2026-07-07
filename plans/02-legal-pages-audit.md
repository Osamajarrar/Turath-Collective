# Plan 02 — Legal & informational pages: audit results + replacement copy

Full-content audit completed 2026-07-07 (every page + all three locale files read). Overall:
the legal copy is largely **real and well-written** — this is not a lorem-ipsum situation. But
there are four must-fix accuracy problems, one deceptive UX flow, an i18n architecture split,
and an Arabic localization gap.

## A. Must-fix factual problems

### A1. Damaged-item window contradiction (48h vs 14 days)
- `client/src/pages/ShippingAndReturns.tsx:289-292`: report damage "within **48 hours** of delivery".
- `client/src/locales/en/pages.json` (FAQ, `returnsExchanges` item 3): photograph and email
  "within **14 days** of receiving your order".

**Decision: standardize on 14 days** (customer-friendly, matches the FAQ and the general 14-day
return window, avoids disputing claims from customers who open a gift box a week later).

Replacement for the ShippingAndReturns passage:
> If your piece arrives damaged or defective, email support@turathcollective.com within 14 days
> of delivery with photos of both the item and its packaging. We will arrange a replacement or a
> full refund, including shipping, at no cost to you.

### A2. Contact form silently discards submissions
`client/src/pages/contact.tsx:21-25` fakes an 800ms wait then shows "We'll get back to you
within 1–2 business days" (`common.json` → `contact.successDesc`) — but `server/routes.ts:63-65`
has the contact route disabled; nothing is sent anywhere. This is the most user-facing deceptive
item found.

**Decision (pick one — recommend option 1 for launch):**
1. **Replace the form with a plain email CTA** until the backend exists: keep the page layout,
   swap the form block for the FAQ pointer plus a `mailto:support@turathcollective.com` button
   styled like the existing submit button. Copy: "Write to us at support@turathcollective.com —
   we read everything." No response-time promise until one is operationally real.
2. Wire the form for real (re-enable the route + `sendContactEmail` via Resend) — more work,
   touches server code; only do this if launch wants a form.

### A3. Privacy policy discloses a Mailchimp relationship that doesn't exist
`PrivacyPolicy.tsx:233-244` (and the parallel `legal.json` privacy block) lists "Marketing
platform (Mailchimp) — Newsletter delivery (subscribers only)". The newsletter form is not wired
to anything. PIPEDA/Law 25 disclosure must reflect *actual* recipients.

**Fix:** remove the Mailchimp row until a newsletter provider is actually integrated (and when it
is, name whichever one is used). Keep the Resend row — that integration is real (dormant).
While in there: the newsletter signup component itself should be checked — if it also fakes
success, apply the same A2 treatment (out of this plan's page list, but same honesty bug).

### A4. Stale effective dates
"Effective date: April 2025 · Last updated: April 2025" appears in `PrivacyPolicy.tsx:66`,
`ShippingAndReturns.tsx:33`, and `legal.json` (lines 4, 95, 225). Update all to the month the
revised pages actually ship, and add a habit note in AGENTS.md to bump these on any legal edit.

## B. Structural fix — wire all legal pages to i18n (one pattern, not three)

`TermsAndConditions.tsx` correctly renders from `legal.json` (`useTranslation("legal")`).
`PrivacyPolicy.tsx` and `ShippingAndReturns.tsx` hardcode English JSX **even though complete,
already-FR-translated `privacy` and `shipping` blocks sit unused in `legal.json`**. Refactor both
pages to consume `legal.json` exactly like Terms does. This:
- makes FR legal pages actually French (Law 25 expectation for a Quebec business),
- eliminates the parallel-maintenance trap (JSX copy vs locale copy drifting apart — verify the
  two versions match before deleting the JSX copy; apply fixes A1/A3/A4 to the locale version).
Also fix the hardcoded `#C9A96E` gold in `PrivacyPolicy.tsx` → use the theme's primary/accent
token (design-pass overlap, cheap to do in the same PR).

## C. Fake placeholder data quarantined in locale files — delete it

In `common.json` AND the stale `translation.json`, across **all three locales**:
- `contact.addressDetails`: "1234 Heritage Way, Plateau Mont-Royal…" (fake street address)
- `contact.phoneNumber`: "+1 (514) 555-0123" (fictional 555 number)
- `contact.emailAddress`: "hello@turathcollective.com", `contact.partnerEmail`:
  "partnerships@turathcollective.com" — conflict with the canonical support@turathcollective.com

The commented-out JSX block in `contact.tsx:69-130` renders these if ever un-commented. Delete
the commented block + the four keys in all locales (`translation.json` is deleted wholesale per
Plan 04 — it's not registered in `i18n.ts` at all). Canonical contact email everywhere:
**support@turathcollective.com** (until the founder decides otherwise).

## D. Arabic localization gap (founder decision required)

- `ar/legal.json` is empty (5 lines vs 302 in EN/FR) → AR users get English legal pages.
- `ar/pages.json`: `about: {}` and `care: {}` are empty → English fallback on the About page —
  the page most tied to Palestinian identity, on a site whose audience includes Arabic speakers.
- FAQ *is* fully translated in AR; so is `common`/`commerce`.

Options: (1) translate the missing blocks before launch (recommended for `about`+`care`; legal AR
can lag since EN/FR are the operative legal texts in Quebec); (2) launch with EN/FR only and hide
the AR toggle until AR is complete. Don't ship the current half-state silently.

## E. Small accuracy nits

- `PrivacyPolicy.tsx:368-375`: "not directed at children under the age of 14" — arbitrary
  US-boilerplate threshold; PIPEDA has no such bright line. Reword: "Our website is intended for
  a general audience and we do not knowingly collect personal information from minors."
- FAQ's "Lead-Free and Cadmium-Free… safe for everyday food and beverage use" — real, specific
  safety claim; founder must hold supplier documentation before launch (same class as Plan 05's
  supplier-confirmation items).
- Free-shipping threshold: announcement banner + product page say "free shipping over $100 CAD";
  the shipping policy never mentions it. Add the threshold to ShippingAndReturns (or remove the
  banner claim if the policy isn't real).
- Cookie/analytics section of the privacy policy must be updated when Plan 03's consent banner
  ships (describe the two categories + how to change your choice). Coordinate the two PRs.

## Suggested PR structure

One PR (`fix/legal-content-accuracy`): A1–A4 + C + E. The B refactor can ride along if the
locale-vs-JSX diff check is clean, otherwise it's its own PR. D is a founder decision + possibly
a translation PR after.

## Model recommendation

**Stronger model recommended** for B (refactor must prove locale copy ≡ JSX copy before deleting
one) and any copy rewriting (brand voice + legal accuracy judgment); A4/C are mechanical and a
cheap model could do them in isolation.
