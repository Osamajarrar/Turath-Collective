import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

// The CSP exists TWICE: helmet in server/index.ts (local/Node host) and a
// hand-duplicated copy in vercel.json (production, where server/index.ts never
// runs). DECISIONS.md §1 calls this out as a standing hazard — a new origin
// added to one and not the other fails silently in the browser, and the
// symptom is an empty dashboard that looks like "no errors" or "no events".
//
// This test does not merge them; it just refuses to let them drift.
// Plan 10 removes the duplication entirely by consolidating on Cloudflare.

const ROOT = path.resolve(import.meta.dirname, "..");

const vercelCsp: string = (() => {
  const cfg = JSON.parse(fs.readFileSync(path.join(ROOT, "vercel.json"), "utf8"));
  const headers = cfg.headers?.flatMap((h: any) => h.headers ?? []) ?? [];
  const csp = headers.find((h: any) => h.key?.toLowerCase() === "content-security-policy");
  if (!csp) throw new Error("no Content-Security-Policy header found in vercel.json");
  return csp.value as string;
})();

const serverIndex = fs.readFileSync(path.join(ROOT, "server", "index.ts"), "utf8");

/** Origins listed in one directive of the vercel.json CSP string. */
function vercelDirective(name: string): string[] {
  const match = vercelCsp.split(";").find((d) => d.trim().startsWith(`${name} `));
  if (!match) throw new Error(`directive ${name} missing from vercel.json CSP`);
  return match
    .trim()
    .split(/\s+/)
    .slice(1)
    .filter((v) => v.startsWith("http"));
}

/** Origins listed in the helmet directive array in server/index.ts. */
function helmetDirective(name: string): string[] {
  const re = new RegExp(`${name}:\\s*\\[([\\s\\S]*?)\\]`);
  const match = serverIndex.match(re);
  if (!match) throw new Error(`directive ${name} missing from server/index.ts helmet config`);
  return [...match[1].matchAll(/"(https?:\/\/[^"]+)"/g)].map((m) => m[1]);
}

describe("CSP stays in sync between helmet and vercel.json", () => {
  it.each(["scriptSrc/script-src", "connectSrc/connect-src", "fontSrc/font-src"])(
    "%s lists the same origins",
    (pair) => {
      const [helmetName, vercelName] = pair.split("/");
      expect(helmetDirective(helmetName).sort()).toEqual(vercelDirective(vercelName).sort());
    },
  );
});

describe("CSP covers the third parties we actually load", () => {
  const connect = vercelDirective("connect-src");

  it("allows Sentry ingest, or error reports are blocked silently", () => {
    expect(connect.some((o) => o.includes("ingest") && o.includes("sentry.io"))).toBe(true);
  });

  it("allows PostHog ingest", () => {
    expect(connect.some((o) => o.includes("posthog.com"))).toBe(true);
  });

  it("allows GA4 measurement endpoints", () => {
    expect(connect.some((o) => o.includes("google-analytics.com"))).toBe(true);
  });

  it("does not put Sentry in script-src — the SDK is bundled, not a CDN script", () => {
    expect(vercelDirective("script-src").some((o) => o.includes("sentry"))).toBe(false);
  });
});
