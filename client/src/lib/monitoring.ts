/**
 * Error monitoring — Sentry (client-side only).
 *
 * Why it exists: PostHog answers *what people did*; Sentry answers *what
 * broke*. Once ad spend starts, a silently broken page burns real money, and
 * a broken checkout path is invisible in product analytics — it just looks
 * like people didn't convert. See DECISIONS.md §5.
 *
 * ── Consent ──────────────────────────────────────────────────────────────
 * Sentry is inside the Law 25 / PIPEDA consent scope, exactly like PostHog,
 * and is BLOCKED BY DEFAULT. It sets no storage and sends no request until the
 * visitor grants consent. This is not merely caution: Sentry attaches a
 * session identifier and URL/breadcrumb data, which is precisely the
 * non-essential collection the consent dialog is asking about.
 *
 * A crash before consent is therefore not reported. That is the correct
 * trade — an unconsented error report is still unconsented collection.
 *
 * ── PII ──────────────────────────────────────────────────────────────────
 * `sendDefaultPii` is off and beforeSend scrubs anything email-shaped from
 * the payload. The checkout-intent dialog (plan 11 branch 8) collects an email
 * address, and this repo has already leaked an email into event properties
 * once. Errors thrown near that form must not carry the address with them.
 */
import * as Sentry from "@sentry/react";
// Same import shape as analytics.ts: consent.ts calls enableMonitoring(), and
// this module reads back only the `getConsent` helper. The cycle is resolved
// at call time, never at module-evaluation time.
import { getConsent } from "./consent";

let initialized = false;

/** Redact anything email-shaped, wherever it appears in a string. */
const EMAIL_RE = /[^\s@"'<>()[\]{},;:]+@[^\s@"'<>()[\]{},;:]+\.[a-z]{2,}/gi;

export function scrubEmails<T>(value: T): T {
  if (typeof value === "string") {
    return value.replace(EMAIL_RE, "[redacted-email]") as unknown as T;
  }
  if (Array.isArray(value)) {
    return value.map(scrubEmails) as unknown as T;
  }
  if (value !== null && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      out[k] = scrubEmails(v);
    }
    return out as unknown as T;
  }
  return value;
}

/**
 * Start Sentry. Called only from the consent layer on "granted", and from
 * app startup when a prior "granted" decision exists.
 *
 * Idempotent, and a no-op when VITE_SENTRY_DSN is unset — which is the normal
 * state in local development, so nothing here needs a separate dev guard.
 */
export function enableMonitoring(): void {
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  if (!dsn || initialized) return;

  Sentry.init({
    dsn,
    environment: import.meta.env.MODE,
    // Never attach IP addresses, cookies or headers automatically.
    sendDefaultPii: false,
    // Performance and replay are off: replay in particular would record the
    // checkout-intent form's contents, and neither is worth the extra consent
    // surface or bundle weight for an MVP demand test.
    tracesSampleRate: 0,
    beforeSend(event) {
      return scrubEmails(event);
    },
    beforeBreadcrumb(breadcrumb) {
      return scrubEmails(breadcrumb);
    },
  });

  initialized = true;
}

/**
 * Call once at app startup (see main.tsx). Self-gates on consent: starts
 * Sentry only when a prior "granted" decision exists. With no decision or a
 * "denied" one, Sentry is never touched — no storage, no network request.
 *
 * Mirrors initAnalytics() in analytics.ts deliberately: two providers, one
 * gate, same shape, so neither can drift out of the consent scope unnoticed.
 */
export function initMonitoring(): void {
  if (getConsent() !== "granted") return;
  enableMonitoring();
}

/** True once Sentry has actually been started this session. */
export function isMonitoringInitialized(): boolean {
  return initialized;
}

/**
 * Stop reporting after a visitor withdraws consent. Sentry has no true
 * "uninit", so the client is closed; it stays closed for the session.
 */
export function disableMonitoring(): void {
  if (!initialized) return;
  Sentry.getClient()?.close();
  initialized = false;
}
