import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";

// Plan 09 part D calls this the highest-value area in the codebase: real
// branching (mock vs live variant, add-to-existing vs create-new cart,
// quantity-to-zero removal, localStorage round-trip) where a silent break
// costs money.

// vi.hoisted, because vi.mock's factory is lifted above every import and so
// runs before a plain `const` here would be initialised.
const shopifyService = vi.hoisted(() => ({
  createCart: vi.fn(),
  addToCart: vi.fn(),
  updateCartLines: vi.fn(),
  removeCartLines: vi.fn(),
  getCart: vi.fn(),
}));

vi.mock("@/lib/shopify", () => ({
  shopifyService,
  __esModule: true,
}));

// Static import is safe despite the mock above: vi.mock is hoisted above all
// imports. A top-level `await import(...)` would work at runtime but fails
// `npm run check` under this tsconfig's module setting.
import { CartProvider, useCart } from "./cart-context";

const CART_ID_KEY = "turath_cart_id";
const MOCK_CART_KEY = "turath_mock_cart";

const wrapper = ({ children }: { children: ReactNode }) => (
  <CartProvider>{children}</CartProvider>
);

const cart = (id: string, totalQuantity: number) =>
  ({ id, totalQuantity, checkoutUrl: `https://checkout.example/${id}`, lines: [] }) as any;

const meta = {
  productTitle: "Indigo Mosaic Bowl",
  variantTitle: "Cream",
  price: 45,
  currencyCode: "CAD",
};

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
  sessionStorage.clear();

  // clearAllMocks also drops implementations, so every method must be given a
  // resolved value again. The provider calls getCart on mount whenever a cart
  // ID is stored; without this it returns undefined and the mount throws.
  for (const fn of Object.values(shopifyService)) fn.mockResolvedValue(null);
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("cart — mock variants", () => {
  it("adds a mock variant to sessionStorage without touching Shopify", async () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    await act(async () => {
      await result.current.addItem("mock-variant-1-cream", 2, meta);
    });

    expect(shopifyService.createCart).not.toHaveBeenCalled();
    expect(result.current.mockLines).toHaveLength(1);
    expect(result.current.totalQuantity).toBe(2);
    expect(result.current.hasMockCart).toBe(true);

    // Round-trip: the line must survive a reload of the same session.
    const persisted = JSON.parse(sessionStorage.getItem(MOCK_CART_KEY)!);
    expect(persisted[0]).toMatchObject({ variantId: "mock-variant-1-cream", quantity: 2 });
  });

  it("increments quantity instead of duplicating an existing mock line", async () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    await act(async () => {
      await result.current.addItem("mock-variant-1-cream", 1, meta);
    });
    await act(async () => {
      await result.current.addItem("mock-variant-1-cream", 3, meta);
    });

    expect(result.current.mockLines).toHaveLength(1);
    expect(result.current.totalQuantity).toBe(4);
  });

  it("restores mock lines from sessionStorage on mount", () => {
    sessionStorage.setItem(
      MOCK_CART_KEY,
      JSON.stringify([
        { lineId: "mock-line-x", variantId: "mock-v", productTitle: "P", variantTitle: "V", quantity: 3, price: 10, currencyCode: "CAD" },
      ]),
    );

    const { result } = renderHook(() => useCart(), { wrapper });
    expect(result.current.totalQuantity).toBe(3);
  });

  it("survives corrupt sessionStorage rather than crashing the app", () => {
    sessionStorage.setItem(MOCK_CART_KEY, "{not json");
    const { result } = renderHook(() => useCart(), { wrapper });
    expect(result.current.mockLines).toEqual([]);
  });

  it("removes a mock line when quantity drops below 1", async () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    await act(async () => {
      await result.current.addItem("mock-variant-1-cream", 1, meta);
    });
    const lineId = result.current.mockLines[0].lineId;

    await act(async () => {
      await result.current.updateLineQuantity(lineId, 0);
    });

    expect(result.current.mockLines).toHaveLength(0);
    expect(result.current.totalQuantity).toBe(0);
  });

  it("removeLine drops the mock line", async () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    await act(async () => {
      await result.current.addItem("mock-variant-1-cream", 1, meta);
    });
    const lineId = result.current.mockLines[0].lineId;

    await act(async () => {
      await result.current.removeLine(lineId);
    });
    expect(result.current.mockLines).toHaveLength(0);
  });

  it("refuses mock variants in live mode instead of silently faking a cart", async () => {
    vi.stubEnv("VITE_SHOPIFY_MODE", "live");
    const { result } = renderHook(() => useCart(), { wrapper });

    await expect(
      act(async () => {
        await result.current.addItem("mock-variant-1-cream", 1, meta);
      }),
    ).rejects.toThrow(/mock products cannot be used in live mode/i);
  });
});

