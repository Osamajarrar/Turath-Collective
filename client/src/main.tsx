import "./lib/i18n";
import { createRoot } from "react-dom/client";
import App from "./App";
import { initAnalytics } from "./lib/analytics";
import { syncConsentCookie } from "./lib/consent";
import "./index.css";

// Keep the consent cookie (read by the Shopify checkout pixel) in step with
// the localStorage decision, then init analytics (self-gated on that consent).
syncConsentCookie();
initAnalytics();

createRoot(document.getElementById("root")!).render(<App />);