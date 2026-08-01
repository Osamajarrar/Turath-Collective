import { useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { Mail } from "lucide-react";
import PageLayout from "@/components/PageLayout";
import ArrowLink from "@/components/ArrowLink";
import { useTranslation } from "react-i18next";

const SUPPORT_EMAIL = "support@turathcollective.com";

type Status = "idle" | "sending" | "sent" | "error";

export default function ContactPage() {
  const { t } = useTranslation();
  const [status, setStatus] = useState<Status>("idle");

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (status === "sending") return;

    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    setStatus("sending");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      // Only report success when the server actually accepted it. The server
      // in turn only returns 200 once the message has really been delivered.
      if (!res.ok) throw new Error(`contact endpoint returned ${res.status}`);
      setStatus("sent");
      form.reset();
    } catch {
      setStatus("error");
    }
  };

  const fieldClass =
    "w-full border border-border bg-background px-4 py-3 text-sm font-light " +
    "text-foreground placeholder:text-muted-foreground focus-visible:outline-none " +
    "focus-visible:ring-2 focus-visible:ring-primary";
  const labelClass =
    "mb-2 block text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground";

  return (
    <PageLayout>
      <div className="container mx-auto px-6 md:px-12">
        <div className="max-w-5xl mx-auto">
          <header className="mb-20 text-center">
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-[10px] uppercase tracking-[0.4em] text-primary font-bold mb-4 block"
            >
              {t("contact.badge")}
            </motion.span>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="font-serif text-5xl md:text-7xl mb-6"
            >
              {t("contact.heading")} <br />
              <span className="italic font-light">
                {t("contact.headingItalic")}
              </span>
            </motion.h1>
            {/* FAQ CTA */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-12 pt-8 border-t border-border/40 text-center"
            >
              <p className="text-foreground/60 font-light mb-4">
                {t("contact.checkFaq", "Looking for quick answers?")}
              </p>
              <ArrowLink href="/faq">
                {t("contact.viewFaq", "Check our FAQ")}
              </ArrowLink>
            </motion.div>
          </header>

          {/* Contact form. Posts to /api/contact — api/contact.ts in
              production, the Express route locally. */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mx-auto mb-12 max-w-xl border border-border/50 bg-background p-10 md:p-12"
          >
            {status === "sent" ? (
              <div role="status" data-testid="text-contact-success" className="text-center">
                <h2 className="mb-4 font-serif text-2xl md:text-3xl">
                  {t("contact.successTitle")}
                </h2>
                <p className="font-light leading-relaxed text-muted-foreground">
                  {t("contact.successDesc")}
                </p>
              </div>
            ) : (
              <form onSubmit={onSubmit} noValidate={false} data-testid="form-contact">
                <div className="mb-6">
                  <label htmlFor="contact-name" className={labelClass}>
                    {t("contact.formName")}
                  </label>
                  <input
                    id="contact-name"
                    name="name"
                    required
                    maxLength={100}
                    autoComplete="name"
                    placeholder={t("contact.placeholderName")}
                    className={fieldClass}
                  />
                </div>

                <div className="mb-6">
                  <label htmlFor="contact-email" className={labelClass}>
                    {t("contact.formEmail")}
                  </label>
                  <input
                    id="contact-email"
                    name="email"
                    type="email"
                    required
                    maxLength={254}
                    autoComplete="email"
                    placeholder={t("contact.placeholderEmail")}
                    className={fieldClass}
                  />
                </div>

                <div className="mb-6">
                  <label htmlFor="contact-subject" className={labelClass}>
                    {t("contact.formSubject")}
                  </label>
                  <input
                    id="contact-subject"
                    name="subject"
                    required
                    maxLength={200}
                    placeholder={t("contact.placeholderSubject")}
                    className={fieldClass}
                  />
                </div>

                <div className="mb-8">
                  <label htmlFor="contact-message" className={labelClass}>
                    {t("contact.formMessage")}
                  </label>
                  <textarea
                    id="contact-message"
                    name="message"
                    required
                    rows={6}
                    maxLength={5000}
                    placeholder={t("contact.placeholderMessage")}
                    className={`${fieldClass} resize-y`}
                  />
                </div>

                {/* Honeypot — hidden from people, filled by bots. Not
                    display:none, which some bots skip; off-screen and removed
                    from the tab order and the accessibility tree. */}
                <div aria-hidden="true" className="absolute left-[-9999px] top-auto h-px w-px overflow-hidden">
                  <label htmlFor="contact-company">{t("contact.honeypot")}</label>
                  <input id="contact-company" name="company" tabIndex={-1} autoComplete="off" />
                </div>

                {status === "error" && (
                  <div role="alert" data-testid="text-contact-error" className="mb-6">
                    <p className="text-sm font-medium text-foreground">
                      {t("contact.errorTitle")}
                    </p>
                    <p className="text-sm font-light text-muted-foreground">
                      {t("contact.errorDesc")}
                    </p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={status === "sending"}
                  data-testid="button-contact-submit"
                  className="w-full bg-primary px-10 py-5 text-[10px] font-bold uppercase tracking-[0.2em] text-white transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {status === "sending" ? t("contact.formSending") : t("contact.formSend")}
                </button>
              </form>
            )}
          </motion.div>

          {/* Email CTA — kept as a fallback for anyone who would rather use
              their own mail client, or if the form ever fails. */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="max-w-xl mx-auto bg-background p-10 md:p-12 border border-border/50 text-center"
          >
            <Mail className="w-6 h-6 text-primary mx-auto mb-6" />
            <h2 className="font-serif text-2xl md:text-3xl mb-4">
              {t("contact.emailCtaTitle")}
            </h2>
            <p className="text-muted-foreground font-light leading-relaxed mb-8">
              {t("contact.emailCtaBody")}
            </p>
            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              data-testid="link-contact-email"
              className="inline-block bg-primary py-5 px-10 text-[10px] font-bold uppercase tracking-[0.2em] text-white transition-colors hover:bg-primary/90"
            >
              {t("contact.emailCtaButton")}
            </a>
          </motion.div>
        </div>
      </div>
    </PageLayout>
  );
}
