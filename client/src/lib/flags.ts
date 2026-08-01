// Central build-time UI feature flags. All values come from Vite env vars and
// are BAKED AT BUILD TIME — changing one in Vercel needs a fresh build, and a
// local change needs a dev-server restart.

// ── Demo mode (LOCAL DEV ONLY — NEVER SET IN VERCEL) ─────────────────────────
// VITE_DEMO_MODE=true is a master switch that forces every mock/placeholder
// flag below to its "on" state so the full intended site experience can be
// previewed locally: mock product catalog, fake review/social-proof
// placeholders, the shipping promo surfaces (with a placeholder $75 threshold
// when no real one is set), and the full site instead of the coming-soon page.
//
// It exists purely for the founder's own .env.local during design/layout
// review. It must NEVER be set in any Vercel environment (dev, test, or main):
// a deployed build with this flag would show FAKE reviews, FAKE social posts,
// and a FAKE shipping offer to real visitors — exactly the dishonest content
// this project's honesty framework exists to prevent. If you are reading this
// while configuring Vercel: do not add this variable.
export const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === "true";

// ── Mock product catalog ──────────────────────────────────────────────────────
// Local mock products instead of the Shopify Storefront API.
export const USE_MOCK_PRODUCTS =
  DEMO_MODE || import.meta.env.VITE_USE_MOCK_PRODUCTS === "true";

// ── Placeholder review / social-proof content ────────────────────────────────
// Fake testimonials and fake Instagram posts, for structural/layout testing
// only. Never set VITE_SHOW_PLACEHOLDER_CONTENT in Vercel either — same
// honesty rules as DEMO_MODE apply.
export const SHOW_PLACEHOLDER_CONTENT =
  DEMO_MODE || import.meta.env.VITE_SHOW_PLACEHOLDER_CONTENT === "true";

// ── Notify-me (back-in-stock) capture ────────────────────────────────────────
// The out-of-stock "Notify Me" control collects an email and then does nothing
// with it — the submit handler only logged to the console, so a customer who
// used it believed they had subscribed when no record existed anywhere. That
// is the same honesty problem as fake reviews, so the control is off until a
// real backend exists.
//
// Turn this on in the branch that wires the capture to Resend (plan 11 branch
// 8), together with the CASL consent split — "tell me when this is available"
// and "sign me up for the newsletter" are two separate consents.
export const NOTIFY_ME_ENABLED =
  import.meta.env.VITE_NOTIFY_ME_ENABLED === "true";

// ── Coming-soon gate ──────────────────────────────────────────────────────────
// VITE_COMING_SOON=true swaps the homepage for the coming-soon page. Demo mode
// forces the full site so the real homepage is what gets reviewed.
export const COMING_SOON =
  !DEMO_MODE && import.meta.env.VITE_COMING_SOON === "true";

// ── Shipping promo (announcement bar + cart progress bar) ────────────────────
// One gate for both surfaces. The announcement bar and the cart-drawer
// free-shipping progress bar advertise the same offer, so they must never be
// enabled independently: VITE_SHOW_SHIPPING_PROMO turns them on together, and
// VITE_FREE_SHIPPING_THRESHOLD supplies the CAD amount the offer is measured
// against. Both stay off by default because there is no finalized
// pricing/shipping policy yet. Setting the gate to "true" asserts the offer is
// real, and that the announcement copy (locales */common.json → "announcement")
// and the shipping policy page state the same threshold.
//
// Demo mode forces the promo on; if no real threshold is set it uses an
// obviously-placeholder $75 so the layouts are visible. That number asserts
// nothing — it must never reach a deployed build (see DEMO_MODE above).
const SHOW_SHIPPING_PROMO = import.meta.env.VITE_SHOW_SHIPPING_PROMO === "true";

const DEMO_PLACEHOLDER_THRESHOLD = 75;
const rawThreshold = import.meta.env.VITE_FREE_SHIPPING_THRESHOLD;
const envThreshold = rawThreshold ? Number(rawThreshold) : NaN;
const hasEnvThreshold = Number.isFinite(envThreshold) && envThreshold > 0;

/** CAD free-shipping threshold. Only meaningful when SHIPPING_PROMO_ENABLED. */
export const FREE_SHIPPING_THRESHOLD = hasEnvThreshold
  ? envThreshold
  : DEMO_MODE
    ? DEMO_PLACEHOLDER_THRESHOLD
    : NaN;

/**
 * True only when the promo is switched on AND a valid threshold is set —
 * neither the announcement bar nor the progress bar renders without both.
 * (Demo mode forces both conditions.)
 */
export const SHIPPING_PROMO_ENABLED =
  DEMO_MODE || (SHOW_SHIPPING_PROMO && hasEnvThreshold);
