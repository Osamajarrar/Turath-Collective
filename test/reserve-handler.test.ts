import { describe, it, expect, vi, beforeEach } from "vitest";

const contactsCreate = vi.hoisted(() => vi.fn());
const email = vi.hoisted(() => ({ sendNotifyConfirmation: vi.fn() }));
vi.mock("../server/email", () => email);
vi.mock("resend", () => ({
  Resend: class {
    contacts = { create: contactsCreate };
  },
}));

import { handleReserveSubmission } from "../server/reserve-handler";

const NOTIFY = "aud_notify";
const NEWSLETTER = "aud_newsletter";

beforeEach(() => {
  vi.clearAllMocks();
  contactsCreate.mockResolvedValue({ error: null });
  email.sendNotifyConfirmation.mockResolvedValue({ success: true });
  process.env.RESEND_API_KEY = "re_test";
  process.env.RESEND_NOTIFY_AUDIENCE_ID = NOTIFY;
  process.env.RESEND_NEWSLETTER_AUDIENCE_ID = NEWSLETTER;
  vi.spyOn(console, "error").mockImplementation(() => {});
  vi.spyOn(console, "info").mockImplementation(() => {});
});

describe("reserve — CASL two-consent split", () => {
  it("writes ONLY the notification audience when the newsletter box is unticked", async () => {
    const result = await handleReserveSubmission({ email: "a@b.com" });

    expect(result.status).toBe(200);
    expect(contactsCreate).toHaveBeenCalledTimes(1);
    expect(contactsCreate).toHaveBeenCalledWith(
      expect.objectContaining({ email: "a@b.com", audienceId: NOTIFY }),
    );
  });

  it("defaults newsletterOptIn to false when the field is absent entirely", async () => {
    await handleReserveSubmission({ email: "a@b.com" });
    const audiences = contactsCreate.mock.calls.map((c) => c[0].audienceId);
    expect(audiences).not.toContain(NEWSLETTER);
  });

  it("writes both audiences only when the visitor explicitly opted in", async () => {
    await handleReserveSubmission({ email: "a@b.com", newsletterOptIn: true });

    const audiences = contactsCreate.mock.calls.map((c) => c[0].audienceId);
    expect(audiences).toContain(NOTIFY);
    expect(audiences).toContain(NEWSLETTER);
  });

  it("records consent as subscribed, so Resend owns the unsubscribe", async () => {
    await handleReserveSubmission({ email: "a@b.com" });
    expect(contactsCreate.mock.calls[0][0].unsubscribed).toBe(false);
  });

  it("still succeeds when only the newsletter write fails", async () => {
    // The visitor's actual request was "notify me"; that succeeded.
    contactsCreate
      .mockResolvedValueOnce({ error: null })
      .mockResolvedValueOnce({ error: { message: "audience full" } });

    const result = await handleReserveSubmission({ email: "a@b.com", newsletterOptIn: true });
    expect(result.status).toBe(200);
  });
});

describe("reserve — never fake a capture", () => {
  it("returns 503 rather than success when Resend is not configured", async () => {
    delete process.env.RESEND_API_KEY;
    const result = await handleReserveSubmission({ email: "a@b.com" });

    // Telling someone "we'll let you know" with nowhere to store the address
    // is exactly the class of claim the honesty rules prohibit.
    expect(result.status).toBe(503);
    expect(result.body.ok).toBeUndefined();
  });

  it("returns 503 when the notification audience is not configured", async () => {
    delete process.env.RESEND_NOTIFY_AUDIENCE_ID;
    const result = await handleReserveSubmission({ email: "a@b.com" });
    expect(result.status).toBe(503);
  });

  it("returns 502 when the notification write fails", async () => {
    contactsCreate.mockResolvedValue({ error: { message: "upstream down" } });
    const result = await handleReserveSubmission({ email: "a@b.com" });
    expect(result.status).toBe(502);
    expect(result.body.ok).toBeUndefined();
  });

  it("treats an already-subscribed address as success", async () => {
    contactsCreate.mockResolvedValue({ error: { message: "Contact already exists" } });
    const result = await handleReserveSubmission({ email: "a@b.com" });
    expect(result.status).toBe(200);
  });
});

describe("reserve — validation", () => {
  it.each([
    ["a malformed address", { email: "nope" }],
    ["a missing address", {}],
    ["a non-object payload", "a@b.com"],
  ])("rejects %s without writing anything", async (_l, payload) => {
    const result = await handleReserveSubmission(payload);
    expect(result.status).toBe(400);
    expect(contactsCreate).not.toHaveBeenCalled();
  });

  it("silently discards a honeypot submission", async () => {
    const result = await handleReserveSubmission({ email: "a@b.com", company: "bot" });
    expect(result.status).toBe(200);
    expect(contactsCreate).not.toHaveBeenCalled();
  });

  it("does not store the cart context as contact data", async () => {
    await handleReserveSubmission({ email: "a@b.com", cartValue: 180, currency: "CAD" });
    const written = contactsCreate.mock.calls[0][0];
    expect(written).not.toHaveProperty("cartValue");
    expect(Object.keys(written).sort()).toEqual(["audienceId", "email", "unsubscribed"]);
  });
});

describe("reserve — confirmation email", () => {
  it("sends a confirmation after the address is recorded", async () => {
    await handleReserveSubmission({ email: "a@b.com", productName: "Indigo Mosaic Bowl" });
    expect(email.sendNotifyConfirmation).toHaveBeenCalledWith("a@b.com", "Indigo Mosaic Bowl");
  });

  it("still succeeds when the confirmation fails", async () => {
    // The address IS recorded. Failing here would make the visitor resubmit,
    // which double-counts them in the demand test.
    email.sendNotifyConfirmation.mockRejectedValue(new Error("resend down"));
    const result = await handleReserveSubmission({ email: "a@b.com" });
    expect(result.status).toBe(200);
  });

  it("does not send a confirmation when nothing was recorded", async () => {
    delete process.env.RESEND_NOTIFY_AUDIENCE_ID;
    await handleReserveSubmission({ email: "a@b.com" });
    expect(email.sendNotifyConfirmation).not.toHaveBeenCalled();
  });
});
