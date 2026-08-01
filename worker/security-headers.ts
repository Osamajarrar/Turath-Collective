/**
 * Security headers — the single source of truth.
 *
 * These previously existed TWICE: helmet in server/index.ts (which Vercel
 * never executed) and a hand-transcribed copy in vercel.json (which is what
 * production actually used). Keeping them in step was manual, and a missing
 * CSP origin fails SILENTLY in the browser — the script loads and no data
 * ever leaves the page. That is exactly how "analytics mysteriously stopped
 * working" happens.
 *
 * On Cloudflare there is one policy, defined here, applied to Worker
 * responses by middleware and to static asset responses by client/public/_headers.
 * client/public/_headers is generated from this file (npm run headers), so the two
 * cannot drift.
 *
 * ⚠ Transcribed literally from vercel.json during the migration —
 * behaviour-preserving. Do not "tidy" it. Every third-party origin the site
 * talks to must be named explicitly:
 *   - googletagmanager / google-analytics  → GA4
 *   - *.posthog.com                        → PostHog
 *   - *.ingest*.sentry.io                  → Sentry error reports
 *   - api.shopify.com / *.myshopify.com    → Storefront API
 *   - fonts.googleapis.com / gstatic.com   → Google Fonts
 */

const CSP_DIRECTIVES: Record<string, string[]> = {
  "default-src": ["'self'"],
  "script-src": [
    "'self'",
    "'unsafe-inline'",
    "https://www.googletagmanager.com",
    "https://www.google-analytics.com",
    "https://us-assets.i.posthog.com",
    "https://*.posthog.com",
  ],
  "style-src": ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
  "img-src": ["'self'", "https:", "data:"],
  "connect-src": [
    "'self'",
    "https://api.shopify.com",
    "https://*.myshopify.com",
    "https://cdn.shopify.com",
    "https://www.google-analytics.com",
    "https://*.google-analytics.com",
    "https://*.analytics.google.com",
    "https://*.googletagmanager.com",
    "https://us.i.posthog.com",
    "https://us-assets.i.posthog.com",
    "https://*.posthog.com",
    "https://*.ingest.sentry.io",
    "https://*.ingest.de.sentry.io",
    "https://*.ingest.us.sentry.io",
  ],
  "font-src": ["'self'", "https://fonts.gstatic.com"],
  "frame-src": ["'none'"],
  "object-src": ["'none'"],
  "base-uri": ["'self'"],
  "form-action": ["'self'"],
  "frame-ancestors": ["'none'"],
};

export function buildCsp(): string {
  const directives = Object.entries(CSP_DIRECTIVES).map(
    ([name, values]) => `${name} ${values.join(" ")}`,
  );
  // Valueless directive, so it is appended rather than joined from the map.
  directives.push("upgrade-insecure-requests");
  return directives.join("; ");
}

export const SECURITY_HEADERS: Record<string, string> = {
  "Content-Security-Policy": buildCsp(),
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",
  "X-Content-Type-Options": "nosniff",
  // Kept alongside frame-ancestors for pre-CSP browsers; the two must agree.
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  "Cross-Origin-Opener-Policy": "same-origin",
  "X-DNS-Prefetch-Control": "off",
};

/** Cache-Control rules, carried over from vercel.json. */
export const CACHE_RULES: Array<{ pattern: string; value: string }> = [
  // Vite writes content-hashed filenames here, so they are safe to pin.
  { pattern: "/assets/*", value: "public, max-age=31536000, immutable" },
  { pattern: "/*.png", value: "public, max-age=86400, stale-while-revalidate=604800" },
  { pattern: "/*.jpg", value: "public, max-age=86400, stale-while-revalidate=604800" },
  { pattern: "/*.ico", value: "public, max-age=86400, stale-while-revalidate=604800" },
  { pattern: "/*.svg", value: "public, max-age=86400, stale-while-revalidate=604800" },
  { pattern: "/*.webp", value: "public, max-age=86400, stale-while-revalidate=604800" },
];
