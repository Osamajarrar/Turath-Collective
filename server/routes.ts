import type { Express } from "express";
import { createServer, type Server } from "http";
import { z } from "zod";
import { storage } from "./storage";
import { sendContactEmail, sendContactConfirmation, sendNewsletterWelcome } from "./email";
import { insertContactSchema, insertNewsletterSchema } from "@shared/schema";

export async function registerRoutes(httpServer: Server, app: Express): Promise<Server> {

  // POST /api/contact — contact form submission
  app.post("/api/contact", async (req, res) => {
    const parsed = insertContactSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: "Invalid input", errors: parsed.error.flatten() });

    const msg = await storage.createContactMessage(parsed.data);

    // Fire emails without blocking response
    sendContactEmail(parsed.data).catch(console.error);
    sendContactConfirmation(parsed.data.email, parsed.data.name).catch(console.error);

    return res.status(201).json({ message: "Message received", id: msg.id });
  });

  // POST /api/newsletter — newsletter signup
  app.post("/api/newsletter", async (req, res) => {
    const parsed = insertNewsletterSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: "Invalid email" });

    const existing = await storage.getSubscriber(parsed.data.email);
    if (existing) return res.status(200).json({ message: "Already subscribed" });

    await storage.createSubscriber(parsed.data);
    sendNewsletterWelcome(parsed.data.email).catch(console.error);

    return res.status(201).json({ message: "Subscribed successfully" });
  });

  // GET /api/health — health check
  app.get("/api/health", (_req, res) => {
    res.json({
      status: "ok",
      email: !!process.env.RESEND_API_KEY ? "live" : "dev (no RESEND_API_KEY)",
      shopify: !!process.env.SHOPIFY_STOREFRONT_TOKEN ? "connected" : "not connected",
    });
  });

  return httpServer;
}
