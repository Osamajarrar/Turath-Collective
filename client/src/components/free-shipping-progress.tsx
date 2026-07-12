import { useTranslation } from "react-i18next";
import { FREE_SHIPPING_THRESHOLD, SHIPPING_PROMO_ENABLED } from "@/lib/flags";

// Free-shipping progress indicator for the cart drawer.
// There is no finalized free-shipping policy yet, so this renders nothing
// until VITE_SHOW_SHIPPING_PROMO=true and VITE_FREE_SHIPPING_THRESHOLD hold a
// real CAD amount (see @/lib/flags — the same gate controls the announcement
// bar). No amount is hardcoded here.

export default function FreeShippingProgress({ subtotal }: { subtotal: number }) {
  const { t } = useTranslation();

  if (!SHIPPING_PROMO_ENABLED || subtotal <= 0) return null;

  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const pct = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);

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
