/**
 * Email service using Resend.
 * Set RESEND_API_KEY environment variable to enable real email sending.
 * Without the key, emails are logged to console (development mode).
 */

import { Resend } from "resend";

const FROM_EMAIL = "Turath Collective <noreply@turathcollective.com>";
const ADMIN_EMAIL = "collectiveturath@gmail.com";

/**
 * Escape user-submitted text before it goes into an HTML email body.
 * Without this, a contact-form message could inject markup (or a link/script
 * payload) into the mail the founder opens.
 */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function getClient() {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    // In production a missing key is NOT a "log it instead" situation: the
    // contact form would tell a visitor "message received" while the message
    // went nowhere. Fail loudly so the caller returns an error instead of a
    // false success. Locally, logging is the intended developer experience.
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "RESEND_API_KEY is not set. Refusing to report a delivered email that was never sent.",
      );
    }
    return null;
  }
  return new Resend(key);
}

export async function sendContactEmail(data: {
  name: string;
  email: string;
  subject: string;
  message: string;
}) {
  const client = getClient();

  if (!client) {
    console.log("[Email - DEV] Contact form submission:", data);
    return { success: true, dev: true };
  }

  const { error } = await client.emails.send({
    from: FROM_EMAIL,
    to: ADMIN_EMAIL,
    replyTo: data.email,
    subject: `[Turath Collective] ${data.subject}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
        <h2 style="color:primary">New Contact Message</h2>
        <p><strong>From:</strong> ${escapeHtml(data.name)} &lt;${escapeHtml(data.email)}&gt;</p>
        <p><strong>Subject:</strong> ${escapeHtml(data.subject)}</p>
        <hr/>
        <p style="white-space:pre-line">${escapeHtml(data.message)}</p>
      </div>
    `,
  });

  if (error) throw new Error(error.message);
  return { success: true };
}

export async function sendContactConfirmation(to: string, name: string) {
  const client = getClient();

  if (!client) {
    console.log("[Email - DEV] Confirmation to:", to);
    return { success: true, dev: true };
  }

  const { error } = await client.emails.send({
    from: FROM_EMAIL,
    to,
    subject: "We received your message — Turath Collective",
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
        <h2 style="color:primary">Thank you, ${escapeHtml(name)}</h2>
        <!-- This previously promised a reply "within 1–2 business days". That
             is a commitment nobody has agreed to keep, and CLAUDE.md hard rule
             4 requires any stated number to be true. Restore a specific window
             only when the founder will actually honour it, and make the
             contact page's success message say the same thing. -->
        <p>We've received your message and will reply as soon as we can.</p>
        <p style="color:#888;font-size:12px;margin-top:40px">Turath Collective · Montreal, QC · turathcollective.com</p>
      </div>
    `,
  });

  if (error) throw new Error(error.message);
  return { success: true };
}

/**
 * ⚠ NOT SAFE TO CALL YET — CASL.
 *
 * Nothing calls this today, which is the only reason it has not caused a
 * problem. As written it is a commercial electronic message with NO
 * unsubscribe mechanism, which CASL requires (with real penalties), and it
 * promised "exclusive offers" nobody has consented to receive.
 *
 * The "exclusive offers" line is removed below. Before anything calls this:
 *   1. send it through a Resend Audience so managed unsubscribe + suppression
 *      apply, rather than a bare emails.send();
 *   2. include the sender's physical mailing address;
 *   3. confirm the recipient consented to the NEWSLETTER specifically — a
 *      "tell me when this piece is available" address is a different consent
 *      and does not authorise this message.
 *
 * See plan 11 branch 7 (email templates).
 */
export async function sendNewsletterWelcome(to: string) {
  const client = getClient();

  if (!client) {
    console.log("[Email - DEV] Newsletter welcome to:", to);
    return { success: true, dev: true };
  }

  const { error } = await client.emails.send({
    from: FROM_EMAIL,
    to,
    subject: "Welcome to Turath Collective",
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
        <h2 style="color:primary">Welcome to the Collective</h2>
        <p>You're now part of a community that celebrates Palestinian heritage craftsmanship.</p>
        <p>We'll write when there's something worth sharing — new collections and the stories behind them.</p>
        <p style="color:#888;font-size:12px;margin-top:40px">Turath Collective · Montreal, QC · turathcollective.com</p>
      </div>
    `,
  });

  if (error) throw new Error(error.message);
  return { success: true };
}
