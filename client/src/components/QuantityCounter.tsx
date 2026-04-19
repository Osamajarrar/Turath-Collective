import { Minus, Plus } from "lucide-react";

interface QuantityCounterProps {
  quantity: number;
  setQuantity: (quantity: number) => void;
  maxQuantity?: number;
}

export default function QuantityCounter({
  quantity,
  setQuantity,
  maxQuantity = Infinity,
}: QuantityCounterProps) {
  return (
    <div className="flex items-center border border-border w-fit">
      <button
        onClick={() => setQuantity(Math.max(1, quantity - 1))}
        className="px-4 py-2 transition-colors hover:bg-muted"
        data-testid="button-quantity-decrease"
        aria-label="Decrease quantity"
      >
        <Minus className="h-4 w-4" />
      </button>
      <span
        className="w-12 text-center font-medium text-sm"
        data-testid="text-quantity"
      >
        {quantity}
      </span>
      <button
        onClick={() => setQuantity(Math.min(maxQuantity, quantity + 1))}
        className="px-4 py-2 transition-colors hover:bg-muted"
        data-testid="button-quantity-increase"
        aria-label="Increase quantity"
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}
