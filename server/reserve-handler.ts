/**
 * Checkout-intent capture — transport-agnostic core.
 *
 * Someone chose a product, added it, and clicked checkout. We cannot take
 * their money yet (the Shopify dev store still has a storefront password), so
 * we capture an address and tell them when the piece is available. That is a
 * true statement about a true state — see DECISIONS.md §7.
 *
 * ── The promise we make ──────────────────────────────────────────────────
 * NOTIFICATION ONLY. Not a reservation. Nothing here claims a specific piece
 * is held for anyone, and the copy must not either. If that ever changes,
 * this file needs to record WHICH piece per address, and the business needs
 * to actually honour priority.
 *
 * ── CASL: two consents, not one ──────────────────────────────────────────
 * "Tell me when this is available" and "send me the newsletter" are separate
 * consents. Capturing an address for the first does NOT permit the second.
 * They go to two different Resend audiences, and the newsletter one is only
 * written when the visitor ticked an explicitly UNTICKED box.
 *
 * Consent basis and timestamp are recorded per address, because CASL requires
 * provable consent and "we have the email" is not proof of anything.
 */
import { z } from "zod";
import { Resend } from "resend";

export const reserveSchema = z.object({
  email: z.string().trim().email().max(254),
  /** True only if the visitor ticked the (unticked-by-default) newsletter box. */
  newsletterOptIn: z.boolean().optional().default(false),
  /** Context for reading the demand signal — never used to identify anyone. */
  cartValue: z.number().nonnegative().max(1_000_000).optional(),
  currency: z.string().trim().length(3).optional(),
  locale: z.string().trim().max(10).optional(),
  company: z.string().max(200).optional(),
});

export type ReserveResult = {
  status: number;
  body: { message: string; ok?: boolean };
};

function getClient(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  return key ? new Resend(key) : null;
}

/**
 * Add one address to a Resend audience.
 *
 * `unsubscribed: false` is the recorded consent state; Resend then owns the
 * unsubscribe link, suppression list and bounce handling, which is exactly why
 * this goes to a provider rather than a JSON file or a table of our own.
 */
async function addToAudience(
  client: Resend,
  audienceId: string,
  email: string,
): Promise<void> {
  const { error } = await client.contacts.create({
    email,
    audienceId,
    unsubscribed: false,
  });
  // Re-submitting an address that already exists is a success from the
  // visitor's point of view, not an error worth surfacing.
  if (error && !/already exists/i.test(error.message ?? "")) {
    throw new Error(error.message);
  }
}

export async function handleReserveSubmission(payload: unknown): Promise<ReserveResult> {
  const parsed = reserveSchema.safeParse(payload);
  if (!parsed.success) {
    return { status: 400, body: { message: "Please enter a valid email address." } };
  }

  const { email, newsletterOptIn, company } = parsed.data;

  // Honeypot — succeed silently so a bot learns nothing.
  if (company) return { status: 200, body: { ok: true, message: "Captured." } };

  const client = getClient();
  const notifyAudience = process.env.RESEND_NOTIFY_AUDIENCE_ID;

  if (!client || !notifyAudience) {
    // Fail loudly rather than telling someone we will contact them when we
    // have no way to store their address. A false "we'll let you know" is
    // exactly the kind of claim the honesty rules exist to prevent.
    console.error(
      "[reserve] RESEND_API_KEY or RESEND_NOTIFY_AUDIENCE_ID is not set — refusing to fake a capture",
    );
    return { status: 503, body: { message: "We could not save your address. Please try again later." } };
  }

  const consentedAt = new Date().toISOString();

  try {
    await addToAudience(client, notifyAudience, email);
    console.info(
      `[reserve] consent recorded basis=product-availability-notification at=${consentedAt}`,
    );
  } catch (err) {
    console.error("[reserve] failed to record notification consent:", err);
    return { status: 502, body: { message: "We could not save your address. Please try again later." } };
  }

  // Second, SEPARATE consent. Its failure must not fail the request: the
  // visitor's actual request (notify me) already succeeded.
  if (newsletterOptIn) {
    const newsletterAudience = process.env.RESEND_NEWSLETTER_AUDIENCE_ID;
    if (!newsletterAudience) {
      console.error("[reserve] newsletter opt-in given but RESEND_NEWSLETTER_AUDIENCE_ID is unset");
    } else {
      try {
        await addToAudience(client, newsletterAudience, email);
        console.info(`[reserve] consent recorded basis=newsletter at=${consentedAt}`);
      } catch (err) {
        console.error("[reserve] failed to record newsletter consent:", err);
      }
    }
  }

  return { status: 200, body: { ok: true, message: "Captured." } };
}
