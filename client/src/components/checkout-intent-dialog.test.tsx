import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const analytics = vi.hoisted(() => ({
  trackEvent: vi.fn(),
  trackEventThenNavigate: vi.fn(),
}));
vi.mock("@/lib/analytics", () => analytics);

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (k: string) => k }),
}));

import CheckoutIntentDialog from "./checkout-intent-dialog";

const context = { cartValue: 180, currency: "CAD", numItems: 2 };

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => ({ ok: true }) }));
});

afterEach(() => {
  vi.unstubAllGlobals();
});

const fillAndSubmit = async (user: ReturnType<typeof userEvent.setup>, email = "a@b.com") => {
  await user.type(screen.getByLabelText(/emailLabel/i), email);
  await user.click(screen.getByTestId("button-intent-submit"));
};

describe("checkout-intent dialog — what it must NOT contain", () => {
  it("collects no payment details of any kind", () => {
    render(<CheckoutIntentDialog open onClose={vi.fn()} context={context} />);

    const inputs = [...document.querySelectorAll("input")];
    const names = inputs.map((i) => i.getAttribute("name") ?? "");
    const autocompletes = inputs.map((i) => i.getAttribute("autocomplete") ?? "");

    expect(names).not.toContain("cardNumber");
    expect(autocompletes.join(" ")).not.toMatch(/cc-|card/i);
    // Only: email, the newsletter checkbox, and the honeypot.
    expect(names.sort()).toEqual(["company", "email", "newsletterOptIn"]);
  });

  it("pre-ticks nothing — the newsletter consent must be opt-in (CASL)", () => {
    render(<CheckoutIntentDialog open onClose={vi.fn()} context={context} />);
    expect(screen.getByTestId("checkbox-intent-newsletter")).not.toBeChecked();
  });
});

describe("checkout-intent dialog — submission", () => {
  it("posts to /api/reserve and never to Shopify", async () => {
    const user = userEvent.setup();
    render(<CheckoutIntentDialog open onClose={vi.fn()} context={context} />);
    await fillAndSubmit(user);

    await waitFor(() => expect(fetch).toHaveBeenCalled());
    const [url] = (fetch as any).mock.calls[0];
    expect(url).toBe("/api/reserve");

    const allUrls = (fetch as any).mock.calls.map((c: any[]) => String(c[0])).join(" ");
    expect(allUrls).not.toMatch(/myshopify|checkout\./);
  });

  it("sends the newsletter opt-in only when ticked", async () => {
    const user = userEvent.setup();
    render(<CheckoutIntentDialog open onClose={vi.fn()} context={context} />);

    await user.type(screen.getByLabelText(/emailLabel/i), "a@b.com");
    await user.click(screen.getByTestId("checkbox-intent-newsletter"));
    await user.click(screen.getByTestId("button-intent-submit"));

    await waitFor(() => expect(fetch).toHaveBeenCalled());
    const body = JSON.parse((fetch as any).mock.calls[0][1].body);
    expect(body.newsletterOptIn).toBe(true);
    expect(body.email).toBe("a@b.com");
  });

  it("shows confirmation only after the server accepts", async () => {
    const user = userEvent.setup();
    render(<CheckoutIntentDialog open onClose={vi.fn()} context={context} />);
    await fillAndSubmit(user);

    await waitFor(() => expect(screen.getByTestId("text-intent-success")).toBeInTheDocument());
  });

  it("shows an error and NO confirmation when the server rejects", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 503 }));
    const user = userEvent.setup();
    render(<CheckoutIntentDialog open onClose={vi.fn()} context={context} />);
    await fillAndSubmit(user);

    await waitFor(() => expect(screen.getByTestId("text-intent-error")).toBeInTheDocument());
    expect(screen.queryByTestId("text-intent-success")).not.toBeInTheDocument();
  });

  it("shows an error when the request throws outright", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
    const user = userEvent.setup();
    render(<CheckoutIntentDialog open onClose={vi.fn()} context={context} />);
    await fillAndSubmit(user);

    await waitFor(() => expect(screen.getByTestId("text-intent-error")).toBeInTheDocument());
  });
});

describe("checkout-intent dialog — analytics", () => {
  it("captures the conversion step with the cart value", async () => {
    const user = userEvent.setup();
    render(<CheckoutIntentDialog open onClose={vi.fn()} context={context} />);
    await fillAndSubmit(user);

    await waitFor(() => expect(analytics.trackEvent).toHaveBeenCalled());
    const [name, props] = analytics.trackEvent.mock.calls[0];
    expect(name).toBe("checkout_intent_email_submitted");
    expect(props.cart_value).toBe(180);
    expect(props.currency).toBe("CAD");
  });

  it("NEVER puts the email address into an analytics property", async () => {
    // This repo has already leaked an email into event properties once.
    const user = userEvent.setup();
    render(<CheckoutIntentDialog open onClose={vi.fn()} context={context} />);
    await fillAndSubmit(user, "leak@example.com");

    await waitFor(() => expect(analytics.trackEvent).toHaveBeenCalled());
    const serialized = JSON.stringify(analytics.trackEvent.mock.calls);
    expect(serialized).not.toContain("leak@example.com");
    expect(serialized).not.toContain("@");
  });

  it("does not capture anything when the submission fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 500 }));
    const user = userEvent.setup();
    render(<CheckoutIntentDialog open onClose={vi.fn()} context={context} />);
    await fillAndSubmit(user);

    await waitFor(() => expect(screen.getByTestId("text-intent-error")).toBeInTheDocument());
    expect(analytics.trackEvent).not.toHaveBeenCalled();
  });
});

describe("checkout-intent dialog — dismissal", () => {
  it("is dismissable with Escape, unlike the consent dialog", async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(<CheckoutIntentDialog open onClose={onClose} context={context} />);

    await user.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalled();
  });

  it("renders nothing when closed", () => {
    render(<CheckoutIntentDialog open={false} onClose={vi.fn()} context={context} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
