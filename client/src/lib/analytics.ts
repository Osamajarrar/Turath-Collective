/**
 * Google Analytics 4 helper
 *
 * The gtag script and initialization are injected at build time via
 * vite-plugin-html into index.html, conditioned on VITE_GA_MEASUREMENT_ID.
 *
 * This file provides a typed wrapper for optional custom event tracking.
 * When GA4 is not configured the functions are silent no-ops.
 */

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

/** Fire a custom GA4 event. No-op when GA4 is not configured. */
export function trackEvent(eventName: string, params?: Record<string, unknown>) {
  if (typeof window.gtag === "function") {
    window.gtag("event", eventName, params);
  }
}
