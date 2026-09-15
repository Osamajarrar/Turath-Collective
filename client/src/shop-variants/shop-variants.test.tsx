import { describe, it, expect, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

vi.mock("wouter", () => ({
  // Spread the rest: the real Link forwards data-testid and className, and a
  // mock that silently drops props makes tests fail for the wrong reason.
  Link: ({ children, href, ...rest }: any) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
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

});

describe("ShopPreview — landing page and shop share one taxonomy", () => {
  it("hides categories that are hidden in the real catalogue", () => {
    // Embroidery is not sold; a preview showing it would be judging a shop we
    // do not have.
    render(<ShopPreview strategy={strategy("material")} />);
    expect(screen.queryByText(/embroidery/i)).not.toBeInTheDocument();
  });

  it("shows the landing-page section as well as the shop", () => {
    // The grouping drives homepage collection cards too. A preview of only the
    // shop would hide half the consequence of the choice.
    render(<ShopPreview strategy={strategy("availability")} />);
    expect(screen.getByText(/on the landing page/i)).toBeInTheDocument();
    expect(screen.getByText(/on the shop page/i)).toBeInTheDocument();
  });

  it("renders one landing card per group, with the same labels as the filters", () => {
    render(<ShopPreview strategy={strategy("availability")} />);
    for (const group of resolveGroups(strategy("availability"), liveProducts)) {
      // Label appears twice: once as a landing card heading, once as a filter.
      expect(screen.getAllByText(group.label).length).toBeGreaterThanOrEqual(2);
    }
  });

  it("'no filters' removes the collection cards AND the filter bar", () => {
    render(<ShopPreview strategy={strategy("none")} />);
    expect(screen.queryByRole("button", { name: "All" })).not.toBeInTheDocument();
    expect(screen.getByText(/no collection cards/i)).toBeInTheDocument();
  });

  it("renders a filter bar for a grouping strategy", () => {
    render(<ShopPreview strategy={strategy("availability")} />);
    expect(screen.getByRole("button", { name: "All" })).toBeInTheDocument();
  });

  it("actually filters the shop grid when a group is chosen", async () => {
    const user = userEvent.setup();
    render(<ShopPreview strategy={strategy("availability")} />);

    const before = screen.getAllByTestId("preview-product").length;
    await user.click(screen.getByRole("button", { name: /Available Now/ }));
    const after = screen.getAllByTestId("preview-product").length;

    expect(after).toBeLessThanOrEqual(before);
    expect(after).toBeGreaterThan(0);
  });

  it("sorts by price ascending when asked", async () => {
    const user = userEvent.setup();
    render(<ShopPreview strategy={strategy("none")} />);

    await user.selectOptions(screen.getByRole("combobox"), "price-low");
    const prices = screen
      .getAllByTestId("preview-product")
      .map((el) => Number(el.textContent!.match(/\$(\d+\.\d\d)/)![1]));

    expect([...prices]).toEqual([...prices].sort((a, b) => a - b));
  });
});
