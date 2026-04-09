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
      },
      fr: {
        common: frCommon,
        pages: frPages,
        commerce: frCommerce,
        legal: frLegal,
        errors: frErrors,
      },
      ar: {
        common: arCommon,
        pages: arPages,
        commerce: arCommerce,
        legal: arLegal,
        errors: arErrors,
      },
    },
    fallbackLng: "en",
    fallbackNS: "common",
    ns: ["common", "pages", "commerce", "legal", "errors"],
    defaultNS: "common",
    supportedLngs: ["en", "fr", "ar"],
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
      lookupLocalStorage: "turath_lang",
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

export const SUPPORTED_LANGUAGES = [
  { code: "en", label: "EN", full: "English" },
  { code: "fr", label: "FR", full: "Français" },
  // { code: "ar", label: "AR", full: "العربية" },
] as const;

export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number]["code"];
