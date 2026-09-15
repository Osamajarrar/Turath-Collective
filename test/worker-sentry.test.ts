import { describe, it, expect } from "vitest";
import { sentryOptions } from "../worker/index";
import type { ErrorEvent, Breadcrumb } from "@sentry/cloudflare";

// The Worker's Sentry setup is the one that is NOT gated on visitor consent —
// it reports our own infrastructure failing rather than visitor behaviour. What
// makes that defensible is the redaction, so the redaction has to be pinned by
// something more durable than having once looked at the dashboard.
//
// /api/contact and /api/reserve both receive an email address. An exception
// thrown between parsing a body and validating it carries that body in its
// message.

const DSN = "https://abc@o1.ingest.us.sentry.io/1";

describe("Worker Sentry — PII never leaves in an error report", () => {
  it("redacts an email from the event message", () => {
    const { beforeSend } = sentryOptions({ SENTRY_DSN: DSN } as never);
    const out = beforeSend({ message: "boom for buyer@example.com" } as ErrorEvent);
    expect(JSON.stringify(out)).not.toContain("buyer@example.com");
    expect(JSON.stringify(out)).toContain("[redacted-email]");
  });

  it("redacts an email nested in a captured request body", () => {
    const { beforeSend } = sentryOptions({ SENTRY_DSN: DSN } as never);
    const out = beforeSend({
      message: "validation failed",
      extra: { body: { email: "buyer@example.com", name: "A" } },
    } as unknown as ErrorEvent);
    const serialized = JSON.stringify(out);
    expect(serialized).not.toContain("buyer@example.com");
    expect(serialized).toContain('"name":"A"');
  });

  it("redacts an email from a breadcrumb URL", () => {
    const { beforeBreadcrumb } = sentryOptions({ SENTRY_DSN: DSN } as never);
    const out = beforeBreadcrumb({
      category: "fetch",
      data: { url: "/api/reserve?email=buyer@example.com" },
    } as Breadcrumb);
    expect(JSON.stringify(out)).not.toContain("buyer@example.com");
  });

  it("never sends default PII — no IP, cookies or headers", () => {
    expect(sentryOptions({ SENTRY_DSN: DSN } as never).sendDefaultPii).toBe(false);
  });

  it("does not sample traces", () => {
    expect(sentryOptions({ SENTRY_DSN: DSN } as never).tracesSampleRate).toBe(0);
  });
});

describe("Worker Sentry — environment tagging", () => {
  it("uses the deployment's ENVIRONMENT when set", () => {
    // .dev.vars sets this to "development" so local crashes stay out of the
    // production alert rule.
    expect(sentryOptions({ ENVIRONMENT: "development" } as never).environment).toBe("development");
  });

  it("falls back to production, not development, when unset", () => {
    // Sentry's own default is already "production"; making it explicit means a
    // missing var surfaces as noise rather than as silently unmonitored prod.
    expect(sentryOptions({} as never).environment).toBe("production");
  });

  it("is a no-op when no DSN is configured — the normal local state", () => {
    expect(sentryOptions({} as never).dsn).toBeUndefined();
  });
});