describe("cart — Shopify variants", () => {
  it("creates a new cart when no cart ID is stored, and persists the ID", async () => {
    shopifyService.createCart.mockResolvedValue(cart("gid://cart/1", 1));
    const { result } = renderHook(() => useCart(), { wrapper });

    await act(async () => {
      await result.current.addItem("gid://shopify/ProductVariant/123", 1);
    });

    expect(shopifyService.createCart).toHaveBeenCalledOnce();
    expect(shopifyService.addToCart).not.toHaveBeenCalled();
    expect(localStorage.getItem(CART_ID_KEY)).toBe("gid://cart/1");
    expect(result.current.totalQuantity).toBe(1);
  });

  it("adds to the existing cart when an ID is already stored", async () => {
    localStorage.setItem(CART_ID_KEY, "gid://cart/existing");
    shopifyService.addToCart.mockResolvedValue(cart("gid://cart/existing", 5));
    const { result } = renderHook(() => useCart(), { wrapper });

    await act(async () => {
      await result.current.addItem("gid://shopify/ProductVariant/123", 2);
    });

    expect(shopifyService.addToCart).toHaveBeenCalledWith("gid://cart/existing", [
      { merchandiseId: "gid://shopify/ProductVariant/123", quantity: 2 },
    ]);
    expect(shopifyService.createCart).not.toHaveBeenCalled();
  });

  it("clears the stored cart ID when the cart empties out", async () => {
    localStorage.setItem(CART_ID_KEY, "gid://cart/1");
    shopifyService.removeCartLines.mockResolvedValue(cart("gid://cart/1", 0));
    const { result } = renderHook(() => useCart(), { wrapper });

    await act(async () => {
      await result.current.removeLine("gid://line/1");
    });

    // A stale ID pointing at an empty cart would resurrect an empty cart on
    // the next visit.
    expect(localStorage.getItem(CART_ID_KEY)).toBeNull();
    expect(result.current.cart).toBeNull();
  });

  it("routes quantity 0 to removeCartLines, not updateCartLines", async () => {
    localStorage.setItem(CART_ID_KEY, "gid://cart/1");
    shopifyService.removeCartLines.mockResolvedValue(cart("gid://cart/1", 2));
    const { result } = renderHook(() => useCart(), { wrapper });

    await act(async () => {
      await result.current.updateLineQuantity("gid://line/1", 0);
    });

    expect(shopifyService.removeCartLines).toHaveBeenCalled();
    expect(shopifyService.updateCartLines).not.toHaveBeenCalled();
  });

  it("does nothing when updating a line with no cart ID stored", async () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    await act(async () => {
      await result.current.updateLineQuantity("gid://line/1", 3);
    });
    expect(shopifyService.updateCartLines).not.toHaveBeenCalled();
    expect(shopifyService.removeCartLines).not.toHaveBeenCalled();
  });

  it("clearCartId removes the persisted ID", async () => {
    localStorage.setItem(CART_ID_KEY, "gid://cart/1");
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.clearCartId();
    });

    expect(localStorage.getItem(CART_ID_KEY)).toBeNull();
  });

  it("signals the cart drawer to open after a successful add", async () => {
    shopifyService.createCart.mockResolvedValue(cart("gid://cart/1", 1));
    const { result } = renderHook(() => useCart(), { wrapper });

    await act(async () => {
      await result.current.addItem("gid://shopify/ProductVariant/123", 1);
    });

    await waitFor(() => expect(result.current.isCartOpenSignal).toBe(true));

    act(() => result.current.resetCartOpenSignal());
    expect(result.current.isCartOpenSignal).toBe(false);
  });
});

describe("useCart", () => {
  it("throws outside a CartProvider rather than returning undefined", () => {
    expect(() => renderHook(() => useCart())).toThrow(/within CartProvider/i);
  });
});
