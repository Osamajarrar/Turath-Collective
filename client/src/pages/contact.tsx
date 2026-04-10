import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import { useState } from "react";
import PageLayout from "@/components/PageLayout";
import ArrowLink from "@/components/ArrowLink";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

export default function ContactPage() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Contact backend is deferred for launch v1.
  // Form shows a success state to acknowledge the user; emails to be wired later.
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 800));
    toast({ title: t("contact.successTitle"), description: t("contact.successDesc") });
    (e.target as HTMLFormElement).reset();
    setIsSubmitting(false);
  };

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

          {/* Contact Info */}
          {/* <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-12"
            >
              <div>
                <h3 className="heading-subsection mb-8">{t("contact.visitStudio")}</h3>
                <div className="space-y-6">

                  <div className="flex gap-4 items-start rtl:flex-row-reverse">
                    <MapPin className="w-5 h-5 text-primary shrink-0 mt-1" />
                    <div>
                      <p className="text-sm font-bold uppercase tracking-widest mb-1">{t("contact.address")}</p>
                      <p className="text-muted-foreground font-light leading-relaxed whitespace-pre-line">
                        {t("contact.addressDetails")}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4 items-start rtl:flex-row-reverse">
                    <Mail className="w-5 h-5 text-primary shrink-0 mt-1" />
                    <div>
                      <p className="text-sm font-bold uppercase tracking-widest mb-1">{t("contact.email")}</p>
                      <a
                        href={`mailto:${t("contact.emailAddress")}`}
                        className="text-muted-foreground font-light hover:text-primary transition-colors"
                      >
                        {t("contact.emailAddress")}
                      </a>
                    </div>
                  </div>

                  <div className="flex gap-4 items-start rtl:flex-row-reverse">
                    <Phone className="w-5 h-5 text-primary shrink-0 mt-1" />
                    <div>
                      <p className="text-sm font-bold uppercase tracking-widest mb-1">{t("contact.phone")}</p>
                      <a
                        href={`tel:${t("contact.phoneNumber")}`}
                        className="text-muted-foreground font-light hover:text-primary transition-colors"
                      >
                        {t("contact.phoneNumber")}
                      </a>
                    </div>
                  </div>

                </div>
              </div>

              <div className="pt-12 border-t border-border/50">
                <h3 className="heading-subsection mb-6">{t("contact.wholesale")}</h3>
                <p className="text-muted-foreground font-light leading-relaxed mb-6">
                  {t("contact.wholesaleDesc")}
                </p>
                <a
                  href={`mailto:${t("contact.partnerEmail")}`}
                  className="text-[10px] uppercase tracking-widest font-bold border-b border-primary/30 pb-1 hover:border-primary transition-colors"
                >
                  {t("contact.partnerEmail")} →
                </a>
              </div>
            </motion.div> */}

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white p-10 md:p-12 border border-border/50 shadow-2xl"
          >
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-3">
                <Label className="text-xs font-semibold text-black tracking-wider">
                  {t("contact.formName")}
                </Label>
                <Input
                  name="name"
                  required
                  placeholder={t("contact.placeholderName")}
                  data-testid="input-contact-name"
                  className="rounded-sm border border-gray-300 bg-white px-4 py-3 text-base placeholder:text-gray-450 focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-transparent transition-all"
                />
              </div>

              <div className="space-y-3">
                <Label className="text-xs font-semibold text-black tracking-wider">
                  {t("contact.formEmail")}
                </Label>
                <Input
                  name="email"
                  required
                  type="email"
                  placeholder={t("contact.placeholderEmail")}
                  data-testid="input-contact-email"
                  className="rounded-sm border border-gray-300 bg-white px-4 py-3 text-base placeholder:text-gray-450 focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-transparent transition-all"
                />
              </div>

              <div className="space-y-3">
                <Label className="text-xs font-semibold text-black tracking-wider">
                  {t("contact.formSubject")}
                </Label>
                <Input
                  name="subject"
                  placeholder={t("contact.placeholderSubject")}
                  data-testid="input-contact-subject"
                  className="rounded-sm border border-gray-300 bg-white px-4 py-3 text-base placeholder:text-gray-450 focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-transparent transition-all"
                />
              </div>

              <div className="space-y-3">
                <Label className="text-xs font-semibold text-black tracking-wider">
                  {t("contact.formMessage")}
                </Label>
                <Textarea
                  name="message"
                  required
                  placeholder={t("contact.placeholderMessage")}
                  data-testid="input-contact-message"
                  className="min-h-[150px] rounded-sm border border-gray-300 bg-white px-4 py-3 text-base placeholder:text-gray-450 focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-transparent transition-all resize-none"
                />
              </div>

              <Button
                disabled={isSubmitting}
                data-testid="button-contact-submit"
                className="w-full bg-primary hover:bg-primary/90 text-white rounded-none py-7 uppercase tracking-[0.2em] text-[10px] font-bold shadow-xl shadow-primary/20"
              >
                {isSubmitting
                  ? t("contact.formSending")
                  : t("contact.formSend")}
                {!isSubmitting && (
                  <Send className="w-3.5 h-3.5 ml-2 rtl:ml-0 rtl:mr-2" />
                )}
              </Button>
            </form>
          </motion.div>
        </div>
      </div>
    </PageLayout>
  );
}
