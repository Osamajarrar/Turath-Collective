/**
 * Cloudflare Worker — the API surface, on Hono.
 *
 * Replaces BOTH previous server implementations: the Express app in server/
 * (which only ever ran locally) and the Vercel Functions in api/ (which is
 * what production actually executed). Having two was the source of the CSP
 * drift and of "the route works locally but 404s in production".
 *
 * Hono is also the portability hedge — the same handlers run on Node via
 * @hono/node-server, so leaving Cloudflare later means swapping the entry
 * point, not rewriting this file. See DECISIONS.md §2.
 *
 * Static assets and the SPA fallback are handled by the `assets` binding in
 * wrangler.toml, not here.
 */
import { Hono } from "hono";
import { z } from "zod";
import * as Sentry from "@sentry/cloudflare";
import { SECURITY_HEADERS } from "./security-headers";
import { scrubEmails } from "../shared/scrub";

export type Env = {
  /**
   * Sentry DSN for the WORKER, deliberately separate from the browser's
   * VITE_SENTRY_DSN: a failing /api/shopify is an outage, a client TypeError
   * usually isn't, and they want different alert rules. Not a secret (a DSN is
   * a write-only ingest key), so it belongs in [vars], not `wrangler secret`.
   * Unset = monitoring off, which is the normal local state.
   */
  SENTRY_DSN?: string;
  /**
   * Which deployment this is, as Sentry's `environment` tag.
   *
   * Cloudflare exposes no equivalent of import.meta.env.MODE, and Sentry's own
   * default is the string "production" — so without this every `wrangler dev`
   * error is filed as a production incident and trips production alert rules.
   *
   * Defaults to "production" rather than "development" deliberately: if this
   * is ever missing in the real deploy, the failure should be a noisy local
   * error, not silently unmonitored production.
   */
  ENVIRONMENT?: string;
  SHOPIFY_STORE_DOMAIN?: string;
  SHOPIFY_STOREFRONT_TOKEN?: string;
  RESEND_API_KEY?: string;
  RESEND_NOTIFY_AUDIENCE_ID?: string;
  RESEND_NEWSLETTER_AUDIENCE_ID?: string;
  /** Cloudflare Rate Limiting binding — see wrangler.toml. */
  SHOPIFY_RATE_LIMITER?: { limit: (o: { key: string }) => Promise<{ success: boolean }> };
  API_RATE_LIMITER?: { limit: (o: { key: string }) => Promise<{ success: boolean }> };
  /** Static assets binding (dist/public) — see wrangler.toml. */
  ASSETS: { fetch: (req: Request) => Promise<Response> };
};

const MAX_QUERY_LENGTH = 20_000;
const UPSTREAM_TIMEOUT_MS = 10_000;

const app = new Hono<{ Bindings: Env }>();

// ── Security headers on every Worker response ───────────────────────────────
// Static assets get the same set via client/public/_headers, generated from the same
// module so the two cannot drift.
app.use("*", async (c, next) => {
  await next();

  // Responses from the ASSETS binding have IMMUTABLE headers — setting one
  // throws "Can't modify immutable headers", which surfaced as a 500 on every
  // deep link. Re-wrapping produces an equivalent response with mutable
  // headers, preserving status and body.
  c.res = new Response(c.res.body, c.res);

  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    c.res.headers.set(key, value);
  }
});

// ── Error handler ───────────────────────────────────────────────────────────
// Ported from server/index.ts. The rule that survives the move: a 5xx never
// leaks internal error text to the caller.
//
// Hono catches route exceptions here, which means Sentry's own wrapper never
// sees them — without the explicit captureException below, every handled 500
// would be invisible in Sentry while looking fine in the dashboard.
app.onError((err, c) => {
  console.error("[worker] unhandled error:", err);
  Sentry.captureException(err);
  return c.json({ message: "Internal Server Error" }, 500);
});

function clientIp(c: { req: { header: (name: string) => string | undefined } }): string {
  return c.req.header("CF-Connecting-IP") ?? c.req.header("x-forwarded-for") ?? "unknown";
}

