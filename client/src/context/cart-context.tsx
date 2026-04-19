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

  const persistCartId = useCallback((id: string) => {
    localStorage.setItem(CART_ID_KEY, id);
  }, []);

  const clearCartId = useCallback(() => {
    localStorage.removeItem(CART_ID_KEY);
    setCart(null);
  }, []);

  const refreshCart = useCallback(async () => {
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
  }, []);

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

  const addItem = useCallback(
    async (
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
      console.log("[Cart Context] addItem called:", { variantId, quantity, isMock: isMockVariantId(variantId) });
      
      if (isMockVariantId(variantId)) {
        console.log("[Cart Context] Using mock cart");
        if (!meta) return;
        setMockLines((prev) => {
          const existing = prev.find((l) => l.variantId === variantId);
          let next: MockCartLine[];
          if (existing) {
            next = prev.map((l) =>
              l.variantId === variantId
                ? { ...l, quantity: l.quantity + quantity }
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
                quantity,
                price: meta.price,
                currencyCode: meta.currencyCode,
                imageUrl: meta.imageUrl,
              },
            ];
          }
          saveMockCart(next);
          return next;
        });
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
            { merchandiseId: variantId, quantity },
          ]);
        } else {
          console.log("[Cart Context] Creating new Shopify cart");
          next = await shopifyService.createCart([
            { merchandiseId: variantId, quantity },
          ]);
        }
        console.log("[Cart Context] Shopify cart response:", next);
        if (next) {
          console.log("[Cart Context] Cart created/updated with checkoutUrl:", next.checkoutUrl ? "✓" : "✗");
          persistCartId(next.id);
          setCart(next);
          setMockLines([]);
          saveMockCart([]);
        }
      } finally {
        setIsBusy(false);
      }
    },
    [persistCartId]
  );

  const updateLineQuantity = useCallback(
    async (lineId: string, quantity: number) => {
      if (lineId.startsWith("mock-line-") || mockLines.some((l) => l.lineId === lineId)) {
        setMockLines((prev) => {
          const next =
            quantity < 1
              ? prev.filter((l) => l.lineId !== lineId)
              : prev.map((l) =>
                  l.lineId === lineId ? { ...l, quantity } : l
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
        if (quantity < 1) {
          next = await shopifyService.removeCartLines(id, [lineId]);
        } else {
          next = await shopifyService.updateCartLines(id, [{ id: lineId, quantity }]);
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
    },
    [mockLines]
  );

  const removeLine = useCallback(
    async (lineId: string) => {
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
    },
    [mockLines]
  );

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
      addItem,
      updateLineQuantity,
      removeLine,
      refreshCart,
      clearCartId,
    }),
    [
      cart,
      mockLines,
      isBusy,
      totalQuantity,
      addItem,
      updateLineQuantity,
      removeLine,
      refreshCart,
      clearCartId,
    ]
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
