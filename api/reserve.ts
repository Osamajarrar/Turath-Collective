/**
 * Checkout-intent email capture (Vercel Function).
 *
 * Production endpoint — Vercel never runs server/index.ts. Mirrors
 * api/contact.ts; the validation, consent recording and Resend calls live in
 * server/reserve-handler.ts, shared with the local Express route.
 *
 * Environment variables:
 * - RESEND_API_KEY
 * - RESEND_NOTIFY_AUDIENCE_ID       — "tell me when this is available"
 * - RESEND_NEWSLETTER_AUDIENCE_ID   — the SEPARATE newsletter consent
 *
 * Without the first two the handler returns 503 rather than pretending to
 * capture the address.
 */

import type { VercelRequest, VercelResponse } from "@vercel/node";
import { handleReserveSubmission } from "../server/reserve-handler";

const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
const RATE_LIMIT_MAX = 10;
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
    return res.status(429).json({ message: "Too many attempts. Please try again later." });
  }

  const result = await handleReserveSubmission(req.body);
  return res.status(result.status).json(result.body);
}
