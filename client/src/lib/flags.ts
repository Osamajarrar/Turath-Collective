// Central build-time UI feature flags. All values come from Vite env vars and
// are BAKED AT BUILD TIME — changing one in Vercel needs a fresh build, and a
// local change needs a dev-server restart.

// ── Shipping promo (announcement bar + cart progress bar) ────────────────────
// One gate for both surfaces. The announcement bar and the cart-drawer
// free-shipping progress bar advertise the same offer, so they must never be
// enabled independently: VITE_SHOW_SHIPPING_PROMO turns them on together, and
// VITE_FREE_SHIPPING_THRESHOLD supplies the CAD amount the offer is measured
// against. Both stay off by default because there is no finalized
// pricing/shipping policy yet. Setting the gate to "true" asserts the offer is
// real, and that the announcement copy (locales */common.json → "announcement")
// and the shipping policy page state the same threshold.
const SHOW_SHIPPING_PROMO = import.meta.env.VITE_SHOW_SHIPPING_PROMO === "true";

const rawThreshold = import.meta.env.VITE_FREE_SHIPPING_THRESHOLD;
const threshold = rawThreshold ? Number(rawThreshold) : NaN;

/** CAD free-shipping threshold. Only meaningful when SHIPPING_PROMO_ENABLED. */
export const FREE_SHIPPING_THRESHOLD = threshold;

/**
 * True only when the promo is switched on AND a valid threshold is set —
 * neither the announcement bar nor the progress bar renders without both.
 */
export const SHIPPING_PROMO_ENABLED =
  SHOW_SHIPPING_PROMO && Number.isFinite(threshold) && threshold > 0;
