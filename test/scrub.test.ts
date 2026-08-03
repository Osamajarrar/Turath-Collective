import { describe, it, expect } from "vitest";
import { scrubEmails } from "../shared/scrub";

// This module is the ONE redaction path for both Sentry SDKs — the browser's
// (client/src/lib/monitoring.ts) and the Worker's (worker/index.ts). It moved
// here out of client/ precisely so the Worker could not grow a second copy that
// drifts. /api/contact and /api/reserve both receive an email address, so an
// exception thrown near either can carry it into an error report.

describe("scrubEmails", () => {
  it("redacts an address in a plain message", () => {
    expect(scrubEmails("failed for buyer@example.com while saving")).toBe(
      "failed for [redacted-email] while saving",
    );
  });

  it("redacts addresses nested anywhere in an event payload", () => {
    const event = {
      message: "contact a@b.co",
      extra: { list: ["x", "someone@turathcollective.com"], nested: { to: "c@d.org" } },
    };
    const serialized = JSON.stringify(scrubEmails(event));
    expect(serialized).not.toContain("@b.co");
    expect(serialized).not.toContain("someone@turathcollective.com");
    expect(serialized).not.toContain("c@d.org");
    expect(serialized.match(/\[redacted-email\]/g)).toHaveLength(3);
  });

  it("redacts an address embedded in a request URL", () => {
    // A Worker breadcrumb records the request URL; /api/reserve carries email.
    expect(scrubEmails("POST /api/reserve?email=buyer@example.com")).not.toContain(
      "buyer@example.com",
    );
  });

  it("survives a JSON body captured in an exception message", () => {
    // The shared handlers parse a body before validating it; a throw between
    // those two points puts the raw body in the error.
    const out = scrubEmails('Invalid input: {"email":"buyer@example.com","name":"A"}');
    expect(out).not.toContain("buyer@example.com");
    expect(out).toContain('"name":"A"');
  });

  it("leaves non-email text and non-strings alone", () => {
    expect(scrubEmails("no address here @ all")).toBe("no address here @ all");
    expect(scrubEmails(42 as unknown as string)).toBe(42);
    expect(scrubEmails(null as unknown as string)).toBeNull();
  });
});
