/**
 * PII scrubbing for error reports — shared by the browser SDK
 * (client/src/lib/monitoring.ts) and the Worker SDK (worker/index.ts).
 *
 * It lives here rather than in either one because both send to Sentry and both
 * must redact identically. A second copy would drift, and the copy that drifted
 * would be the one that leaked. This repo has already put an email into an
 * analytics property once.
 *
 * What makes this necessary on BOTH sides: the checkout-intent dialog and the
 * contact form POST an email address. A client-side breadcrumb can capture the
 * request URL; a Worker-side exception can carry the parsed body in its
 * message. Either path reaches Sentry.
 */

/** Redact anything email-shaped, wherever it appears in a string. */
const EMAIL_RE = /[^\s@"'<>()[\]{},;:]+@[^\s@"'<>()[\]{},;:]+\.[a-z]{2,}/gi;

/**
 * Walk any value and replace email-shaped substrings with a marker.
 *
 * Recurses through arrays and plain objects so a nested `extra.body.email`
 * is caught as reliably as a top-level message. Non-strings pass through
 * untouched.
 */
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
