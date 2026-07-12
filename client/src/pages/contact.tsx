import { motion } from "framer-motion";
import { Mail } from "lucide-react";
import PageLayout from "@/components/PageLayout";
import ArrowLink from "@/components/ArrowLink";
import { useTranslation } from "react-i18next";

const SUPPORT_EMAIL = "support@turathcollective.com";

export default function ContactPage() {
  const { t } = useTranslation();

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

          {/* Email CTA */}
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
