/**
 * Contact form endpoint (Vercel Function).
 *
 * This is the handler that actually runs in production — the Express route in
 * server/routes.ts only serves the local Node host, so anything that route
 * relies on has to exist here too. Same split as api/shopify.ts.
 *
 * Validation and delivery live in server/contact-handler.ts, shared by both.
 * What is specific to being a public HTTP endpoint lives here:
 *   - POST only
 *   - same-origin enforcement when the caller is a browser
 *   - per-IP rate limit (per warm instance — see note below)
 *
 * Environment variables:
 * - RESEND_API_KEY: without it, server/email.ts logs instead of sending, so
 *   the form reports success while nothing is delivered. It MUST be set in
 *   production.
 */

import type { VercelRequest, VercelResponse } from "@vercel/node";
import { handleContactSubmission } from "../server/contact-handler";

// Deliberately tighter than the Shopify proxy's 60/min: this endpoint sends
// email, so abuse costs money and reputation, not just CPU.
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
const RATE_LIMIT_MAX = 5;
const hits = new Map<string, { count: number; resetAt: number }>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = hits.get(ip);

  if (!entry || now > entry.resetAt) {
    hits.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
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
  if (!origin) return true;
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
    res.setHeader("Retry-After", "3600");
    return res.status(429).json({
      message: "Too many messages from this address. Please try again later.",
    });
  }

  const result = await handleContactSubmission(req.body);
  return res.status(result.status).json(result.body);
}
