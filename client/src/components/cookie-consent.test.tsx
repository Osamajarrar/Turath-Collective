import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const posthog = vi.hoisted(() => ({
  init: vi.fn(),
  capture: vi.fn(),
  opt_out_capturing: vi.fn(),
}));
vi.mock("posthog-js", () => ({ default: posthog }));

// wouter's Link needs no router for rendering an <a>, but keep it inert.
vi.mock("wouter", () => ({
  Link: ({ children, href }: any) => <a href={href}>{children}</a>,
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (k: string) => k }),
}));

import CookieConsent from "./cookie-consent";

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
  window.gtag = vi.fn();
});

describe("consent dialog — visibility", () => {
  it("shows for a visitor with no decision", () => {
    render(<CookieConsent />);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("does not show once a decision exists", () => {
    localStorage.setItem(
      "turath-consent",
      JSON.stringify({ status: "denied", timestamp: new Date().toISOString() }),
    );
    render(<CookieConsent />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("closes after either choice", async () => {
    const user = userEvent.setup();
    render(<CookieConsent />);
    await user.click(screen.getByTestId("button-consent-accept"));
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });
});

describe("consent dialog — Law 25 equal-weight requirement", () => {
  it("styles accept and decline identically", () => {
    render(<CookieConsent />);
    const accept = screen.getByTestId("button-consent-accept");
    const decline = screen.getByTestId("button-consent-decline");

    // Refusing must be as easy as accepting. A filled Accept next to an
    // outlined Decline is the nudge this test exists to prevent.
    expect(decline.className).toBe(accept.className);
  });

  it("offers exactly two choices, both one click", () => {
    render(<CookieConsent />);
    const buttons = screen.getAllByRole("button");
    expect(buttons).toHaveLength(2);
  });

  it("declining takes a single click and needs no confirmation", async () => {
    const user = userEvent.setup();
    render(<CookieConsent />);
    await user.click(screen.getByTestId("button-consent-decline"));

    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(JSON.parse(localStorage.getItem("turath-consent")!).categories.analytics).toBe(
      false,
    );
  });
});

describe("consent dialog — a choice must actually be made", () => {
  it("has no dismiss control", () => {
    render(<CookieConsent />);
    // Only the two choices — no X, no "continue without choosing".
    const labels = screen.getAllByRole("button").map((b) => b.getAttribute("data-testid"));
    expect(labels.sort()).toEqual(["button-consent-accept", "button-consent-decline"]);
  });

  it("does not close on Escape", async () => {
    const user = userEvent.setup();
    render(<CookieConsent />);
    await user.keyboard("{Escape}");
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(localStorage.getItem("turath-consent")).toBeNull();
  });
});

describe("consent dialog — accessibility", () => {
  it("is a labelled modal dialog", () => {
    render(<CookieConsent />);
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(dialog).toHaveAttribute("aria-labelledby");
    expect(dialog).toHaveAttribute("aria-describedby");
  });

  it("moves focus into the dialog on open", async () => {
    render(<CookieConsent />);
    await waitFor(() =>
      expect(screen.getByRole("dialog").contains(document.activeElement)).toBe(true),
    );
  });

  it("traps Tab inside the dialog", async () => {
    const user = userEvent.setup();
    render(<CookieConsent />);
    const dialog = screen.getByRole("dialog");

    for (let i = 0; i < 6; i += 1) {
      await user.tab();
      expect(dialog.contains(document.activeElement)).toBe(true);
    }
  });
});

describe("consent dialog — analytics gating", () => {
  it("does not initialise PostHog merely by rendering", () => {
    render(<CookieConsent />);
    expect(posthog.init).not.toHaveBeenCalled();
  });

  it("grants gtag storage only after accept", async () => {
    const user = userEvent.setup();
    render(<CookieConsent />);
    expect(window.gtag).not.toHaveBeenCalled();

    await user.click(screen.getByTestId("button-consent-accept"));
    expect(window.gtag).toHaveBeenCalledWith("consent", "update", {
      analytics_storage: "granted",
    });
  });
});
