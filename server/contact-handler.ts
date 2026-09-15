/**
 * Contact form — transport-agnostic core.
 *
 * Deliberately knows nothing about Express or Vercel, because the form has to
 * work on BOTH: server/routes.ts serves the local Node host, and api/contact.ts
 * is what actually runs in production (Vercel never executes server/index.ts —
 * see DECISIONS.md §1). Putting the validation in one place is the only way the
 * two cannot drift, which is the same trap the CSP duplication created.
 *
 * Plan 10 collapses this to a single Hono handler.
 */
import { z } from "zod";
import { sendContactEmail, sendContactConfirmation } from "./email";

export const contactSchema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(254),
  subject: z.string().trim().min(1).max(200),
  message: z.string().trim().min(1).max(5000),
  // Honeypot: a field no human sees and no human fills. Bots fill everything.
  // Accepts ANY string on purpose — validating it to empty would reject the
  // bot at the schema and never reach the silent-discard branch below, which
  // is what tells the bot nothing about why it failed.
  company: z.string().max(200).optional(),
});

export type ContactResult = {
  status: number;
  body: { message: string; ok?: boolean };
};

const GENERIC_ERROR =
  "We could not send your message. Please email us directly at support@turathcollective.com.";

/**
 * Validate and deliver one contact submission.
 *
 * Returns a plain {status, body} so each transport just serialises it.
 * Never reports success unless the admin email actually went out — a form that
 * says "message received" while dropping the message is the same class of lie
 * as the notify-me button that only logged to the console.
 */
export async function handleContactSubmission(payload: unknown): Promise<ContactResult> {
  const parsed = contactSchema.safeParse(payload);

  if (!parsed.success) {
    // Deliberately not echoing the field errors: this endpoint is public and
    // unauthenticated, and the client already validates for real users.
    return {
      status: 400,
      body: { message: "Please check the form and try again." },
    };
  }

  const { company, ...data } = parsed.data;

  // Honeypot tripped. Return the success shape so a bot learns nothing, but
  // send no mail.
  if (company) {
    return { status: 200, body: { ok: true, message: "Message received." } };
  }

  try {
    // The admin email is the one that matters — it is the actual delivery.
    await sendContactEmail(data);
  } catch (err) {
    console.error("[contact] failed to send admin email:", err);
    return { status: 502, body: { message: GENERIC_ERROR } };
  }

  try {
    await sendContactConfirmation(data.email, data.name);
  } catch (err) {
    // The founder HAS the message; failing the whole request here would make
    // the visitor send it again. Log and succeed.
    console.error("[contact] confirmation email failed (message still delivered):", err);
  }

  return { status: 200, body: { ok: true, message: "Message received." } };
}
