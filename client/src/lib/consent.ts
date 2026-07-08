/**
 * Consent gating — PIPEDA / Quebec Law 25 opt-in model.
 *
 * Analytics are BLOCKED BY DEFAULT. Nothing (PostHog, GA4 measurement hits)
 * runs until the visitor explicitly grants consent. Two equal-weight choices:
 * "granted" (accept analytics) or "denied" (essential only). We persist the
 * decision in localStorage and only re-prompt when no decision exists.
 *
 * Storage shape (key `turath-consent`):
 *   { "status": "granted" | "denied", "timestamp": "<ISO string>" }
 *
 * Import direction: consent.ts imports from analytics.ts (one-way) to avoid a
 * circular dependency — analytics.ts only imports the read helper `getConsent`.
 */
import posthog from "posthog-js";
import { enableAnalytics, isAnalyticsInitialized } from "./analytics";

const STORAGE_KEY = "turath-consent";

export type ConsentStatus = "granted" | "denied";

declare global {
  interface Window {
    // gtag is also declared in analytics.ts; kept optional here for the guard.
    gtag?: (...args: unknown[]) => void;
  }
}

type ConsentRecord = {
  status: ConsentStatus;
  timestamp: string;
};

/**
 * Read the stored decision. Returns null when no decision has been made yet
 * (fresh visitor) or when storage is unavailable/corrupt (private mode, manual
 * tampering) — treating those as "not decided" so we re-prompt rather than
 * silently assuming consent.
 */
export function getConsent(): ConsentStatus | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<ConsentRecord>;
    if (parsed.status === "granted" || parsed.status === "denied") {
      return parsed.status;
    }
    return null;
  } catch {
    return null;
  }
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
  const record: ConsentRecord = {
    status: granted ? "granted" : "denied",
    timestamp: new Date().toISOString(),
  };
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(record));
  } catch {
    // Storage unavailable (private mode). We still apply the choice for this
    // session below; it just won't persist across reloads.
  }

  if (granted) {
    enableAnalytics();
    if (typeof window.gtag === "function") {
      window.gtag("consent", "update", { analytics_storage: "granted" });
    }
  } else {
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

  notify(record.status);
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