/** Browsers always send Origin on cross-origin POSTs; server-side callers don't. */
function originAllowed(origin: string | undefined, host: string | undefined): boolean {
  if (!origin) return true;
  try {
    const { hostname } = new URL(origin);
    return (
      hostname === host ||
      hostname === "turathcollective.com" ||
      hostname.endsWith(".turathcollective.com") ||
      hostname.endsWith(".workers.dev") ||
      hostname === "localhost" ||
      hostname === "127.0.0.1"
    );
  } catch {
    return false;
  }
}

// ── GET /api/health ─────────────────────────────────────────────────────────
app.get("/api/health", (c) => c.json({ status: "ok" }));

// ── POST /api/shopify ───────────────────────────────────────────────────────
// Ported from server/routes.ts and api/shopify.ts. NONE of this hardening is
// decorative — the endpoint is public and unauthenticated, and it holds the
// storefront token.
const graphqlRequestSchema = z.object({
  query: z.string().min(1).max(MAX_QUERY_LENGTH),
  variables: z.record(z.unknown()).optional(),
  operationName: z.string().max(200).optional(),
});

app.post("/api/shopify", async (c) => {
  const host = c.req.header("host")?.split(":")[0];
  if (!originAllowed(c.req.header("origin"), host)) {
    return c.json({ message: "Forbidden" }, 403);
  }

  // Rate limiting now uses a Cloudflare binding rather than
  // express-rate-limit's in-memory store. That store was PER INSTANCE and
  // therefore never actually enforced a global limit on Vercel — this is the
  // first deploy where the ceiling is real.
  if (c.env.SHOPIFY_RATE_LIMITER) {
    const { success } = await c.env.SHOPIFY_RATE_LIMITER.limit({ key: clientIp(c) });
    if (!success) {
      return c.json({ message: "Too many requests, please try again later" }, 429);
    }
  }

  let body: unknown;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ message: "Expected a GraphQL request body" }, 400);
  }

  const parsed = graphqlRequestSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ message: "Expected a GraphQL request body" }, 400);
  }
  const { query, variables, operationName } = parsed.data;

  // Don't let the proxy hand out the store's full schema.
  if (/\b__schema\b|\b__type\b/.test(query)) {
    return c.json({ message: "Introspection is not supported" }, 400);
  }

  const token = c.env.SHOPIFY_STOREFRONT_TOKEN;
  const domain = c.env.SHOPIFY_STORE_DOMAIN;

  if (!token || !domain) {
    // EXACT shape the client keys off to fall back to mock data — do not
    // change these field names (client/src/lib/shopify.ts checks status 503).
    return c.json(
      {
        shopifyDisabled: true,
        message:
          "Shopify is not configured. Set SHOPIFY_STORE_DOMAIN and SHOPIFY_STOREFRONT_TOKEN to enable live products.",
      },
      503,
    );
  }

  try {
    // Forward only the validated fields — never the raw body.
    const shopifyRes = await fetch(`https://${domain}/api/2024-01/graphql.json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": token,
      },
      body: JSON.stringify({ query, variables, operationName }),
      signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
    });

    const data = await shopifyRes.json();
    return c.json(data as Record<string, unknown>, shopifyRes.status as 200);
  } catch (err) {
    console.error("[worker] Shopify proxy error:", err);
    const aborted = err instanceof Error && err.name === "TimeoutError";
    return c.json({ message: "Failed to reach Shopify" }, aborted ? 504 : 502);
  }
});

// ── POST /api/contact and /api/reserve ──────────────────────────────────────
// Validation, delivery and the CASL consent split live in the shared handlers,
// unchanged from the Express/Vercel implementations. Resend's SDK is fetch-
// based and runs on Workers as-is.
//
// The handlers read credentials from process.env; the Worker gets them from
// `env`. nodejs_compat gives Workers a process.env, and wrangler.toml maps the
// vars into it, so the shared code needs no change.
app.post("/api/contact", async (c) => {
  const host = c.req.header("host")?.split(":")[0];
  if (!originAllowed(c.req.header("origin"), host)) {
    return c.json({ message: "Forbidden" }, 403);
  }
  if (c.env.API_RATE_LIMITER) {
    const { success } = await c.env.API_RATE_LIMITER.limit({ key: clientIp(c) });
    if (!success) {
      return c.json({ message: "Too many messages from this address. Please try again later." }, 429);
    }
  }

  const { handleContactSubmission } = await import("../server/contact-handler");
  let body: unknown;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ message: "Please check the form and try again." }, 400);
  }
  const result = await handleContactSubmission(body);
  return c.json(result.body, result.status as 200);
});

app.post("/api/reserve", async (c) => {
  const host = c.req.header("host")?.split(":")[0];
  if (!originAllowed(c.req.header("origin"), host)) {
    return c.json({ message: "Forbidden" }, 403);
  }
  if (c.env.API_RATE_LIMITER) {
    const { success } = await c.env.API_RATE_LIMITER.limit({ key: clientIp(c) });
    if (!success) {
      return c.json({ message: "Too many attempts. Please try again later." }, 429);
    }
  }

  const { handleReserveSubmission } = await import("../server/reserve-handler");
  let body: unknown;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ message: "Please enter a valid email address." }, 400);
  }
  const result = await handleReserveSubmission(body);
  return c.json(result.body, result.status as 200);
});

// Newsletter — the SEPARATE consent from the checkout-intent capture above.
// Backed by a Resend audience, not the old JSON file (deleted in this
// migration): a file store gave us none of the unsubscribe, consent-record or
// bounce handling CASL requires, and could not run on Workers at all.
app.post("/api/newsletter", async (c) => {
  const host = c.req.header("host")?.split(":")[0];
  if (!originAllowed(c.req.header("origin"), host)) {
    return c.json({ message: "Forbidden" }, 403);
  }
  if (c.env.API_RATE_LIMITER) {
    const { success } = await c.env.API_RATE_LIMITER.limit({ key: clientIp(c) });
    if (!success) {
      return c.json({ message: "Too many signup attempts, please try again later" }, 429);
    }
  }

  const { handleNewsletterSubmission } = await import("../server/newsletter-handler");
  let body: unknown;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ message: "Please enter a valid email address" }, 400);
  }
  const result = await handleNewsletterSubmission(body);
  return c.json(result.body, result.status as 200);
});

// Any other /api/* path is a real 404, not the SPA shell. This must come
// BEFORE the catch-all below, or a typo'd API path would quietly return HTML
// with a 200 and the client would try to JSON.parse the app shell.
app.all("/api/*", (c) => c.json({ message: "Not found" }, 404));

// ── Everything else: static assets and the SPA ──────────────────────────────
// The Worker runs first for every request, so without this a client route like
// /product/<handle> reaches Hono, matches nothing and 404s — deep links and
// refreshes break, which is the top risk called out in plan 10.
//
// Delegating to the ASSETS binding serves the real file when one exists and,
// thanks to not_found_handling = "single-page-application" in wrangler.toml,
// falls back to index.html when it doesn't. That replaces both the
// `/(.*) -> /index.html` rewrite in vercel.json and the Express fallback in
// server/static.ts.
app.all("*", (c) => c.env.ASSETS.fetch(c.req.raw));

// ── Error monitoring ────────────────────────────────────────────────────────
// The browser SDK is gated on visitor consent (client/src/lib/monitoring.ts).
// This one is NOT, and the difference is deliberate:
//
// Client-side Sentry observes the visitor — session identifier, breadcrumbs of
// what they clicked. That is the non-essential collection the consent dialog
// asks about. This instead observes OUR infrastructure: a route threw, an
// upstream timed out. It is operational logging for availability and security,
// the standard exception under Law 25 / PIPEDA, and it is also the only
// version that works — a first-time visitor has no consent cookie yet, and a
// first-time visitor hitting a broken endpoint is exactly the report worth
// having.
//
// What keeps that defensible is the scrubbing below, not the justification:
//   - sendDefaultPii false  → no IP address, no cookies, no headers
//   - beforeSend            → strips anything email-shaped from the payload
// /api/contact and /api/reserve both receive an email address, so an exception
// thrown near either could otherwise carry it into the report.
//
// tracesSampleRate is 0 for the same reason as the client: an MVP wants to
// know what broke, not to pay quota for spans nobody reads.
export default Sentry.withSentry(
  (env: Env) => ({
    dsn: env.SENTRY_DSN,
    environment: env.ENVIRONMENT ?? "production",
    sendDefaultPii: false,
    tracesSampleRate: 0,
    beforeSend: (event: Sentry.ErrorEvent) => scrubEmails(event),
    beforeBreadcrumb: (breadcrumb: Sentry.Breadcrumb) => scrubEmails(breadcrumb),
  }),
  app satisfies ExportedHandler<Env>,
);
