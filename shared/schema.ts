import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ── Users (Deferred) ──────────────────────────────────────────────────────────
// v1 Launch uses Shopify customer accounts. Custom auth backend kept for future.
// To re-enable: uncomment schema below and restore auth routes in App.tsx
//
// export const users = pgTable("users", {
//   id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
//   email: text("email").notNull().unique(),
//   passwordHash: text("password_hash"),
//   firstName: text("first_name"),
//   lastName: text("last_name"),
//   createdAt: timestamp("created_at").defaultNow(),
// });

// ── Contact Messages (Deferred) ───────────────────────────────────────────────
// /api/contact route currently disabled for v1 Launch.
// To re-enable: uncomment schema below and restore route in server/routes.ts
//
// export const contactMessages = pgTable("contact_messages", {
//   id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
//   name: text("name").notNull(),
//   email: text("email").notNull(),
//   subject: text("subject").notNull(),
//   message: text("message").notNull(),
//   createdAt: timestamp("created_at").defaultNow(),
// });

// ── Newsletter Subscribers ────────────────────────────────────────────────────
// REMOVED: DB storage deferred. Newsletter form UI remains; connect to
// Mailchimp / Klaviyo when ready. Table will be dropped on next db:push.
