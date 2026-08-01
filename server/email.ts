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
  if (!key) return null;
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
        <p>We've received your message and will get back to you within 1–2 business days.</p>
        <p style="color:#888;font-size:12px;margin-top:40px">Turath Collective · Montreal, QC · turathcollective.com</p>
      </div>
    `,
  });

  if (error) throw new Error(error.message);
  return { success: true };
}

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
        <p>Expect early access to new collections, artisan stories, and exclusive offers.</p>
        <p style="color:#888;font-size:12px;margin-top:40px">Turath Collective · Montreal, QC · turathcollective.com</p>
      </div>
    `,
  });

  if (error) throw new Error(error.message);
  return { success: true };
}
