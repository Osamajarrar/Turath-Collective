import { describe, it, expect, vi, beforeEach } from "vitest";

// The compliance guarantee is "nothing runs before a choice". That is easy to
// break invisibly — a stray posthog.init, an opt_out call that creates storage,
// a gtag default flipped to granted — so it is asserted here directly.

const posthog = vi.hoisted(() => ({
  init: vi.fn(),
  capture: vi.fn(),
  opt_out_capturing: vi.fn(),
}));

vi.mock("posthog-js", () => ({ default: posthog }));

import {
  getConsent,
  setConsent,
  setCategoryConsent,
  hasConsent,
  hasDecidedAll,
  undecidedCategories,
  onConsentChange,
  syncConsentCookie,
} from "./consent";
import { initAnalytics, isAnalyticsInitialized } from "./analytics";

const STORAGE_KEY = "turath-consent";

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
  document.cookie
    .split(";")
    .forEach((c) => (document.cookie = `${c.split("=")[0].trim()}=; max-age=0; path=/`));
  window.gtag = vi.fn();
});

describe("getConsent — fail closed", () => {
  it("returns null for a fresh visitor", () => {
    expect(getConsent()).toBeNull();
  });

  it.each([
    ["corrupt JSON", "{not json"],
    ["a valid JSON object with no status", '{"timestamp":"x"}'],
    ["an unrecognised status", '{"status":"maybe"}'],
    ["an empty string", ""],
  ])("returns null (re-prompt) for %s rather than assuming consent", (_label, raw) => {
    localStorage.setItem(STORAGE_KEY, raw);
    expect(getConsent()).toBeNull();
  });

  it("reads back a stored decision", () => {
    setConsent(true);
    expect(getConsent()).toBe("granted");
    setConsent(false);
    expect(getConsent()).toBe("denied");
  });
});

describe("setConsent — analytics propagation", () => {
  it("records a timestamp with the decision (Law 25 proof of consent)", () => {
    setConsent(true);
    const record = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
    // v2 shape — see the category-keyed block below for why.
    expect(record.categories.analytics).toBe(true);
    expect(Number.isNaN(Date.parse(record.decidedAt))).toBe(false);
  });

  it("grants gtag analytics_storage only on accept", () => {
    setConsent(true);
    expect(window.gtag).toHaveBeenCalledWith("consent", "update", {
      analytics_storage: "granted",
    });
  });

  it("keeps gtag analytics_storage denied on decline", () => {
    setConsent(false);
    expect(window.gtag).toHaveBeenCalledWith("consent", "update", {
      analytics_storage: "denied",
    });
    expect(window.gtag).not.toHaveBeenCalledWith(
      "consent",
      "update",
      expect.objectContaining({ analytics_storage: "granted" }),
    );
  });

  it("does NOT touch an uninitialized PostHog when declining", () => {
    // opt_out_capturing on an uninitialized instance can throw or create
    // storage — which would defeat the block-by-default guarantee outright.
    setConsent(false);
    expect(posthog.opt_out_capturing).not.toHaveBeenCalled();
    expect(posthog.init).not.toHaveBeenCalled();
  });

  it("mirrors the decision into a cookie for the checkout-domain pixel", () => {
    // localStorage does not cross to checkout.turathcollective.com; the cookie
    // is the only channel the Shopify pixel can read.
    setConsent(true);
    expect(document.cookie).toContain("turath-consent=granted");
  });

  it("notifies subscribers so the dialog can close without a reload", () => {
    const seen: string[] = [];
    const off = onConsentChange((s) => seen.push(s));
    setConsent(true);
    off();
    setConsent(false);
    expect(seen).toEqual(["granted"]);
  });

  it("survives a listener that throws", () => {
    const off1 = onConsentChange(() => {
      throw new Error("bad listener");
    });
    const seen: string[] = [];
    const off2 = onConsentChange((s) => seen.push(s));
    expect(() => setConsent(true)).not.toThrow();
    expect(seen).toEqual(["granted"]);
    off1();
    off2();
  });
});

describe("syncConsentCookie", () => {
  it("re-mirrors an existing decision", () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ status: "granted", timestamp: new Date().toISOString() }),
    );
    syncConsentCookie();
    expect(document.cookie).toContain("turath-consent=granted");
  });

  it("writes nothing when no decision exists", () => {
    syncConsentCookie();
    expect(document.cookie).not.toContain("turath-consent=");
  });
});

describe("initAnalytics — blocked by default", () => {
  it("does not initialise PostHog with no decision", () => {
    initAnalytics();
    expect(posthog.init).not.toHaveBeenCalled();
    expect(isAnalyticsInitialized()).toBe(false);
  });

  it("does not initialise PostHog when denied", () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ status: "denied", timestamp: new Date().toISOString() }),
    );
    initAnalytics();
    expect(posthog.init).not.toHaveBeenCalled();
  });
});

describe("category-keyed record (v2)", () => {
  it("stores a category map, not a single flag", () => {
    setConsent(true);
    const record = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
    expect(record.version).toBe(2);
    expect(record.categories).toEqual({ analytics: true });
    expect(Number.isNaN(Date.parse(record.decidedAt))).toBe(false);
  });

  it("hasConsent answers per category", () => {
    setConsent(true);
    expect(hasConsent("analytics")).toBe(true);
    // Never consented to, because it does not exist yet — must NOT inherit
    // the analytics answer, or adding a pixel later would fire without consent.
    expect(hasConsent("marketing")).toBe(false);
  });

  it("upgrades a v1 record in place, so nobody is re-prompted", () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ status: "granted", timestamp: "2026-01-01T00:00:00.000Z" }),
    );
    expect(getConsent()).toBe("granted");
    expect(hasConsent("analytics")).toBe(true);
    expect(hasDecidedAll()).toBe(true);
    expect(undecidedCategories()).toEqual([]);
  });

  it("upgrades a v1 denial without turning it into consent", () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ status: "denied", timestamp: "2026-01-01T00:00:00.000Z" }),
    );
    expect(hasConsent("analytics")).toBe(false);
    expect(hasDecidedAll()).toBe(true);
  });

  it("treats an unanswered category as undecided, not as refused", () => {
    // The distinction that makes adding a category cheap: a missing entry
    // re-prompts for that category alone rather than for everything.
    setCategoryConsent({ marketing: true });
    expect(hasDecidedAll()).toBe(false);
    expect(undecidedCategories()).toContain("analytics");
  });

  it("merges a new answer with previous ones instead of replacing them", () => {
    setConsent(true);
    setCategoryConsent({ marketing: false });
    expect(hasConsent("analytics")).toBe(true);
    expect(hasConsent("marketing")).toBe(false);
  });

  it("keeps the cookie in the v1 shape the Shopify pixel reads", () => {
    // The checkout pixel parses granted|denied. Changing that format would
    // break it silently for no benefit.
    setConsent(true);
    expect(document.cookie).toContain("turath-consent=granted");
  });

  it("fails closed on a corrupt v2 record", () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 2, categories: "nope" }));
    expect(getConsent()).toBeNull();
    expect(hasConsent("analytics")).toBe(false);
    expect(hasDecidedAll()).toBe(false);
  });
});
