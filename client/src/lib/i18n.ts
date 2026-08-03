import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

// English namespaces
import enCommon from "../locales/en/common.json";
import enPages from "../locales/en/pages.json";
import enCommerce from "../locales/en/commerce.json";
import enLegal from "../locales/en/legal.json";
import enErrors from "../locales/en/errors.json";

// French namespaces
import frCommon from "../locales/fr/common.json";
import frPages from "../locales/fr/pages.json";
import frCommerce from "../locales/fr/commerce.json";
import frLegal from "../locales/fr/legal.json";
import frErrors from "../locales/fr/errors.json";

// Arabic namespaces
import arCommon from "../locales/ar/common.json";
import arPages from "../locales/ar/pages.json";
import arCommerce from "../locales/ar/commerce.json";
import arLegal from "../locales/ar/legal.json";
import arErrors from "../locales/ar/errors.json";

// Homepage design-variant preview namespaces (/design). Preview-only — see
// client/src/design-variants/locales.ts. Remove with the rest of the gallery.
import {
  designVariantResources,
  designVariantNamespaces,
} from "../design-variants/locales";

/**
 * The locales a visitor can actually reach — the SINGLE source of truth.
 *
 * Arabic is fully translated and stays in the bundle, but is not enabled:
 * uncomment it here and it becomes selectable everywhere at once (language
 * switcher, coming-soon page, and the browser-language detector below).
 *
 * ⚠ Before re-enabling `ar`: test/ar-parity-baseline.json records ~297 keys
 * that are still missing from the Arabic files. Shipping it while that
 * baseline is non-empty means Arabic visitors see English fallback text on
 * whole pages.
 */
export const SUPPORTED_LANGUAGES = [
  { code: "en", label: "EN", full: "English" },
  { code: "fr", label: "FR", full: "Français" },
  // { code: "ar", label: "AR", full: "العربية" },
] as const;

export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number]["code"];

const ENABLED_CODES = SUPPORTED_LANGUAGES.map((l) => l.code) as unknown as string[];

const LANG_STORAGE_KEY = "turath_lang";

/**
 * Drop a persisted language that is no longer enabled.
 *
 * Without this, anyone who selected Arabic while it was offered — including on
 * the coming-soon page, which used to list it — is stuck: i18next restores
 * `ar` from localStorage on every load, and the navbar switcher does not offer
 * it, so there is no way back to English through the UI.
 *
 * Runs BEFORE init so the detector never sees the stale value.
 */
function clearDisabledStoredLanguage() {
  try {
    const stored = window.localStorage.getItem(LANG_STORAGE_KEY);
    if (stored && !ENABLED_CODES.includes(stored)) {
      window.localStorage.removeItem(LANG_STORAGE_KEY);
    }
  } catch {
    // Storage unavailable (private mode) — the detector falls back to
    // navigator, which supportedLngs already constrains.
  }
}

clearDisabledStoredLanguage();

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        common: enCommon,
        pages: enPages,
        commerce: enCommerce,
        legal: enLegal,
        errors: enErrors,
        ...designVariantResources.en,
      },
      fr: {
        common: frCommon,
        pages: frPages,
        commerce: frCommerce,
        legal: frLegal,
        errors: frErrors,
        ...designVariantResources.fr,
      },
      ar: {
        common: arCommon,
        pages: arPages,
        commerce: arCommerce,
        legal: arLegal,
        errors: arErrors,
        ...designVariantResources.ar,
      },
    },
    fallbackLng: "en",
    fallbackNS: "common",
    ns: ["common", "pages", "commerce", "legal", "errors", ...designVariantNamespaces],
    defaultNS: "common",
    // Derived, NOT a second hardcoded list: with "ar" here the detector would
    // pick Arabic straight from navigator.languages for anyone whose browser
    // lists it, even though the switcher offers no way back.
    supportedLngs: ENABLED_CODES,
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
      lookupLocalStorage: LANG_STORAGE_KEY,
    },
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;

/** Apply/remove dir="rtl" on <html> based on the active language */
export function applyRtl(lng: string) {
  const html = document.documentElement;
  if (lng === "ar") {
    html.setAttribute("dir", "rtl");
    html.setAttribute("lang", "ar");
  } else {
    html.setAttribute("dir", "ltr");
    html.setAttribute("lang", lng);
  }
}

// Apply correct direction immediately at module load time
// (before React renders) to avoid a flash of wrong-direction text
// when the user's persisted language is Arabic.
applyRtl(i18n.language);
