import "./lib/i18n";
import { createRoot } from "react-dom/client";
import App from "./App";
import { initAnalytics } from "./lib/analytics";
import { applyImplicitConsent, syncConsentCookie } from "./lib/consent";
import { CONSENT_BAR_ENABLED } from "./lib/flags";
import { initMonitoring } from "./lib/monitoring";
import "./index.css";

// Analytics start one of two ways, decided by VITE_CONSENT_BAR_SHOWN (flags.ts).
//
// Bar ON: keep the consent cookie (read by the Shopify checkout pixel) in step
// with the localStorage decision, then start analytics and error monitoring.
// Both self-gate on consent and do nothing without a stored "granted".
//
// Bar OFF: there is no banner to answer, so start them for everyone here.
if (CONSENT_BAR_ENABLED) {
  syncConsentCookie();
  initAnalytics();
} else {
  applyImplicitConsent();
}
initMonitoring();

createRoot(document.getElementById("root")!).render(<App />);
