/**
 * Consent gating — PIPEDA / Quebec Law 25 opt-in model.
 *
 * Analytics are BLOCKED BY DEFAULT. Nothing (PostHog, GA4 measurement hits)
 * runs until the visitor explicitly grants consent. Two equal-weight choices:
 * "granted" (accept analytics) or "denied" (essential only). We persist the
 * decision in localStorage and only re-prompt when no decision exists.
 *
 * Storage shape (key `turath-consent`), v2 — CATEGORY-KEYED:
 *   { "version": 2, "decidedAt": "<ISO>", "categories": { "analytics": true } }
 *
 * The record is per-category even though only one non-essential category is
 * live today, because a consent record is a legal artefact that cannot be
 * reconstructed later: with a single granted/denied flag, adding a marketing
 * pixel would mean re-prompting every visitor. See lib/consent-categories.ts
 * for the registry and for how to add a category. v1 records
 * (`{status, timestamp}`) are read and upgraded in place, so this change
 * re-prompts nobody.
 *
 * The decision is ALSO mirrored into a plain cookie (`turath-consent=granted|denied`,
 * domain `.turathcollective.com`) because localStorage does not cross subdomains:
 * the Shopify checkout on checkout.turathcollective.com runs a custom web pixel
 * (see docs/shopify-checkout-pixel.md) that must honor the same choice, and the
 * cookie is the only channel it can read. localStorage stays the source of truth
 * on the storefront; the cookie is write-only from here.
 *
 * Import direction: consent.ts imports from analytics.ts (one-way) to avoid a
 * circular dependency — analytics.ts only imports the read helper `getConsent`.
 */
import posthog from "posthog-js";
import { enableAnalytics, isAnalyticsInitialized } from "./analytics";
import { enableMonitoring, disableMonitoring } from "./monitoring";
import {
  type ConsentCategory,
  ACTIVE_CATEGORY_IDS,
} from "./consent-categories";

const STORAGE_KEY = "turath-consent";
const CONSENT_COOKIE = "turath-consent";
// Matches Law 25 guidance of re-validating consent periodically.
const CONSENT_COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year, in seconds

export type ConsentStatus = "granted" | "denied";

declare global {
  interface Window {
    // gtag is also declared in analytics.ts; kept optional here for the guard.
    gtag?: (...args: unknown[]) => void;
  }
}

/**
 * Stored decision, v2 — category-keyed.
 *
 * v1 was `{ status: "granted" | "denied", timestamp }`, which could only ever
 * answer one question. Records in that shape are still read and upgraded in
 * place (see readRecord), so nobody is re-prompted by this change.
 *
 * `categories` holds an entry per category the visitor has actually answered.
 * A category MISSING from the map has not been decided — that is different
 * from `false`, and it is what lets a newly added category re-prompt only for
 * itself instead of invalidating the whole decision.
 */
type ConsentRecord = {
  version: 2;
  decidedAt: string;
  categories: Partial<Record<ConsentCategory, boolean>>;
};

/** v1 shape, still on disk for anyone who decided before this change. */
type LegacyConsentRecord = {
  status: ConsentStatus;
  timestamp: string;
};

/**
 * Mirror the decision into a cookie shared with checkout.turathcollective.com,
 * where the Shopify custom pixel reads it (localStorage can't cross subdomains).
 * On localhost / preview deploys the domain attribute is omitted so the cookie
 * still works for local testing without being rejected by the browser.
 */
function writeConsentCookie(status: ConsentStatus): void {
  try {
    const parts = [
      `${CONSENT_COOKIE}=${status}`,
      "path=/",
      `max-age=${CONSENT_COOKIE_MAX_AGE}`,
      "SameSite=Lax",
    ];
    const host = window.location.hostname;
    if (host === "turathcollective.com" || host.endsWith(".turathcollective.com")) {
      parts.push("domain=.turathcollective.com");
    }
    if (window.location.protocol === "https:") {
      parts.push("Secure");
    }
    document.cookie = parts.join("; ");
  } catch {
    // Cookies unavailable — the storefront still works off localStorage; only
    // the checkout pixel loses visibility, and it fails closed (no tracking).
  }
}

/**
 * Re-mirror an already-stored decision into the cookie. Called once at app
 * startup (main.tsx) so visitors who made their choice before the cookie
 * mirror existed — or whose cookie expired before localStorage did — are
 * covered on the checkout domain too.
 */
export function syncConsentCookie(): void {
  const status = getConsent();
  if (status) {
    writeConsentCookie(status);
  }
}

/**
 * Read the stored decision. Returns null when no decision has been made yet
 * (fresh visitor) or when storage is unavailable/corrupt (private mode, manual
 * tampering) — treating those as "not decided" so we re-prompt rather than
 * silently assuming consent.
 */
export function getConsent(): ConsentStatus | null {
  const record = readRecord();
  if (!record) return null;
  // Back-compat for every existing caller: "granted" means analytics is on.
  return record.categories.analytics ? "granted" : "denied";
}

