// Internal admin surface — groundwork only, nothing here is public-facing.
//
// Scope (deliberately minimal, a foundation not a panel):
//   - inventory counts per SKU        (file-backed, works locally today)
//   - category assignment per product (file-backed, works locally today)
//   - order status tracking           (via IStorage — deferred until the
//                                      orders table is provisioned, so these
//                                      endpoints surface the deferred error)
//
// Gating: registerAdminRoutes is only called when both AUTH_ENABLED and
// ADMIN_ENABLED are true in server/routes.ts (both false today), and every
// route additionally requires a signed-in user whose email is listed in the
// ADMIN_EMAILS env var (comma-separated). With ADMIN_EMAILS unset, everyone
// is denied — there is no default admin.
//
// Storage follows the server/reviews.ts precedent: JSON files in the
// gitignored data/ directory. Same caveat applies — works in local/dev and on
// a long-lived Node host, NOT on Vercel's ephemeral serverless filesystem.
// Note that live stock levels actually live in Shopify; this local inventory
// store is a bookkeeping overlay for crafts-supply planning until a decision
// is made on whether admin should proxy the Shopify Admin API instead.

import path from "path";
import type { Express, Request, Response, NextFunction } from "express";
import { readJsonFile, withStoreLock, writeJsonAtomic } from "./json-store";
import { z } from "zod";
import { ORDER_STATUSES } from "@shared/schema";
import { storage } from "./storage";

const DATA_DIR = path.join(process.cwd(), "data");
const INVENTORY_FILE = path.join(DATA_DIR, "admin-inventory.json");
const CATEGORIES_FILE = path.join(DATA_DIR, "admin-categories.json");

// ── File stores ─────────────────────────────────────────────────────────────

interface InventoryEntry {
  quantity: number;
  updatedAt: string;
}

type InventoryStore = Record<string, InventoryEntry>;

/** productHandle → category handle (e.g. "ceramics"). */
type CategoryStore = Record<string, string>;

const readJson = readJsonFile;
const writeJson = writeJsonAtomic;

// ── Admin gate ──────────────────────────────────────────────────────────────

function adminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated() || !req.user) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  if (!adminEmails().includes(req.user.email.toLowerCase())) {
    return res.status(403).json({ message: "Not authorized" });
  }
  return next();
}

// ── Routes ──────────────────────────────────────────────────────────────────

const inventorySchema = z.object({ quantity: z.number().int().min(0) });
const categorySchema = z.object({ category: z.string().trim().min(1).max(100) });
const orderStatusSchema = z.object({ status: z.enum(ORDER_STATUSES) });
const skuSchema = z.string().trim().min(1).max(200);

export function registerAdminRoutes(app: Express) {
  // Inventory counts per SKU
  app.get("/api/admin/inventory", requireAdmin, async (_req, res) => {
    res.json({ inventory: await readJson<InventoryStore>(INVENTORY_FILE, {}) });
  });

  app.put("/api/admin/inventory/:sku", requireAdmin, async (req, res) => {
    const sku = skuSchema.safeParse(req.params.sku);
    const body = inventorySchema.safeParse(req.body);
    if (!sku.success || !body.success) {
      return res.status(400).json({ message: "Expected a SKU and a non-negative integer quantity" });
    }
    const entry = await withStoreLock(INVENTORY_FILE, async () => {
      const inventory = await readJson<InventoryStore>(INVENTORY_FILE, {});
      inventory[sku.data] = { quantity: body.data.quantity, updatedAt: new Date().toISOString() };
      await writeJson(INVENTORY_FILE, inventory);
      return inventory[sku.data];
    });
    return res.json({ sku: sku.data, ...entry });
  });

  // Category assignment per product handle
  app.get("/api/admin/categories", requireAdmin, async (_req, res) => {
    res.json({ categories: await readJson<CategoryStore>(CATEGORIES_FILE, {}) });
  });

  app.put("/api/admin/categories/:productHandle", requireAdmin, async (req, res) => {
    const handle = skuSchema.safeParse(req.params.productHandle);
    const body = categorySchema.safeParse(req.body);
    if (!handle.success || !body.success) {
      return res.status(400).json({ message: "Expected a product handle and a category" });
    }
    await withStoreLock(CATEGORIES_FILE, async () => {
      const categories = await readJson<CategoryStore>(CATEGORIES_FILE, {});
      categories[handle.data] = body.data.category;
      await writeJson(CATEGORIES_FILE, categories);
    });
    return res.json({ productHandle: handle.data, category: body.data.category });
  });

  // Order status tracking — backed by IStorage, which is deferred until the
  // orders table exists, so these respond 500 with the deferred message today.
  app.get("/api/admin/orders", requireAdmin, async (_req, res) => {
    try {
      return res.json({ orders: await storage.listOrders() });
    } catch (err) {
      console.error("[Admin] Failed to list orders:", err);
      return res.status(500).json({ message: "Order storage is not available yet" });
    }
  });

  app.put("/api/admin/orders/:id/status", requireAdmin, async (req, res) => {
    const body = orderStatusSchema.safeParse(req.body);
    if (!body.success) {
      return res.status(400).json({ message: `Status must be one of: ${ORDER_STATUSES.join(", ")}` });
    }
    try {
      const order = await storage.updateOrderStatus(String(req.params.id), body.data.status);
      if (!order) return res.status(404).json({ message: "Order not found" });
      return res.json({ order });
    } catch (err) {
      console.error("[Admin] Failed to update order status:", err);
      return res.status(500).json({ message: "Order storage is not available yet" });
    }
  });
}
