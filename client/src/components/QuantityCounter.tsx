import { Minus, Plus, AlertCircle } from "lucide-react";

interface QuantityCounterProps {
  quantity: number;
  setQuantity: (quantity: number) => void;
  availableQuantity?: number;
  fullWidth?: boolean;
}

export default function QuantityCounter({
  quantity,
  setQuantity,
  availableQuantity = Infinity,
  fullWidth = false,
}: QuantityCounterProps) {
  // Cap at minimum of 10 or available inventory
  const maxQuantity = Math.min(10, availableQuantity);
  const isLowStock = availableQuantity > 0 && availableQuantity <= 5;
  const isAtMax = quantity >= maxQuantity;

  return (
    <div className="space-y-2">
      <div
        className={`flex items-center border border-border rounded-md ${fullWidth ? "w-full justify-between" : "w-fit"
          }`}
      >
        <button
          onClick={() => setQuantity(Math.max(1, quantity - 1))}
          className="px-4 py-3 transition-colors hover:bg-muted disabled:opacity-50"
          data-testid="button-quantity-decrease"
          aria-label="Decrease quantity"
          disabled={quantity <= 1}
        >
          <Minus className="h-4 w-4" />
        </button>
        <span
          className={`text-center font-medium text-sm ${fullWidth ? "flex-1" : "w-12"}`}
          data-testid="text-quantity"
        >
          {quantity}
        </span>
        <button
          onClick={() => setQuantity(Math.min(maxQuantity, quantity + 1))}
          className="px-4 py-3 transition-colors hover:bg-muted disabled:opacity-50"
          data-testid="button-quantity-increase"
          aria-label="Increase quantity"
          disabled={isAtMax}
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      {/* Low-stock warning badge */}
      {isLowStock && (
        <div className="flex items-center gap-2 px-3 py-2">
          <AlertCircle className="h-4 w-4 text-error shrink-0" />
          <span className="text-sm font-medium text-error">Running Low — order soon</span>
        </div>
      )}

      {/* Max quantity reached message */}
      {isAtMax && maxQuantity <= 10 && (
        <p className="text-xs text-secondary">Maximum {maxQuantity} per order</p>
      )}
    </div>
  );
}
