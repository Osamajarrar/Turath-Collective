import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const posthog = vi.hoisted(() => ({
  init: vi.fn(),
  capture: vi.fn(),
  opt_out_capturing: vi.fn(),
}));
vi.mock("posthog-js", () => ({ default: posthog }));

// VITE_CONSENT_BAR_SHOWN is read at module load, so the flag is mocked through a
// mutable holder rather than by reloading modules in every test.
const flagState = vi.hoisted(() => ({ barEnabled: true }));
vi.mock("@/lib/flags", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/flags")>()),
  get CONSENT_BAR_ENABLED() {
    return flagState.barEnabled;
  },
}));

// wouter's Link needs no router for rendering an <a>, but keep it inert.
vi.mock("wouter", () => ({
  Link: ({ children, href }: any) => <a href={href}>{children}</a>,
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (k: string) => k }),
}));

import CookieConsent from "./cookie-consent";

const bar = () => screen.queryByTestId("consent-bar");

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
  window.gtag = vi.fn();
  flagState.barEnabled = true;
});

describe("consent bar — the VITE_CONSENT_BAR_SHOWN switch", () => {
  it("renders nothing at all when the bar is disabled", () => {
    flagState.barEnabled = false;
    render(<CookieConsent />);

    // Not "hidden" — absent. With the flag off, analytics are started for
    // everyone at boot, so a visible Accept/Decline would be a choice that
    // changes nothing.
    expect(bar()).not.toBeInTheDocument();
    expect(screen.queryAllByRole("button")).toHaveLength(0);
  });

  it("does not record a decision when the bar is disabled", () => {
    flagState.barEnabled = false;
    render(<CookieConsent />);

    // applyImplicitConsent deliberately stores no consent record: when the bar
    // is switched on for launch, these visitors must be asked properly rather
    // than discovered to be already opted in.
    expect(localStorage.getItem("turath-consent")).toBeNull();
  });

  it("shows the bar when enabled", () => {
    render(<CookieConsent />);
    expect(bar()).toBeInTheDocument();
  });
});

describe("consent bar — visibility", () => {
  it("shows for a visitor with no decision", () => {
    render(<CookieConsent />);
    expect(bar()).toBeInTheDocument();
  });

  it("does not show once a decision exists", () => {
    localStorage.setItem(
      "turath-consent",
      JSON.stringify({ status: "denied", timestamp: new Date().toISOString() }),
    );
    render(<CookieConsent />);
    expect(bar()).not.toBeInTheDocument();
  });

  it("closes after either choice", async () => {
    const user = userEvent.setup();
    render(<CookieConsent />);
    await user.click(screen.getByTestId("button-consent-accept"));
    await waitFor(() => expect(bar()).not.toBeInTheDocument());
  });
});

describe("consent bar — Law 25 equal-weight requirement", () => {
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
    expect(screen.getAllByRole("button")).toHaveLength(2);
  });

  it("declining takes a single click and needs no confirmation", async () => {
    const user = userEvent.setup();
    render(<CookieConsent />);
    await user.click(screen.getByTestId("button-consent-decline"));

    await waitFor(() => expect(bar()).not.toBeInTheDocument());
    expect(JSON.parse(localStorage.getItem("turath-consent")!).categories.analytics).toBe(
      false,
    );
  });
});

describe("consent bar — a choice must actually be made", () => {
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
    expect(bar()).toBeInTheDocument();
    expect(localStorage.getItem("turath-consent")).toBeNull();
  });
});

describe("consent bar — accessibility", () => {
  it("is a labelled region, not a modal dialog", () => {
    render(<CookieConsent />);

    // A bar overlays the page without blocking it, so announcing it as a modal
    // dialog would be a lie to a screen reader: focus is not trapped and the
    // content behind stays reachable.
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    const region = screen.getByRole("region", { name: "consent.label" });
    expect(region).toBe(bar());
  });

  it("leaves focus on the page instead of seizing it", () => {
    render(<CookieConsent />);
    // The modal stole focus deliberately; a bar must not, or it interrupts
    // someone mid-task on a page it is not blocking.
    expect(bar()!.contains(document.activeElement)).toBe(false);
  });

  it("keeps both choices reachable by keyboard", async () => {
    const user = userEvent.setup();
    render(<CookieConsent />);

    await user.tab();
    await user.tab();
    await user.tab();
    expect(bar()!.contains(document.activeElement)).toBe(true);
  });
});

describe("consent bar — analytics gating", () => {
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
