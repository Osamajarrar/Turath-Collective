import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import AR_BASELINE from "./ar-parity-baseline.json";

// Catches the classic failure this repo is exposed to: a key added to EN and
// forgotten in FR/AR, so an Arabic visitor sees a raw `pages.product.title`
// instead of text. Every branch that adds a user-facing string can cause it.
//
// Only the five REGISTERED namespaces are checked — see client/src/lib/i18n.ts.
// translation.json is deliberately not registered and must not be added here;
// design-*.json are preview-only and are excluded on purpose.

const LOCALES_DIR = path.resolve(import.meta.dirname, "..", "client", "src", "locales");
const LOCALES = ["en", "fr", "ar"] as const;
const NAMESPACES = ["common", "pages", "commerce", "legal", "errors"] as const;

/** Flatten to dotted paths. Arrays are descended into by index, because the
 *  locale files hold arrays of objects (FAQ items, pillars) whose shape must
 *  also match across locales. */
function keyPaths(value: unknown, prefix = ""): string[] {
  if (Array.isArray(value)) {
    return value.flatMap((v, i) => keyPaths(v, `${prefix}[${i}]`));
  }
  if (value !== null && typeof value === "object") {
    return Object.entries(value as Record<string, unknown>).flatMap(([k, v]) =>
      keyPaths(v, prefix ? `${prefix}.${k}` : k),
    );
  }
  return [prefix];
}

function load(locale: string, ns: string): unknown {
  return JSON.parse(fs.readFileSync(path.join(LOCALES_DIR, locale, `${ns}.json`), "utf8"));
}

describe("i18n key parity", () => {
  it.each(NAMESPACES)("every locale file exists for %s", (ns) => {
    for (const locale of LOCALES) {
      expect(fs.existsSync(path.join(LOCALES_DIR, locale, `${ns}.json`))).toBe(true);
    }
  });

  describe.each(NAMESPACES)("%s", (ns) => {
    const en = new Set(keyPaths(load("en", ns)));

    // French is a live, user-selectable locale (SUPPORTED_LANGUAGES in
    // client/src/lib/i18n.ts) and a legal expectation for a Quebec business.
    // It must match EN exactly — no baseline, no exceptions.
    it("fr has exactly the same keys as en", () => {
      const fr = new Set(keyPaths(load("fr", ns)));

      expect(
        [...en].filter((k) => !fr.has(k)),
        `fr/${ns}.json is missing keys present in en — these fall back to English on a French page`,
      ).toEqual([]);
      expect(
        [...fr].filter((k) => !en.has(k)),
        `fr/${ns}.json has keys en does not — likely a rename that only landed in one locale`,
      ).toEqual([]);
    });

    // Arabic is translated but deliberately NOT exposed: its entry in
    // SUPPORTED_LANGUAGES is commented out, so no visitor can select it. It
    // carries 296 keys of known translation debt, recorded in
    // ar-parity-baseline.json.
    //
    // The assertion is therefore "no NEW drift": adding an EN key without an
    // AR one fails, and translating a baselined key also fails (asking you to
    // shrink the baseline). Before AR is re-enabled in the switcher, the
    // baseline must be empty and this test switched to the strict FR form.
    it("ar has no drift beyond the recorded baseline", () => {
      const ar = new Set(keyPaths(load("ar", ns)));
      const baselined = new Set<string>((AR_BASELINE as Record<string, string[]>)[ns] ?? []);

      const missing = [...en].filter((k) => !ar.has(k));

      expect(
        missing.filter((k) => !baselined.has(k)),
        `ar/${ns}.json is missing NEW keys. Translate them, or if that is deferred, ` +
          `regenerate test/ar-parity-baseline.json deliberately and say so in the PR`,
      ).toEqual([]);

      expect(
        [...baselined].filter((k) => !missing.includes(k)),
        `these ar/${ns}.json keys are now translated — remove them from ` +
          `test/ar-parity-baseline.json so the debt count stays honest`,
      ).toEqual([]);

      expect(
        [...ar].filter((k) => !en.has(k)),
        `ar/${ns}.json has keys en does not`,
      ).toEqual([]);
    });
  });

  it("no locale value is an empty string", () => {
    const empties: string[] = [];
    for (const locale of LOCALES) {
      for (const ns of NAMESPACES) {
        const data = load(locale, ns) as Record<string, unknown>;
        for (const keyPath of keyPaths(data)) {
          const resolved = keyPath
            .split(/\.|\[|\]/)
            .filter(Boolean)
            .reduce<any>((acc, seg) => acc?.[seg], data);
          if (resolved === "") empties.push(`${locale}/${ns}: ${keyPath}`);
        }
      }
    }
    expect(empties, "empty strings render as blank UI, not as a fallback").toEqual([]);
  });
});
