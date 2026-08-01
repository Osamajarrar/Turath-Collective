import { describe, it, expect, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

vi.mock("wouter", () => ({
  Link: ({ children, href }: any) => <a href={href}>{children}</a>,
  useRoute: () => [true, { variant: "material" }],
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (k: string) => k, i18n: { language: "en" } }),
}));

vi.mock("@/components/PageLayout", () => ({
  default: ({ children }: any) => <div>{children}</div>,
}));

import ShopPreview from "./ShopPreview";
import { FILTER_STRATEGIES, resolveGroups, getFilterStrategy } from "./strategies";
import { MOCK_PRODUCTS, type DisplayProduct } from "@/pages/shop";

const strategy = (id: string) => getFilterStrategy(id)!;

// Only ceramics is a live category, so that is what a preview may show.
const liveProducts = (MOCK_PRODUCTS as DisplayProduct[]).filter((p) => p.category === "ceramics");

describe("filter strategies", () => {
  it("every strategy has a stated case for AND against", () => {
    // The gallery exists to support a decision; a one-sided option is not one.
    for (const s of FILTER_STRATEGIES) {
      expect(s.argues.length, `${s.id} missing 'for'`).toBeGreaterThan(20);
      expect(s.against.length, `${s.id} missing 'against'`).toBeGreaterThan(20);
    }
  });

  it("drops groups that would be empty", () => {
    // A filter button leading to an empty grid is worse than no button.
    for (const s of FILTER_STRATEGIES) {
      for (const group of resolveGroups(s, liveProducts)) {
        expect(liveProducts.some(group.test), `${s.id}/${group.key} is empty`).toBe(true);
      }
    }
  });

  it("'no filters' produces no groups at all", () => {
    expect(resolveGroups(strategy("none"), liveProducts)).toEqual([]);
  });

  it("price bands do not overlap and cover every product", () => {
    for (const product of liveProducts) {
      const matches = strategy("price").groups!(liveProducts).filter((g) => g.test(product));
      expect(matches, `${product.name} at $${product.price} matched ${matches.length} bands`)
        .toHaveLength(1);
    }
  });
});

describe("ShopPreview", () => {
  it("hides categories that are hidden in the real catalogue", () => {
    // Embroidery is not sold; a preview showing it would be judging a shop we
    // do not have.
    render(<ShopPreview strategy={strategy("material")} />);
    expect(screen.queryByText(/embroidery/i)).not.toBeInTheDocument();
  });

  it("renders a filter bar for a grouping strategy", () => {
    render(<ShopPreview strategy={strategy("price")} />);
    expect(screen.getByRole("button", { name: "All" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Under \$50/ })).toBeInTheDocument();
  });

  it("renders NO filter bar, and a count instead, for 'no filters'", () => {
    render(<ShopPreview strategy={strategy("none")} />);
    expect(screen.queryByRole("button", { name: "All" })).not.toBeInTheDocument();
    expect(screen.getByText(/pieces?$/)).toBeInTheDocument();
  });

  it("actually filters the grid when a group is chosen", async () => {
    const user = userEvent.setup();
    render(<ShopPreview strategy={strategy("price")} />);

    const before = screen.getAllByRole("heading", { level: 2 }).length;
    await user.click(screen.getByRole("button", { name: /Under \$50/ }));
    const after = screen.getAllByRole("heading", { level: 2 }).length;

    expect(after).toBeLessThanOrEqual(before);
    // Everything still shown must genuinely be under $50.
    for (const price of screen.getAllByText(/^\$\d+\.\d\d CAD$/)) {
      expect(Number(price.textContent!.replace(/[^\d.]/g, ""))).toBeLessThan(50);
    }
  });

  it("sorts by price ascending when asked", async () => {
    const user = userEvent.setup();
    render(<ShopPreview strategy={strategy("none")} />);

    await user.selectOptions(screen.getByRole("combobox"), "price-low");
    const prices = screen
      .getAllByText(/^\$\d+\.\d\d CAD$/)
      .map((el) => Number(el.textContent!.replace(/[^\d.]/g, "")));

    expect([...prices]).toEqual([...prices].sort((a, b) => a - b));
  });
});
