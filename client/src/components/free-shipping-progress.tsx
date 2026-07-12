import { useTranslation } from "react-i18next";

// Free-shipping progress indicator for the cart drawer.
// There is no finalized free-shipping policy yet, so this renders nothing
// until VITE_FREE_SHIPPING_THRESHOLD is set to a real CAD amount. Setting the
// env var asserts the policy is real and must match the shipping policy page
// and the announcement bar copy. No amount is hardcoded here.
const rawThreshold = import.meta.env.VITE_FREE_SHIPPING_THRESHOLD;
const THRESHOLD = rawThreshold ? Number(rawThreshold) : NaN;
const ENABLED = Number.isFinite(THRESHOLD) && THRESHOLD > 0;

export default function FreeShippingProgress({ subtotal }: { subtotal: number }) {
  const { t } = useTranslation();

  if (!ENABLED || subtotal <= 0) return null;

  const remaining = Math.max(0, THRESHOLD - subtotal);
  const pct = Math.min(100, (subtotal / THRESHOLD) * 100);

  return (
    <div data-testid="free-shipping-progress">
      <p className="mb-2 text-[10px] text-muted-foreground">
        {remaining > 0
          ? t("cart.freeShippingAway", { amount: `$${remaining.toFixed(2)}` })
          : t("cart.freeShippingReached")}
      </p>
      <div className="h-1 w-full overflow-hidden bg-border" aria-hidden="true">
        <div
          className="h-full bg-primary transition-[width] duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
