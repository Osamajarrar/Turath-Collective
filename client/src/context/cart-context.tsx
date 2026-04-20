import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  shopifyService,
  type ShopifyCart,
  type ShopifyCartLine,
} from "@/lib/shopify";

const CART_ID_KEY = "turath_cart_id";
const MOCK_CART_KEY = "turath_mock_cart";

/**
 * Get current Shopify mode from environment variable
 * @returns "live" (production) or "mock" (development, default)
 */
function getShopifyMode(): "live" | "mock" {
  const mode = import.meta.env.VITE_SHOPIFY_MODE || "mock";
  return mode === "live" ? "live" : "mock";
}

export type MockCartLine = {
  lineId: string;
  variantId: string;
  productTitle: string;
  variantTitle: string;
  quantity: number;
  price: number;
  currencyCode: string;
  imageUrl?: string;
};

function isMockVariantId(variantId: string): boolean {
  return !variantId || variantId.startsWith("mock-");
}

function loadMockCart(): MockCartLine[] {
  try {
    const raw = sessionStorage.getItem(MOCK_CART_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as MockCartLine[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveMockCart(lines: MockCartLine[]) {
  sessionStorage.setItem(MOCK_CART_KEY, JSON.stringify(lines));
}

type CartContextValue = {
  cart: ShopifyCart | null;
  mockLines: MockCartLine[];
  /** True when showing session mock lines (no live Shopify cart). */
  hasMockCart: boolean;
  isBusy: boolean;
  totalQuantity: number;
  /** Signal to open the cart sidebar (auto-resets after navbar reads it) */
  isCartOpenSignal: boolean;
  addItem: (
    variantId: string,
    quantity: number,
    meta?: {
      productTitle: string;
      variantTitle: string;
      price: number;
      currencyCode: string;
      imageUrl?: string;
    }
  ) => Promise<void>;
  updateLineQuantity: (lineId: string, quantity: number) => Promise<void>;
  removeLine: (lineId: string) => Promise<void>;
  refreshCart: () => Promise<void>;
  clearCartId: () => void;
  /** Reset the cart open signal (called by navbar after opening) */
  resetCartOpenSignal: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

function readInitialMockLines(): MockCartLine[] {
  if (typeof window === "undefined") return [];
  return loadMockCart();
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<ShopifyCart | null>(null);
  const [mockLines, setMockLines] = useState<MockCartLine[]>(readInitialMockLines);
  const [isBusy, setIsBusy] = useState(false);
  const [isCartOpenSignal, setIsCartOpenSignal] = useState(false);

  // Persist cart ID to localStorage
  const persistCartId = (id: string) => {
    localStorage.setItem(CART_ID_KEY, id);
  };

  // Clear cart ID and state
  const clearCartId = () => {
    localStorage.removeItem(CART_ID_KEY);
    setCart(null);
  };

  // Reset the cart open signal (called by navbar)
  const resetCartOpenSignal = () => {
    setIsCartOpenSignal(false);
  };

  // Refresh cart from Shopify (or clear if not found)
  const refreshCart = async () => {
    const id = localStorage.getItem(CART_ID_KEY);
    if (!id) {
      setCart(null);
      return;
    }
    const next = await shopifyService.getCart(id);
    if (!next) {
      localStorage.removeItem(CART_ID_KEY);
      setCart(null);
      return;
    }
    setCart(next);
  };

  useEffect(() => {
    if (cart && cart.totalQuantity > 0) {
      setMockLines([]);
      saveMockCart([]);
    }
  }, [cart]);

  useEffect(() => {
    const id = localStorage.getItem(CART_ID_KEY);
    if (!id) return;
    let cancelled = false;
    shopifyService.getCart(id).then((next) => {
      if (cancelled) return;
      if (!next) {
        localStorage.removeItem(CART_ID_KEY);
        setCart(null);
        return;
      }
      setCart(next);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Add item to cart (Shopify or mock)
  const addItem = async (
    variantId: string,
    quantity: number,
    meta?: {
      productTitle: string;
      variantTitle: string;
      price: number;
      currencyCode: string;
      imageUrl?: string;
    }
  ) => {
      // Cap quantity at 10 per order
      const cappedQuantity = Math.min(quantity, 10);
      const mode = getShopifyMode();
      console.log("[Cart Context] addItem called:", { variantId, quantity, cappedQuantity, isMock: isMockVariantId(variantId), mode });
      
      if (isMockVariantId(variantId)) {
        // In live mode, mock cart is not allowed
        if (mode === "live") {
          throw new Error("Mock products cannot be used in live mode. Ensure all products come from Shopify.");
        }
        
        console.log("[Cart Context] Using mock cart");
        if (!meta) return;
        setMockLines((prev) => {
          const existing = prev.find((l) => l.variantId === variantId);
          let next: MockCartLine[];
          if (existing) {
            next = prev.map((l) =>
              l.variantId === variantId
                ? { ...l, quantity: Math.min(l.quantity + cappedQuantity, 10) }
                : l
            );
          } else {
            next = [
              ...prev,
              {
                lineId: `mock-line-${variantId}-${Date.now()}`,
                variantId,
                productTitle: meta.productTitle,
                variantTitle: meta.variantTitle,
                quantity: cappedQuantity,
                price: meta.price,
                currencyCode: meta.currencyCode,
                imageUrl: meta.imageUrl,
              },
            ];
          }
          saveMockCart(next);
          return next;
        });
        // Signal to open the cart
        setIsCartOpenSignal(true);
        return;
      }

      setIsBusy(true);
      try {
        console.log("[Cart Context] Creating Shopify cart");
        const existingId = localStorage.getItem(CART_ID_KEY);
        let next: ShopifyCart | null;
        if (existingId) {
          console.log("[Cart Context] Adding to existing Shopify cart:", existingId);
          next = await shopifyService.addToCart(existingId, [
            { merchandiseId: variantId, quantity: cappedQuantity },
          ]);
        } else {
          console.log("[Cart Context] Creating new Shopify cart");
          next = await shopifyService.createCart([
            { merchandiseId: variantId, quantity: cappedQuantity },
          ]);
        }
        console.log("[Cart Context] Shopify cart response:", next);
        if (next) {
          console.log("[Cart Context] Cart created/updated with checkoutUrl:", next.checkoutUrl ? "✓" : "✗");
          persistCartId(next.id);
          setCart(next);
          setMockLines([]);
          saveMockCart([]);
          // Signal to open the cart
          setIsCartOpenSignal(true);
        }
      } finally {
        setIsBusy(false);
      }
  };

  // Update quantity of item in cart (Shopify or mock)
  const updateLineQuantity = async (lineId: string, quantity: number) => {
      // Cap quantity at 10 per order
      const cappedQuantity = Math.min(quantity, 10);
      if (lineId.startsWith("mock-line-") || mockLines.some((l) => l.lineId === lineId)) {
        setMockLines((prev) => {
          const next =
            cappedQuantity < 1
              ? prev.filter((l) => l.lineId !== lineId)
              : prev.map((l) =>
                  l.lineId === lineId ? { ...l, quantity: cappedQuantity } : l
                );
          saveMockCart(next);
          return next;
        });
        return;
      }

      const id = localStorage.getItem(CART_ID_KEY);
      if (!id) return;
      setIsBusy(true);
      try {
        let next: ShopifyCart | null;
        if (cappedQuantity < 1) {
          next = await shopifyService.removeCartLines(id, [lineId]);
        } else {
          next = await shopifyService.updateCartLines(id, [{ id: lineId, quantity: cappedQuantity }]);
        }
        if (next) {
          setCart(next);
          if (next.totalQuantity === 0) {
            localStorage.removeItem(CART_ID_KEY);
            setCart(null);
          }
        }
      } finally {
        setIsBusy(false);
      }
  };

  // Remove item from cart (Shopify or mock)
  const removeLine = async (lineId: string) => {
      if (lineId.startsWith("mock-line-") || mockLines.some((l) => l.lineId === lineId)) {
        setMockLines((prev) => {
          const next = prev.filter((l) => l.lineId !== lineId);
          saveMockCart(next);
          return next;
        });
        return;
      }

      const id = localStorage.getItem(CART_ID_KEY);
      if (!id) return;
      setIsBusy(true);
      try {
        const next = await shopifyService.removeCartLines(id, [lineId]);
        if (next) {
          setCart(next);
          if (next.totalQuantity === 0) {
            localStorage.removeItem(CART_ID_KEY);
            setCart(null);
          }
        }
      } finally {
        setIsBusy(false);
      }
  };

  const totalQuantity = useMemo(() => {
    if (cart) return cart.totalQuantity;
    return mockLines.reduce((acc, l) => acc + l.quantity, 0);
  }, [cart, mockLines]);

  const value = useMemo<CartContextValue>(
    () => ({
      cart,
      mockLines,
      hasMockCart: mockLines.length > 0,
      isBusy,
      totalQuantity,
      isCartOpenSignal,
      addItem,
      updateLineQuantity,
      removeLine,
      refreshCart,
      clearCartId,
      resetCartOpenSignal,
    }),
    [cart, mockLines, isBusy, totalQuantity, isCartOpenSignal]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}

export function lineUnitPrice(line: ShopifyCartLine): number {
  return parseFloat(line.merchandise.price.amount);
}

export function lineDisplayImage(line: ShopifyCartLine): string | undefined {
  return line.merchandise.image?.url ?? undefined;
}
