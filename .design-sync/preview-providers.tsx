// Preview-only provider wrapper for design-sync cards. Wraps every preview so
// components that read cart / query / tooltip context render. i18n initializes
// as a side-effect import in the bundle entry (.design-sync/ds-entry.mjs).
import React from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "../client/src/lib/queryClient";
import { TooltipProvider } from "../client/src/components/ui/tooltip";
import { CartProvider } from "../client/src/context/cart-context";

export function DsProvider({ children }: { children?: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <CartProvider>
        <TooltipProvider>{children}</TooltipProvider>
      </CartProvider>
    </QueryClientProvider>
  );
}
