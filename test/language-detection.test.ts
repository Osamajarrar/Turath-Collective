import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

/**
 * Arabic is translated but NOT enabled. Two separate mistakes could ship it,
 * and both actually happened:
 *
 *  1. `supportedLngs` listing "ar" while the switcher does not — the browser
 *     language detector then selects Arabic for anyone whose navigator lists
 *     it, and the UI offers no way back to English.
 *  2. A page keeping its own hardcoded locale array. coming-soon.tsx did, so
 *     it offered Arabic after the navbar stopped, and because the choice is
 *     cached in localStorage it left the whole site in Arabic permanently.
 *
 * These assert the source, not the runtime, because the failure is a
 * SECOND LIST existing at all — which no runtime test would notice.
 */

const ROOT = path.resolve(import.meta.dirname, "..");
const read = (p: string) => fs.readFileSync(path.join(ROOT, p), "utf8");

const i18nSource = read("client/src/lib/i18n.ts");

describe("enabled locales have exactly one owner", () => {
  it("supportedLngs is derived, not a hardcoded array", () => {
    expect(
      /supportedLngs:\s*ENABLED_CODES/.test(i18nSource),
      "supportedLngs must follow SUPPORTED_LANGUAGES, or the detector can pick a locale the UI cannot leave",
    ).toBe(true);
    expect(/supportedLngs:\s*\[/.test(i18nSource)).toBe(false);
  });

  it("Arabic is not currently enabled", () => {
    // If this fails deliberately, first empty test/ar-parity-baseline.json —
    // ~297 keys are still untranslated, so enabling it now shows English
    // fallback text on whole pages.
    const block = i18nSource.match(/export const SUPPORTED_LANGUAGES = \[([\s\S]*?)\] as const;/)![1];
    const enabled = [...block.matchAll(/^\s*\{\s*code:\s*"(\w+)"/gm)].map((m) => m[1]);
    expect(enabled).toEqual(["en", "fr"]);
  });

  it("clears a persisted language that is no longer enabled", () => {
    // Without this, anyone already holding turath_lang=ar stays stuck.
    expect(i18nSource).toContain("clearDisabledStoredLanguage");
    expect(/removeItem\(LANG_STORAGE_KEY\)/.test(i18nSource)).toBe(true);
  });

  it("no page keeps its own locale list", () => {
    const pages = fs
      .readdirSync(path.join(ROOT, "client/src/pages"))
      .filter((f) => f.endsWith(".tsx"));

    // Strip comments first: prose explaining the old ["en","fr","ar"] mistake
    // would otherwise trip this and make the test fail on its own docs.
    const stripComments = (s: string) =>
      s.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");

    for (const file of pages) {
      const source = stripComments(read(`client/src/pages/${file}`));
      expect(
        /\[\s*"en"\s*,\s*"fr"\s*,\s*"ar"\s*\]/.test(source),
        `${file} hardcodes a locale list — derive it from SUPPORTED_LANGUAGES instead`,
      ).toBe(false);
    }
  });
});
