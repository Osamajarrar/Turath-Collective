/**
 * Shopify Storefront API Proxy
 *
 * Vercel Function that proxies GraphQL requests to Shopify Storefront API
 * Keeps the API token secure (server-side only).
 *
 * This is the proxy that actually runs in production — the Express route in
 * server/routes.ts only serves the local/Node host. Anything that route relies
 * on (rate limiting, validation) has to be reimplemented here.
 *
 * Hardening applied here, because the endpoint is unauthenticated and public:
 *   - shape/size validation so it can't be used to relay arbitrary payloads
 *   - schema introspection blocked
 *   - same-origin enforcement when the caller is a browser (sends Origin)
 *   - best-effort per-IP rate limit (per warm instance — see note below)
 *   - upstream timeout so a hung Shopify call can't pin the function open
 *
 * Environment variables required:
 * - SHOPIFY_STORE_DOMAIN: e.g. "turath-collective.myshopify.com"
 * - SHOPIFY_STOREFRONT_TOKEN: Shopify Storefront API access token
 */

import type { VercelRequest, VercelResponse } from "@vercel/node";

const MAX_QUERY_LENGTH = 20_000;
const UPSTREAM_TIMEOUT_MS = 10_000;

// Per-IP limit. Serverless instances don't share memory, so this is a ceiling
// per warm instance rather than a global guarantee — enough to stop a single
// client hammering the endpoint, not a substitute for a shared store (Vercel
// KV / Upstash) if abuse ever becomes real.
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 60;
const hits = new Map<string, { count: number; resetAt: number }>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = hits.get(ip);

  if (!entry || now > entry.resetAt) {
    hits.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    // Opportunistic cleanup so the map can't grow unbounded on a warm instance.
    if (hits.size > 5000) {
      for (const [key, value] of hits) if (now > value.resetAt) hits.delete(key);
    }
    return false;
  }

  entry.count += 1;
  return entry.count > RATE_LIMIT_MAX;
}

function clientIp(req: VercelRequest): string {
  const forwarded = req.headers["x-forwarded-for"];
  const raw = Array.isArray(forwarded) ? forwarded[0] : forwarded;
  return raw?.split(",")[0].trim() || req.socket?.remoteAddress || "unknown";
}

/** Browsers always send Origin on cross-origin POSTs; server-side callers don't. */
function originAllowed(origin: string | undefined, host: string | undefined): boolean {
  if (!origin) return true; // non-browser caller; the rate limit is the control
  try {
    const { hostname } = new URL(origin);
    return (
      hostname === host ||
      hostname === "turathcollective.com" ||
      hostname.endsWith(".turathcollective.com") ||
      hostname.endsWith(".vercel.app") ||
      hostname === "localhost" ||
      hostname === "127.0.0.1"
    );
  } catch {
    return false;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only accept POST requests
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ message: "Method not allowed" });
  }

  const host = Array.isArray(req.headers.host) ? req.headers.host[0] : req.headers.host;
  const origin = Array.isArray(req.headers.origin) ? req.headers.origin[0] : req.headers.origin;
  if (!originAllowed(origin, host?.split(":")[0])) {
    return res.status(403).json({ message: "Forbidden" });
  }

  if (rateLimited(clientIp(req))) {
    res.setHeader("Retry-After", "60");
    return res.status(429).json({ message: "Too many requests, please try again later" });
  }

  // Validate the payload shape rather than forwarding whatever arrives. Vercel
  // parses JSON bodies; a non-object body means a malformed or hostile caller.
  const body = req.body as unknown;
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return res.status(400).json({ message: "Expected a GraphQL request body" });
  }

  const { query, variables, operationName } = body as Record<string, unknown>;

  if (typeof query !== "string" || query.length === 0 || query.length > MAX_QUERY_LENGTH) {
    return res.status(400).json({ message: "Invalid GraphQL query" });
  }
  if (variables !== undefined && (typeof variables !== "object" || variables === null || Array.isArray(variables))) {
    return res.status(400).json({ message: "Invalid GraphQL variables" });
  }
  if (operationName !== undefined && typeof operationName !== "string") {
    return res.status(400).json({ message: "Invalid operation name" });
  }
  // Don't let the proxy hand out the store's full schema.
  if (/\b__schema\b|\b__type\b/.test(query)) {
    return res.status(400).json({ message: "Introspection is not supported" });
  }

  const token = process.env.SHOPIFY_STOREFRONT_TOKEN;
  const domain = process.env.SHOPIFY_STORE_DOMAIN;

  // Check if Shopify is configured
  if (!token || !domain) {
    return res.status(503).json({
      shopifyDisabled: true,
      message: "Shopify is not configured. Set SHOPIFY_STORE_DOMAIN and SHOPIFY_STOREFRONT_TOKEN.",
    });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT_MS);

  try {
    // Forward only the validated GraphQL fields — never the raw body.
    const shopifyRes = await fetch(`https://${domain}/api/2024-01/graphql.json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": token,
      },
      body: JSON.stringify({ query, variables, operationName }),
      signal: controller.signal,
    });

    const data = await shopifyRes.json();
    return res.status(shopifyRes.status).json(data);
  } catch (err) {
    console.error("[Shopify proxy] Error:", err);
    const aborted = err instanceof Error && err.name === "AbortError";
    return res.status(aborted ? 504 : 502).json({ message: "Failed to reach Shopify" });
  } finally {
    clearTimeout(timeout);
  }
}
