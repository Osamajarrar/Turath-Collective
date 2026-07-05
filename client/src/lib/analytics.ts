/**
 * Google Analytics 4 helper
 *
 * The gtag script and initialization are injected at build time via
 * vite-plugin-html into index.html, conditioned on VITE_GA_MEASUREMENT_ID.
 */

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

// GA4 is configured via environment variable VITE_GA_MEASUREMENT_ID
// Custom event tracking can be added here if needed in the future
