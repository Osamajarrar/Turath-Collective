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

// ── Product Reviews (self-hosted groundwork) ─────────────────────────────────
// Reviews are stored server-side (file-backed for now — see server/reviews.ts)
// and require founder approval before appearing publicly: `approved` defaults
// to false and only approved reviews are ever returned by the public API.
// When the Postgres DB is provisioned, replace the file store with a Drizzle
// table using these same fields.

export const insertReviewSchema = z.object({
  productHandle: z.string().trim().min(1).max(200),
  name: z.string().trim().min(1).max(100),
  rating: z.number().int().min(1).max(5),
  text: z.string().trim().min(1).max(2000),
});

export type InsertReview = z.infer<typeof insertReviewSchema>;

export interface ProductReview extends InsertReview {
  id: string;
  submittedAt: string;
  approved: boolean;
}

/** Shape returned by the public API (never includes unapproved rows). */
export type PublicReview = Omit<ProductReview, "approved">;
