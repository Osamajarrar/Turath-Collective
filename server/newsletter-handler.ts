/**
 * Newsletter signup — transport-agnostic core.
 *
 * Replaces the file-backed store in server/newsletter.ts. A JSON file on disk
 * could not run on Workers at all, and more importantly it gave us none of
 * what CASL actually requires: a working unsubscribe, provable consent
 * records, suppression and bounce handling. Resend Audiences provide all of
 * those. See DECISIONS.md §3 and plan 10 phase 6c.
 *
 * This is the NEWSLETTER consent specifically. The checkout-intent capture in
 * reserve-handler.ts is a different consent and a different audience — do not
 * merge them.
 */
import { z } from "zod";
import { Resend } from "resend";

export const newsletterSchema = z.object({
  email: z.string().trim().email().max(254),
  company: z.string().max(200).optional(),
});

export type NewsletterResult = {
  status: number;
  body: { message?: string; ok?: boolean };
};

export async function handleNewsletterSubmission(payload: unknown): Promise<NewsletterResult> {
  const parsed = newsletterSchema.safeParse(payload);
  if (!parsed.success) {
    return { status: 400, body: { message: "Please enter a valid email address" } };
  }

  const { email, company } = parsed.data;
  if (company) return { status: 200, body: { ok: true } };

  const key = process.env.RESEND_API_KEY;
  const audienceId = process.env.RESEND_NEWSLETTER_AUDIENCE_ID;

  if (!key || !audienceId) {
    // Never report a subscription we did not record.
    console.error("[newsletter] RESEND_API_KEY or RESEND_NEWSLETTER_AUDIENCE_ID unset");
    return { status: 503, body: { message: "Signup is unavailable right now. Please try again later." } };
  }

  try {
    const { error } = await new Resend(key).contacts.create({
      email,
      audienceId,
      unsubscribed: false,
    });
    // Respond identically whether or not the address was already present, so
    // the endpoint cannot be used to probe who is subscribed.
    if (error && !/already exists/i.test(error.message ?? "")) {
      throw new Error(error.message);
    }
    console.info(`[newsletter] consent recorded basis=newsletter at=${new Date().toISOString()}`);
    return { status: 200, body: { ok: true } };
  } catch (err) {
    console.error("[newsletter] failed to record subscriber:", err);
    return { status: 502, body: { message: "Signup is unavailable right now. Please try again later." } };
  }
}