/**
 * Read the stored record, upgrading a v1 decision to the v2 shape.
 *
 * Returns null for "no decision", corrupt storage, or an unusable shape —
 * always failing toward re-prompting rather than assuming consent.
 */
function readRecord(): ConsentRecord | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<ConsentRecord & LegacyConsentRecord>;

    if (parsed.version === 2 && parsed.categories && typeof parsed.categories === "object") {
      return {
        version: 2,
        decidedAt: parsed.decidedAt ?? new Date().toISOString(),
        categories: parsed.categories,
      };
    }

    // v1 -> v2. The single flag was always about analytics, so it maps
    // cleanly and the visitor keeps the decision they already made.
    if (parsed.status === "granted" || parsed.status === "denied") {
      return {
        version: 2,
        decidedAt: parsed.timestamp ?? new Date().toISOString(),
        categories: { analytics: parsed.status === "granted" },
      };
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Has this visitor agreed to a specific category?
 *
 * This is what a tracker should gate on — never `getConsent() === "granted"`,
 * which conflates every category into one answer.
 */
export function hasConsent(category: ConsentCategory): boolean {
  return readRecord()?.categories[category] === true;
}

/**
 * True when every ACTIVE category has an answer. False means the dialog should
 * show — including the case where a NEW category was added after the visitor
 * decided, so they are asked about that one alone rather than all over again.
 */
export function hasDecidedAll(): boolean {
  const record = readRecord();
  if (!record) return false;
  return ACTIVE_CATEGORY_IDS.every((id) => typeof record.categories[id] === "boolean");
}

/** Categories still awaiting an answer from this visitor. */
export function undecidedCategories(): ConsentCategory[] {
  const record = readRecord();
  return ACTIVE_CATEGORY_IDS.filter((id) => typeof record?.categories[id] !== "boolean");
}

/**
 * Persist the visitor's choice and propagate it to the analytics providers.
 *
 * - granted: enable PostHog (deferred init + first pageview) and tell gtag to
 *   flip analytics_storage to granted (gtag.js was loaded with a "denied"
 *   default via the Vite plugin, so it set no cookies until now).
 * - denied: tell gtag to keep analytics_storage denied and, only if PostHog was
 *   already initialized (e.g. it was granted earlier this session), opt it out.
 *   We do NOT touch an uninitialized PostHog — calling opt_out_capturing on it
 *   can throw or create storage, defeating the "block by default" guarantee.
 */
export function setConsent(granted: boolean): void {
  setCategoryConsent(Object.fromEntries(ACTIVE_CATEGORY_IDS.map((id) => [id, granted])));
}

/**
 * Record a per-category decision. This is the real entry point; setConsent()
 * is the all-or-nothing convenience wrapper the two-button dialog uses.
 *
 * MERGES with any previous answer rather than replacing it, so answering a
 * newly added category does not silently discard an earlier decision about
 * another one.
 */
export function setCategoryConsent(
  choices: Partial<Record<ConsentCategory, boolean>>,
): void {
  const previous = readRecord();
  const record: ConsentRecord = {
    version: 2,
    decidedAt: new Date().toISOString(),
    categories: { ...previous?.categories, ...choices },
  };

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(record));
  } catch {
    // Storage unavailable (private mode). We still apply the choice for this
    // session below; it just won't persist across reloads.
  }

  const granted = record.categories.analytics === true;
  // The cookie deliberately stays the v1 granted/denied shape: it exists only
  // for the Shopify checkout pixel (docs/shopify-checkout-pixel.md), which
  // cares about analytics and nothing else. Changing its format would break
  // that pixel for no benefit.
  writeConsentCookie(granted ? "granted" : "denied");

  if (granted) {
    enableAnalytics();
    // Sentry is in the same consent scope as analytics — it attaches a session
    // identifier and URL/breadcrumb data. It starts here and nowhere else.
    enableMonitoring();
    if (typeof window.gtag === "function") {
      window.gtag("consent", "update", { analytics_storage: "granted" });
    }
  } else {
    disableMonitoring();
    if (typeof window.gtag === "function") {
      window.gtag("consent", "update", { analytics_storage: "denied" });
    }
    // Only opt out if PostHog was actually initialized this session. On a first
    // visit it never was (blocked by default), and calling opt_out_capturing on
    // an uninitialized instance can throw or create storage.
    if (isAnalyticsInitialized()) {
      posthog.opt_out_capturing();
    }
  }

  notify(granted ? "granted" : "denied");
}

// ── Subscriber mechanism ──────────────────────────────────────────────────
// Lets the banner (and anything else) react when a decision is made, so it can
// hide itself without a full reload.
type ConsentListener = (status: ConsentStatus) => void;
const listeners = new Set<ConsentListener>();

function notify(status: ConsentStatus): void {
  listeners.forEach((cb) => {
    try {
      cb(status);
    } catch {
      // A misbehaving listener must not break consent propagation.
    }
  });
}

/** Subscribe to consent changes. Returns an unsubscribe function. */
export function onConsentChange(cb: ConsentListener): () => void {
  listeners.add(cb);
  return () => listeners.delete(cb);
}
