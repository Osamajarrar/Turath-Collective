// Self-hosted product reviews — groundwork only (no third-party review app).
//
// Reviews are stored in a local JSON file with `approved: false` by default.
// Nothing is published without founder approval: the public read path only
// ever returns approved rows. To approve a review, edit
// data/product-reviews.json and set its "approved" field to true (see the PR
// that added this for a one-liner).
//
// NOTE: the production Vercel deploy only runs api/*.ts serverless functions,
// and its filesystem is ephemeral — this store works in local/dev and on any
// long-lived Node host. Going live requires a persistent store (the DB in
// shared/schema.ts once provisioned).

import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import type { InsertReview, ProductReview, PublicReview } from "@shared/schema";

// data/ is gitignored — reviewer names are user-submitted content/PII.
const DATA_DIR = path.join(process.cwd(), "data");
const REVIEWS_FILE = path.join(DATA_DIR, "product-reviews.json");

async function readReviews(): Promise<ProductReview[]> {
  try {
    return JSON.parse(await fs.readFile(REVIEWS_FILE, "utf8"));
  } catch {
    return [];
  }
}

function toPublic(review: ProductReview): PublicReview {
  const { approved: _approved, ...publicFields } = review;
  return publicFields;
}

/** Store a new review; always unapproved until the founder approves it. */
export async function addReview(input: InsertReview): Promise<{ id: string }> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  const reviews = await readReviews();
  const review: ProductReview = {
    ...input,
    id: randomUUID(),
    submittedAt: new Date().toISOString(),
    approved: false,
  };
  reviews.push(review);
  await fs.writeFile(REVIEWS_FILE, JSON.stringify(reviews, null, 2));
  return { id: review.id };
}

/** Approved reviews for one product (public). */
export async function getApprovedReviews(productHandle: string): Promise<PublicReview[]> {
  const reviews = await readReviews();
  return reviews
    .filter((r) => r.approved && r.productHandle === productHandle)
    .map(toPublic);
}

/** All approved reviews (public) — used by the homepage carousel. */
export async function getAllApprovedReviews(): Promise<PublicReview[]> {
  const reviews = await readReviews();
  return reviews.filter((r) => r.approved).map(toPublic);
}
