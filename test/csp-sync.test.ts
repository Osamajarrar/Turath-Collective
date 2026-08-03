import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import {
  buildCsp,
  cspDirectivesForHelmet,
  CSP_DIRECTIVES,
  SECURITY_HEADERS,
  CACHE_RULES,
} from "../worker/security-headers";

// The CSP used to exist twice — helmet in server/index.ts (never executed in
// production) and a hand-transcribed copy in vercel.json (what actually ran).
// A missing origin fails SILENTLY in the browser: the script loads and no data
// ever leaves the page.
//
// On Cloudflare there is one definition, in worker/security-headers.ts, applied
// to Worker responses by middleware and to static assets via a GENERATED
// client/public/_headers. These tests pin that:
//   1. the migration is behaviour-preserving vs what production serves today
//   2. client/public/_headers is actually in step with its source
//   3. every third party we load is still named

const ROOT = path.resolve(import.meta.dirname, "..");

const vercelCsp: string = (() => {
  const cfg = JSON.parse(fs.readFileSync(path.join(ROOT, "vercel.json"), "utf8"));
  const headers = cfg.headers?.flatMap((h: any) => h.headers ?? []) ?? [];
  return headers.find((h: any) => h.key?.toLowerCase() === "content-security-policy").value;
})();

describe("CSP migration is behaviour-preserving", () => {
  it("generates a policy byte-identical to the one Vercel serves today", () => {
    // Vercel remains the live deploy until the founder cuts DNS over. If these
    // ever differ, one of the two environments is running a different policy.
    expect(buildCsp()).toBe(vercelCsp);
  });
});

describe("client/public/_headers is generated, not hand-edited", () => {
  const headersFile = path.join(ROOT, "client", "public", "_headers");

  it("exists", () => {
    expect(fs.existsSync(headersFile)).toBe(true);
  });

  const contents = fs.existsSync(headersFile) ? fs.readFileSync(headersFile, "utf8") : "";

  it("contains every security header from the source module", () => {
    for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
      expect(contents, `_headers is stale — run \`npm run headers\`. Missing: ${key}`).toContain(
        `${key}: ${value}`,
      );
    }
  });

  it("contains every cache rule from the source module", () => {
    for (const rule of CACHE_RULES) {
      expect(contents).toContain(rule.pattern);
      expect(contents).toContain(`Cache-Control: ${rule.value}`);
    }
  });
});

describe("the dev server's policy derives from the shared one", () => {
  // server/index.ts hand-maintained a third copy until 2026-08. Nothing tested
  // it, so the policy developers debug against could drift from production
  // without anyone noticing.
  it("carries every shared directive through unchanged", () => {
    const dev = cspDirectivesForHelmet();
    for (const [name, values] of Object.entries(CSP_DIRECTIVES)) {
      expect(dev[name]).toEqual(values);
    }
  });

  it("keeps blob: workers OUT of the production policy", () => {
    // Vite's HMR ping worker needs this locally; shipping it would widen the
    // XSS surface for a dev-only convenience.
    expect(buildCsp()).not.toContain("blob:");
    expect(cspDirectivesForHelmet({ "worker-src": ["'self'", "blob:"] })["worker-src"]).toContain(
      "blob:",
    );
  });

  it("does not let a dev-only override silently edit a shared directive", () => {
    const overridden = cspDirectivesForHelmet({ "connect-src": ["'self'"] });
    // If this ever becomes intentional, the override belongs in the shared
    // file with an environment check — not spread over the shared value.
    expect(overridden["connect-src"]).not.toEqual(CSP_DIRECTIVES["connect-src"]);
  });
});

describe("CSP covers the third parties we actually load", () => {
  const connect = buildCsp()
    .split(";")
    .map((d) => d.trim())
    .find((d) => d.startsWith("connect-src"))!;

  it("allows Sentry ingest, or error reports are blocked silently", () => {
    expect(connect).toMatch(/ingest\S*\.sentry\.io/);
  });

  it("allows PostHog ingest", () => {
    expect(connect).toContain("posthog.com");
  });

  it("allows GA4 measurement endpoints", () => {
    expect(connect).toContain("google-analytics.com");
  });

  it("allows the Shopify Storefront API", () => {
    expect(connect).toContain("myshopify.com");
  });

  it("does not put Sentry in script-src — the SDK is bundled, not a CDN script", () => {
    const script = buildCsp()
      .split(";")
      .map((d) => d.trim())
      .find((d) => d.startsWith("script-src"))!;
    expect(script).not.toContain("sentry");
  });
});
