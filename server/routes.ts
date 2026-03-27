import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { z } from "zod";
import passport from "passport";
import { storage } from "./storage";
import { hashPassword } from "./auth";
import { sendContactEmail, sendContactConfirmation, sendNewsletterWelcome } from "./email";
import { insertContactSchema, insertNewsletterSchema } from "@shared/schema";

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
});

export async function registerRoutes(httpServer: Server, app: Express): Promise<Server> {

  // ── Auth ──────────────────────────────────────────────────

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
      return res.status(201).json({ id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName });
    });
  });

  app.post("/api/auth/login", (req: Request, res: Response, next) => {
    passport.authenticate("local", (err: any, user: Express.User | false, info: { message: string } | undefined) => {
      if (err) return next(err);
      if (!user) return res.status(401).json({ message: info?.message || "Invalid credentials" });
      req.login(user, (err) => {
        if (err) return next(err);
        return res.json({ id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName });
      });
    })(req, res, next);
  });

  app.post("/api/auth/logout", (req: Request, res: Response) => {
    req.logout(() => {
      res.json({ message: "Logged out" });
    });
  });

  app.get("/api/me", (req: Request, res: Response) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
    return res.json(req.user);
  });

  // ── Contact ───────────────────────────────────────────────

  app.post("/api/contact", async (req: Request, res: Response) => {
    const parsed = insertContactSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: "Invalid input", errors: parsed.error.flatten() });

    const msg = await storage.createContactMessage(parsed.data);
    sendContactEmail(parsed.data).catch(console.error);
    sendContactConfirmation(parsed.data.email, parsed.data.name).catch(console.error);

    return res.status(201).json({ message: "Message received", id: msg.id });
  });

  // ── Newsletter ────────────────────────────────────────────

  app.post("/api/newsletter", async (req: Request, res: Response) => {
    const parsed = insertNewsletterSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: "Invalid email" });

    const existing = await storage.getSubscriber(parsed.data.email);
    if (existing) return res.status(200).json({ message: "Already subscribed" });

    await storage.createSubscriber(parsed.data);
    sendNewsletterWelcome(parsed.data.email).catch(console.error);

    return res.status(201).json({ message: "Subscribed successfully" });
  });

  // ── Health ────────────────────────────────────────────────

  app.get("/api/health", (_req: Request, res: Response) => {
    res.json({
      status: "ok",
      email: !!process.env.RESEND_API_KEY ? "live" : "dev (no RESEND_API_KEY)",
      shopify: !!process.env.SHOPIFY_STOREFRONT_TOKEN ? "connected" : "not connected",
    });
  });

  return httpServer;
}
