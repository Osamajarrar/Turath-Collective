/**
 * Consent categories — the registry.
 *
 * ── Why this exists as data, not as a hardcoded pair of buttons ──────────
 * The consent RECORD is a legal artefact under Law 25 / PIPEDA and is one of
 * the expensive-to-reverse decisions in plans/12-reversibility.md: you cannot
 * retroactively work out what someone agreed to, and you cannot re-ask a
 * visitor who has gone. If the stored decision were a single
 * "granted"/"denied" and a marketing pixel were added later, there would be no
 * way to tell who had consented to marketing — every visitor would have to be
 * re-prompted, and until they answered, the pixel could not fire.
 *
 * So the record is category-keyed from the start, even though only ONE
 * non-essential category exists today.
 *
 * ── Why the dialog is still two buttons ─────────────────────────────────
 * Only categories in ACTIVE_CATEGORIES are shown. Right now that is
 * `analytics` alone, so a per-category matrix would be a toggle list of one —
 * more friction, fewer decisions, and no more information.
 *
 * It would also be untrue. A dialog offering "Marketing and Retargeting" and
 * "Functional Cookies" tells visitors we set cookies we do not set. That is
 * the same class of claim as a fake review, and CLAUDE.md hard rule 4 covers
 * it: never state something a customer could rely on that isn't true.
 *
 * ── Adding a category (e.g. a Meta pixel for retargeting) ───────────────
 * 1. Add it to ACTIVE_CATEGORIES below.
 * 2. Add its `consent.categories.<id>.*` copy in EN/FR/AR.
 * 3. Add its origins to worker/security-headers.ts.
 * 4. Gate the script on `hasConsent("<id>")`.
 * The dialog switches to per-category controls on its own once more than one
 * category is active — see cookie-consent.tsx. Existing stored decisions stay
 * valid for the categories they already answered; visitors are only re-asked
 * about the new one.
 */

export type ConsentCategory = "analytics" | "marketing" | "functional";

export interface ConsentCategoryDefinition {
  id: ConsentCategory;
  /** i18n key suffix under `consent.categories.` */
  key: ConsentCategory;
  /** What actually runs under this category, for the PR reviewer and privacy policy */
  services: string[];
}

/**
 * Categories that are LIVE — something on the site genuinely runs under each.
 * Never list a category here speculatively: an unused entry puts a claim in
 * front of visitors that isn't true, and adds friction for nothing.
 */
export const ACTIVE_CATEGORIES: ConsentCategoryDefinition[] = [
  {
    id: "analytics",
    key: "analytics",
    // Sentry sits here rather than in its own category: it attaches a session
    // identifier and URL/breadcrumb data, which is the same kind of collection
    // the analytics tools do, and a separate toggle for it would be a
    // distinction without a difference to a visitor.
    services: ["PostHog", "Google Analytics 4", "Sentry"],
  },
];

export const ACTIVE_CATEGORY_IDS = ACTIVE_CATEGORIES.map((c) => c.id);

/** True when the dialog should offer per-category controls rather than two buttons. */
export const NEEDS_GRANULAR_UI = ACTIVE_CATEGORIES.length > 1;
