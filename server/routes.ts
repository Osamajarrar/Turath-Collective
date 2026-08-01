import type { Express, Request, Response } from "express";
import { type Server } from "http";
import { z } from "zod";
import rateLimit from "express-rate-limit";
import { shopifyLimiter } from "./index.js";
import { handleContactSubmission } from "./contact-handler";
import { handleReserveSubmission } from "./reserve-handler";
import { handleNewsletterSubmission } from "./newsletter-handler";

/**
 * LOCAL DEV SERVER ONLY.
 *
 * Production runs worker/index.ts on Cloudflare. This file exists so
 * `npm run dev` keeps serving the same API surface next to Vite's HMR; every
 * route here delegates to the same shared handler the Worker uses, so the two
 * cannot diverge. That divergence is exactly what caused the previous
 * three-way split between this file, api/*.ts and vercel.json.
 *
 * Deleted in the Cloudflare migration (plan 10 phases 6b–6c):
 *   - /api/auth/*, /api/me* — Shopify's Customer Account API owns accounts.
 *     Sessions also need per-request server memory, which Workers has not.
 *   - /api/admin/*          — depended on that auth stack.
 *   - /api/reviews*         — deferred post-MVP; will be rebuilt on D1. A
 *     filesystem implementation that cannot run on the target platform is
 *     worse than no implementation.
 */
export async function registerRoutes(httpServer: Server, app: Express): Promise<Server> {
  // ── Contact ───────────────────────────────────────────────────────────────
  // Tighter limit than the others because this route sends email: abuse costs
  // money and sender reputation, not just CPU.
  const contactLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 5,
    message: "Too many messages from this address. Please try again later.",
    standardHeaders: true,
    legacyHeaders: false,
  });

  app.post("/api/contact", contactLimiter, async (req: Request, res: Response) => {
    const result = await handleContactSubmission(req.body);
    return res.status(result.status).json(result.body);
  });

  // ── Checkout-intent capture ───────────────────────────────────────────────
  const reserveLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 10,
    message: "Too many attempts. Please try again later.",
    standardHeaders: true,
    legacyHeaders: false,
  });

  app.post("/api/reserve", reserveLimiter, async (req: Request, res: Response) => {
    const result = await handleReserveSubmission(req.body);
    return res.status(result.status).json(result.body);
  });

  // ── Newsletter ────────────────────────────────────────────────────────────
  // Now a Resend audience rather than a JSON file — the provider supplies the
  // CASL-required unsubscribe, consent records and bounce handling.
  const newsletterLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 5,
    message: "Too many signup attempts, please try again later",
    standardHeaders: true,
    legacyHeaders: false,
  });

  app.post("/api/newsletter", newsletterLimiter, async (req: Request, res: Response) => {
    const result = await handleNewsletterSubmission(req.body);
    return res.status(result.status).json(result.body);
  });

  // ── Shopify Storefront proxy ──────────────────────────────────────────────
  // Mirrors worker/index.ts. The endpoint is unauthenticated and holds the
  // storefront token, so the request is validated and REBUILT, never relayed.
  const graphqlRequestSchema = z.object({
    query: z.string().min(1).max(20_000),
    variables: z.record(z.unknown()).optional(),
    operationName: z.string().max(200).optional(),
  });

  app.post("/api/shopify", shopifyLimiter, async (req: Request, res: Response) => {
    const parsed = graphqlRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Expected a GraphQL request body" });
    }
    const { query, variables, operationName } = parsed.data;

    // Don't let the proxy hand out the store's full schema.
    if (/\b__schema\b|\b__type\b/.test(query)) {
      return res.status(400).json({ message: "Introspection is not supported" });
    }

    const token = process.env.SHOPIFY_STOREFRONT_TOKEN;
    const domain = process.env.SHOPIFY_STORE_DOMAIN;

    if (!token || !domain) {
      // Exact shape the client keys off to fall back to mock data.
      return res.status(503).json({
        shopifyDisabled: true,
        message:
          "Shopify is not configured. Set SHOPIFY_STORE_DOMAIN and SHOPIFY_STOREFRONT_TOKEN to enable live products.",
      });
    }

    try {
      const shopifyRes = await fetch(`https://${domain}/api/2024-01/graphql.json`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Storefront-Access-Token": token,
        },
        body: JSON.stringify({ query, variables, operationName }),
        signal: AbortSignal.timeout(10_000),
      });
      const data = await shopifyRes.json();
      return res.status(shopifyRes.status).json(data);
    } catch (err) {
      console.error("[Shopify proxy] Error:", err);
      const aborted = err instanceof Error && err.name === "TimeoutError";
      return res.status(aborted ? 504 : 502).json({ message: "Failed to reach Shopify" });
    }
  });

  // ── Health ────────────────────────────────────────────────────────────────
  app.get("/api/health", (_req: Request, res: Response) => res.json({ status: "ok" }));

  return httpServer;
}
