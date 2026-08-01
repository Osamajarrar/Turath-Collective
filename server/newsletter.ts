// Newsletter subscriber capture — groundwork only, no email provider.
//
// Emails are validated in the route and stored to a local JSON file so the
// list is easy to migrate once the founder picks a provider (Mailchimp,
// Resend, Klaviyo, …). No third-party API calls happen here.
//
// NOTE: the production Vercel deploy only runs api/*.ts serverless functions,
// and its filesystem is ephemeral — this store works in local/dev and on any
// long-lived Node host, but going live requires a persistent store (DB or
// the chosen provider's API). Flagged in the PR that added this.

import path from "path";
import { readJsonFile, withStoreLock, writeJsonAtomic } from "./json-store";

// data/ is gitignored — subscriber emails are PII and must never be committed.
const DATA_DIR = path.join(process.cwd(), "data");
const SUBSCRIBERS_FILE = path.join(DATA_DIR, "newsletter-subscribers.json");

interface Subscriber {
  email: string;
  subscribedAt: string;
}

/** Store an email (deduplicated, lowercased). Returns whether it was new. */
export async function addNewsletterSubscriber(email: string): Promise<{ added: boolean }> {
  const normalized = email.trim().toLowerCase();
  // Locked: two simultaneous signups would otherwise both read the old list
  // and the second write would drop the first subscriber.
  return withStoreLock(SUBSCRIBERS_FILE, async () => {
    const subscribers = await readJsonFile<Subscriber[]>(SUBSCRIBERS_FILE, []);
    if (subscribers.some((s) => s.email === normalized)) {
      return { added: false };
    }
    subscribers.push({ email: normalized, subscribedAt: new Date().toISOString() });
    await writeJsonAtomic(SUBSCRIBERS_FILE, subscribers);
    return { added: true };
  });
}
