import { cn } from "@/lib/utils";
import styles from "./color-swatch.module.css";

interface ColorSwatchProps {
  color: string;
  hex: string;
  isSelected: boolean;
  isOutOfStock: boolean;
  onClick: () => void;
  size?: "sm" | "md";
  showOutOfStockStyle?: boolean;
  showBorder?: boolean;
  t?: (key: string, fallback: string) => string;
}

export function ColorSwatch({
  color,
  hex,
  isSelected,
  isOutOfStock,
  onClick,
  size = "md",
  showOutOfStockStyle = true,
  showBorder = true,
  t = (_, fallback) => fallback,
}: ColorSwatchProps) {
  return (
    <div className="relative group/swatch">
      <button
        onClick={onClick}
        className={cn(
          styles.swatchButton,
          size === "sm" ? styles.swatchSm : styles.swatchMd,
          isSelected && styles.swatchSelected,
          !showBorder && styles.swatchNoBorder,
          !isOutOfStock && "cursor-pointer"
        )}
        title={color}
        aria-label={`${color}${isOutOfStock ? " (Out of Stock)" : ""}`}
      >
        <span
          className={cn(
            styles.swatchColor,
            showOutOfStockStyle && isOutOfStock && styles.swatchOutOfStock
          )}
          style={{ backgroundColor: hex }}
        />
      </button>
    </div>
  );
}
