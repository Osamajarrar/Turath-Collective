import { describe, it, expect, vi, beforeEach } from "vitest";

const Sentry = vi.hoisted(() => ({
  init: vi.fn(),
  getClient: vi.fn(() => ({ close: vi.fn() })),
}));
vi.mock("@sentry/react", () => Sentry);

const posthog = vi.hoisted(() => ({
  init: vi.fn(),
  capture: vi.fn(),
  opt_out_capturing: vi.fn(),
}));
vi.mock("posthog-js", () => ({ default: posthog }));

import {
  initMonitoring,
  isMonitoringInitialized,
  scrubEmails,
  disableMonitoring,
} from "./monitoring";
import { setConsent } from "./consent";

const STORAGE_KEY = "turath-consent";

beforeEach(() => {
  // Sentry's initialised flag is module state that outlives a single test;
  // without this, a later test sees init() already done and never called again.
  disableMonitoring();
  vi.clearAllMocks();
  localStorage.clear();
  window.gtag = vi.fn();
  vi.unstubAllEnvs();
});

describe("Sentry is blocked until consent", () => {
  it("does not initialise with no decision", () => {
    vi.stubEnv("VITE_SENTRY_DSN", "https://abc@o1.ingest.sentry.io/1");
    initMonitoring();
    expect(Sentry.init).not.toHaveBeenCalled();
    expect(isMonitoringInitialized()).toBe(false);
  });

  it("does not initialise when consent is denied", () => {
    vi.stubEnv("VITE_SENTRY_DSN", "https://abc@o1.ingest.sentry.io/1");
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ status: "denied", timestamp: new Date().toISOString() }),
    );
    initMonitoring();
    expect(Sentry.init).not.toHaveBeenCalled();
  });

  it("does not initialise on decline, even mid-session", () => {
    vi.stubEnv("VITE_SENTRY_DSN", "https://abc@o1.ingest.sentry.io/1");
    setConsent(false);
    expect(Sentry.init).not.toHaveBeenCalled();
  });

  it("stays a no-op when no DSN is configured", () => {
    // Stub explicitly rather than relying on the ambient env: a developer with
    // a real VITE_SENTRY_DSN in .env.local would otherwise fail this test.
    vi.stubEnv("VITE_SENTRY_DSN", "");
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ status: "granted", timestamp: new Date().toISOString() }),
    );
    initMonitoring();
    expect(Sentry.init).not.toHaveBeenCalled();
  });
});

describe("Sentry configuration", () => {
  it("never sends default PII and does not sample traces", () => {
    vi.stubEnv("VITE_SENTRY_DSN", "https://abc@o1.ingest.sentry.io/1");
    setConsent(true);

    expect(Sentry.init).toHaveBeenCalledOnce();
    const options = Sentry.init.mock.calls[0][0] as any;
    expect(options.sendDefaultPii).toBe(false);
    // Session replay would record the checkout-intent form's contents.
    expect(options.tracesSampleRate).toBe(0);
    expect(typeof options.beforeSend).toBe("function");
  });
});

describe("scrubEmails", () => {
  it("redacts an address in a message string", () => {
    expect(scrubEmails("failed for buyer@example.com while saving")).toBe(
      "failed for [redacted-email] while saving",
    );
  });

  it("redacts addresses nested in objects and arrays", () => {
    const event = {
      message: "contact a@b.co",
      extra: { list: ["x", "someone@turathcollective.com"], nested: { to: "c@d.org" } },
    };
    const scrubbed = scrubEmails(event);
    const serialized = JSON.stringify(scrubbed);
    expect(serialized).not.toContain("@b.co");
    expect(serialized).not.toContain("someone@turathcollective.com");
    expect(serialized).not.toContain("c@d.org");
    expect(serialized.match(/\[redacted-email\]/g)).toHaveLength(3);
  });

  it("redacts an address embedded in a URL query string", () => {
    // The checkout-intent dialog posts an email; a breadcrumb could capture it.
    const scrubbed = scrubEmails("POST /api/reserve?email=buyer@example.com");
    expect(scrubbed).not.toContain("buyer@example.com");
  });

  it("leaves non-email text alone", () => {
    expect(scrubEmails("no address here @ all")).toBe("no address here @ all");
    expect(scrubEmails(42 as unknown as string)).toBe(42);
    expect(scrubEmails(null as unknown as string)).toBeNull();
  });

  it("is what beforeSend actually applies", () => {
    vi.stubEnv("VITE_SENTRY_DSN", "https://abc@o1.ingest.sentry.io/1");
    setConsent(true);
    const { beforeSend } = Sentry.init.mock.calls[0][0] as any;

    const out = beforeSend({ message: "boom for buyer@example.com" });
    expect(JSON.stringify(out)).not.toContain("buyer@example.com");
  });
});
