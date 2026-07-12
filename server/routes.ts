import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { z } from "zod";
import passport from "passport";
import rateLimit from "express-rate-limit";
import { storage } from "./storage";
import { hashPassword } from "./auth";
import { shopifyLimiter } from "./index.js";
import { getPostHog } from "./posthog";
import { addNewsletterSubscriber } from "./newsletter";
import { insertReviewSchema } from "@shared/schema";
import { addReview, getApprovedReviews, getAllApprovedReviews } from "./reviews";

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  firstName: z.string().optional().transform(v => v?.trim() || null),
  lastName: z.string().optional().transform(v => v?.trim() || null),
});

export async function registerRoutes(httpServer: Server, app: Express): Promise<Server> {

  // ── Auth ──────────────────────────────────────────────────────────────────
  // DEFERRED: routes disabled for launch v1 (no auth UI, users table not
  // provisioned). Backend + session logic kept in place for future launch —
  // flip AUTH_ENABLED to re-enable rather than reimplementing.
  const AUTH_ENABLED = false;

  if (AUTH_ENABLED) {

  app.post("/api/auth/register", async (req: Request, res: Response) => {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: parsed.error.errors[0].message });
    }
    const { email, password, firstName, lastName } = parsed.data;

    const existing = await storage.getUserByEmail(email);
    if (existing) return res.status(409).json({ message: "An account with this email already exists" });

    const passwordHash = await hashPassword(password);
    const user = await storage.createUser({ email, passwordHash, firstName: firstName ?? null, lastName: lastName ?? null });

    req.login({ id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName }, (err) => {
      if (err) return res.status(500).json({ message: "Login after register failed" });
      getPostHog()?.capture({
        distinctId: String(user.id),
        event: "user_registered",
      });
      return res.status(201).json({ id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName });
    });
  });

  app.post("/api/auth/login", (req: Request, res: Response, next) => {
    passport.authenticate("local", (err: any, user: Express.User | false, info: { message: string } | undefined) => {
      if (err) return next(err);
      if (!user) return res.status(401).json({ message: info?.message || "Invalid credentials" });
      req.login(user, (err) => {
        if (err) return next(err);
        getPostHog()?.capture({
          distinctId: String(user.id),
          event: "user_logged_in",
        });
        return res.json({ id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName });
      });
    })(req, res, next);
  });

  app.post("/api/auth/logout", (req: Request, res: Response) => {
    req.logout((err) => {
      if (err) return res.status(500).json({ message: "Logout failed" });
      res.json({ message: "Logged out" });
    });
  });

  app.get("/api/me", (req: Request, res: Response) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
    return res.json(req.user);
  });

  } // AUTH_ENABLED

  // ── Contact ───────────────────────────────────────────────────────────────
  // DEFERRED: route disabled for launch v1. UI form remains visible.
  // Re-enable by restoring this route and wiring sendContactEmail / storage.

  // ── Newsletter ────────────────────────────────────────────────────────────
  // Groundwork only: validates and stores the email locally (see
  // server/newsletter.ts). Swap the storage call for the chosen provider's
  // API when the founder picks one. Success is only reported after the email
  // is actually persisted — no fake success states.

  const newsletterLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 5,
    message: "Too many signup attempts, please try again later",
    standardHeaders: true,
    legacyHeaders: false,
  });

  const newsletterSchema = z.object({ email: z.string().email().max(254) });

  app.post("/api/newsletter", newsletterLimiter, async (req: Request, res: Response) => {
    const parsed = newsletterSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Please enter a valid email address" });
    }
    try {
      // Deduplicated internally; respond identically either way so the
      // endpoint can't be used to probe whether an email is subscribed.
      await addNewsletterSubscriber(parsed.data.email);
      return res.status(200).json({ ok: true });
    } catch (err) {
      console.error("[Newsletter] Failed to store subscriber:", err);
      return res.status(500).json({ message: "Failed to save subscription" });
    }
  });

  // ── Product Reviews (self-hosted groundwork) ──────────────────────────────
  // Submissions land unapproved and are never published automatically; the
  // public GET endpoints only return approved rows. See server/reviews.ts.

  const reviewLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 5,
    message: "Too many review submissions, please try again later",
    standardHeaders: true,
    legacyHeaders: false,
  });

  app.post("/api/reviews", reviewLimiter, async (req: Request, res: Response) => {
    const parsed = insertReviewSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: parsed.error.errors[0]?.message ?? "Invalid review" });
    }
    try {
      await addReview(parsed.data);
      // 202: accepted for moderation, not published.
      return res.status(202).json({ ok: true });
    } catch (err) {
      console.error("[Reviews] Failed to store review:", err);
      return res.status(500).json({ message: "Failed to save review" });
    }
  });

  app.get("/api/reviews", async (_req: Request, res: Response) => {
    try {
      return res.json({ reviews: await getAllApprovedReviews() });
    } catch (err) {
      console.error("[Reviews] Failed to read reviews:", err);
      return res.status(500).json({ message: "Failed to load reviews" });
    }
  });

  app.get("/api/reviews/:productHandle", async (req: Request, res: Response) => {
    try {
      const handle = String(req.params.productHandle ?? "");
      return res.json({ reviews: await getApprovedReviews(handle) });
    } catch (err) {
      console.error("[Reviews] Failed to read reviews:", err);
      return res.status(500).json({ message: "Failed to load reviews" });
    }
  });

  // ── Shopify Storefront proxy ──────────────────────────────────────────────

  app.post("/api/shopify", shopifyLimiter, async (req: Request, res: Response) => {
    const token = process.env.SHOPIFY_STOREFRONT_TOKEN;
    const domain = process.env.SHOPIFY_STORE_DOMAIN;

    if (!token || !domain) {
      return res.status(503).json({
        shopifyDisabled: true,
        message: "Shopify is not configured. Set SHOPIFY_STORE_DOMAIN and SHOPIFY_STOREFRONT_TOKEN to enable live products.",
      });
    }

    try {
      const shopifyRes = await fetch(`https://${domain}/api/2024-01/graphql.json`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Storefront-Access-Token": token,
        },
        body: JSON.stringify(req.body),
      });

      const data = await shopifyRes.json();
      return res.status(shopifyRes.status).json(data);
    } catch (err) {
      console.error("[Shopify proxy] Error:", err);
      return res.status(502).json({ message: "Failed to reach Shopify" });
    }
  });

  // ── Health ────────────────────────────────────────────────────────────────

  app.get("/api/health", (_req: Request, res: Response) => {
    res.json({
      status: "ok",
      shopify: !!process.env.SHOPIFY_STOREFRONT_TOKEN && !!process.env.SHOPIFY_STORE_DOMAIN
        ? "connected"
        : "not configured",
    });
  });

  return httpServer;
}
