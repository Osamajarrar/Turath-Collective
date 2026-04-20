import { Minus, Plus } from "lucide-react";

interface QuantityCounterProps {
  quantity: number;
  setQuantity: (quantity: number) => void;
  maxQuantity?: number;
  fullWidth?: boolean;
}

export default function QuantityCounter({
  quantity,
  setQuantity,
  maxQuantity = Infinity,
  fullWidth = false,
}: QuantityCounterProps) {
  return (
    <div
      className={`flex items-center border border-border rounded-md ${
        fullWidth ? "w-full justify-between" : "w-fit"
      }`}
    >
      <button
        onClick={() => setQuantity(Math.max(1, quantity - 1))}
        className="px-4 py-3 transition-colors hover:bg-muted"
        data-testid="button-quantity-decrease"
        aria-label="Decrease quantity"
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
        className="px-4 py-3 transition-colors hover:bg-muted"
        data-testid="button-quantity-increase"
        aria-label="Increase quantity"
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}
