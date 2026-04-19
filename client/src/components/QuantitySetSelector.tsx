import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";

interface QuantitySetSelectorProps {
  quantity: number;
  setQuantity: (quantity: number) => void;
  maxSets: number;
}

export default function QuantitySetSelector({
  quantity,
  setQuantity,
  maxSets = 3,
}: QuantitySetSelectorProps) {
  const isMobile = useIsMobile();

  // Generate array of set numbers [1, 2, 3, ..., maxSets]
  const setOptions = Array.from({ length: maxSets }, (_, i) => i + 1);

  if (isMobile) {
    // Mobile: Dropdown menu
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="w-full justify-between">
            <span>{quantity} Set{quantity !== 1 ? "s" : ""}</span>
            <ChevronDown className="h-4 w-4 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-[--radix-dropdown-menu-trigger-width]">
          {setOptions.map((set) => (
            <DropdownMenuItem
              key={set}
              onClick={() => setQuantity(set)}
              data-testid={`dropdown-set-${set}`}
            >
              <span className={quantity === set ? "font-bold" : ""}>
                {set} Set{set !== 1 ? "s" : ""}
              </span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  // Desktop: Button grid
  return (
    <div className="flex gap-2" data-testid="quantity-set-selector-desktop">
      {setOptions.map((set) => (
        <Button
          key={set}
          variant={quantity === set ? "default" : "outline"}
          onClick={() => setQuantity(set)}
          data-testid={`button-set-${set}`}
          className={quantity === set ? "font-bold" : ""}
        >
          {set} Set{set !== 1 ? "s" : ""}
        </Button>
      ))}
    </div>
  );
}
