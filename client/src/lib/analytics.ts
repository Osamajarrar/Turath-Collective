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
import { getConsent } from "./consent";

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

let posthogInitialized = false;

const POSTHOG_OPTIONS = {
  api_host: import.meta.env.VITE_POSTHOG_HOST || "https://us.i.posthog.com",
  person_profiles: "always" as const,
  // We fire the initial $pageview manually in enableAnalytics() so exactly one
  // pageview is recorded whether consent is granted at page load or mid-session.
  // (posthog's automatic capture_pageview fires during init() regardless of
  // timing, which would double-count against our manual capture.)
  capture_pageview: false,
  capture_pageleave: true,
};

/**
 * Perform the deferred PostHog init. Called by the consent layer the moment a
 * visitor grants consent, and by initAnalytics() on subsequent loads once the
 * decision is already "granted".
 *
 * Idempotent: safe to call more than once. On first successful init it also
 * fires a manual $pageview, because posthog's automatic initial-pageview moment
 * has already passed by the time consent is granted mid-session.
 */
export function enableAnalytics() {
  const key = import.meta.env.VITE_POSTHOG_KEY;
  if (!key || posthogInitialized) return;

  posthog.init(key, POSTHOG_OPTIONS);
  posthogInitialized = true;

  // The automatic initial pageview fires inside posthog.init only when the SDK
  // loads at page start. When consent is granted after the page is already
  // interactive, capture the current page explicitly.
  posthog.capture("$pageview");
}

/** True once PostHog has actually been initialized this session. */
export function isAnalyticsInitialized() {
  return posthogInitialized;
}

/**
 * Call once, at app startup (see main.tsx). Self-gates on consent: only inits
 * PostHog when a prior "granted" decision exists. With no decision or a "denied"
 * decision, PostHog is never touched — no cookies, storage, or network requests
 * exist (the strongest opt-in guarantee). No-op if VITE_POSTHOG_KEY is unset.
 */
export function initAnalytics() {
  if (getConsent() !== "granted") return;
  enableAnalytics();
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