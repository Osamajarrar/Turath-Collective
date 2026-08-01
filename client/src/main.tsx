import "./lib/i18n";
import { createRoot } from "react-dom/client";
import App from "./App";
import { initAnalytics } from "./lib/analytics";
import { syncConsentCookie } from "./lib/consent";
import { initMonitoring } from "./lib/monitoring";
import "./index.css";

// Keep the consent cookie (read by the Shopify checkout pixel) in step with
// the localStorage decision, then start analytics and error monitoring. Both
// self-gate on that consent and do nothing without a stored "granted".
syncConsentCookie();
initAnalytics();
initMonitoring();

createRoot(document.getElementById("root")!).render(<App />);