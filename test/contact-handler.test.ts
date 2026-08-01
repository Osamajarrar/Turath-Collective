import { describe, it, expect, vi, beforeEach } from "vitest";

const email = vi.hoisted(() => ({
  sendContactEmail: vi.fn(),
  sendContactConfirmation: vi.fn(),
}));
vi.mock("../server/email", () => email);

import { handleContactSubmission } from "../server/contact-handler";

const valid = {
  name: "Layla Sami",
  email: "layla@example.com",
  subject: "Inquiry about ceramics",
  message: "Do you ship to Ontario?",
};

beforeEach(() => {
  vi.clearAllMocks();
  email.sendContactEmail.mockResolvedValue({ success: true });
  email.sendContactConfirmation.mockResolvedValue({ success: true });
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("contact — happy path", () => {
  it("sends the admin email and the confirmation", async () => {
    const result = await handleContactSubmission(valid);

    expect(result.status).toBe(200);
    expect(result.body.ok).toBe(true);
    expect(email.sendContactEmail).toHaveBeenCalledWith(valid);
    expect(email.sendContactConfirmation).toHaveBeenCalledWith(valid.email, valid.name);
  });

  it("does not forward the honeypot field to the email layer", async () => {
    await handleContactSubmission({ ...valid, company: "" });
    expect(email.sendContactEmail.mock.calls[0][0]).not.toHaveProperty("company");
  });

  it("trims surrounding whitespace", async () => {
    await handleContactSubmission({ ...valid, name: "  Layla Sami  " });
    expect(email.sendContactEmail.mock.calls[0][0].name).toBe("Layla Sami");
  });
});

describe("contact — validation", () => {
  it.each([
    ["a missing name", { ...valid, name: "" }],
    ["a whitespace-only message", { ...valid, message: "   " }],
    ["a malformed email", { ...valid, email: "not-an-email" }],
    ["a missing subject", { ...valid, subject: "" }],
    ["an over-long message", { ...valid, message: "x".repeat(5001) }],
    ["an over-long email", { ...valid, email: `${"a".repeat(250)}@example.com` }],
    ["a non-object payload", "just a string"],
    ["null", null],
  ])("rejects %s without sending anything", async (_label, payload) => {
    const result = await handleContactSubmission(payload);
    expect(result.status).toBe(400);
    expect(email.sendContactEmail).not.toHaveBeenCalled();
  });

  it("does not echo field-level errors back to a public endpoint", async () => {
    const result = await handleContactSubmission({ ...valid, email: "bad" });
    expect(JSON.stringify(result.body)).not.toContain("email");
  });
});

describe("contact — honeypot", () => {
  it("silently discards a submission with the honeypot filled", async () => {
    const result = await handleContactSubmission({ ...valid, company: "Acme Corp" });

    // Looks like success, so a bot learns nothing and does not retry...
    expect(result.status).toBe(200);
    expect(result.body.ok).toBe(true);
    // ...but no mail is sent.
    expect(email.sendContactEmail).not.toHaveBeenCalled();
    expect(email.sendContactConfirmation).not.toHaveBeenCalled();
  });
});

describe("contact — failure handling", () => {
  it("does NOT report success when the admin email fails", async () => {
    // A form that says "message received" while dropping the message is the
    // same class of lie as the notify-me button that only logged to console.
    email.sendContactEmail.mockRejectedValue(new Error("resend down"));

    const result = await handleContactSubmission(valid);
    expect(result.status).toBe(502);
    expect(result.body.ok).toBeUndefined();
  });

  it("still reports success when only the confirmation fails", async () => {
    // The founder has the message; failing here would make the visitor resend.
    email.sendContactConfirmation.mockRejectedValue(new Error("bounced"));

    const result = await handleContactSubmission(valid);
    expect(result.status).toBe(200);
    expect(result.body.ok).toBe(true);
  });

  it("does not leak the upstream error to the caller", async () => {
    email.sendContactEmail.mockRejectedValue(new Error("Resend API key sk_live_secret"));
    const result = await handleContactSubmission(valid);
    expect(JSON.stringify(result.body)).not.toContain("sk_live_secret");
  });
});

describe("contact — production must not fake delivery", () => {
  it("returns 502 in production when RESEND_API_KEY is missing", async () => {
    // Uses the REAL email module: the point is that getClient() throws in
    // production rather than falling back to console logging, which would
    // make the form report success while the message went nowhere.
    vi.resetModules();
    vi.doUnmock("../server/email");

    const prevEnv = process.env.NODE_ENV;
    const prevKey = process.env.RESEND_API_KEY;
    process.env.NODE_ENV = "production";
    delete process.env.RESEND_API_KEY;

    try {
      const { handleContactSubmission: real } = await import("../server/contact-handler");
      const result = await real(valid);
      expect(result.status).toBe(502);
      expect(result.body.ok).toBeUndefined();
    } finally {
      process.env.NODE_ENV = prevEnv;
      if (prevKey !== undefined) process.env.RESEND_API_KEY = prevKey;
    }
  });
});
