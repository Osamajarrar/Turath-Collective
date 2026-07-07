/**
 * Analytics helper — GA4 + PostHog
 *
 * GA4: the gtag script and initialization are injected at build time via
 * a Vite plugin into index.html, conditioned on VITE_GA_MEASUREMENT_ID.
 *
 * PostHog: initialized at runtime in main.tsx, conditioned on
 * VITE_POSTHOG_KEY. Provides session replay + funnels in one dashboard.
 *
 * trackEvent() fires to both providers whenever they're configured.
 * When neither is configured, calls are silent no-ops — safe to call
 * anywhere without checking configuration first.
 */
import posthog from "posthog-js";

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

let posthogInitialized = false;

/** Call once, at app startup (see main.tsx). No-op if VITE_POSTHOG_KEY is unset. */
export function initAnalytics() {
  const key = import.meta.env.VITE_POSTHOG_KEY;
  if (!key || posthogInitialized) return;

  posthog.init(key, {
    api_host: import.meta.env.VITE_POSTHOG_HOST || "https://us.i.posthog.com",
    person_profiles: "always",
    capture_pageview: true,
    capture_pageleave: true,
  });
  posthogInitialized = true;
}

/** Fire a custom event to GA4 and PostHog. No-op for any provider not configured. */
export function trackEvent(eventName: string, params?: Record<string, unknown>) {
  if (typeof window.gtag === "function") {
    window.gtag("event", eventName, params);
  }
  if (posthogInitialized) {
    posthog.capture(eventName, params);
  }
}

/**
 * Fire an event, then navigate away (full page load, e.g. Shopify checkout).
 *
 * Needed because both providers queue events: posthog-js batches captures for
 * up to ~3s and gtag sends asynchronously, so a plain trackEvent() followed by
 * `window.location.href = ...` usually loses the event. PostHog is told to
 * send via sendBeacon (survives page unload); GA4 gets an event_callback with
 * a timeout fallback so navigation never hangs on a blocked/slow tracker.
 */
export function trackEventThenNavigate(
  eventName: string,
  params: Record<string, unknown> | undefined,
  navigate: () => void,
) {
  if (posthogInitialized) {
    posthog.capture(eventName, params, { transport: "sendBeacon", send_instantly: true });
  }

  if (typeof window.gtag === "function") {
    let navigated = false;
    const go = () => {
      if (navigated) return;
      navigated = true;
      navigate();
    };
    window.gtag("event", eventName, { ...params, event_callback: go, event_timeout: 300 });
    setTimeout(go, 300);
  } else {
    navigate();
  }
}