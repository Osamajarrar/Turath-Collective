import { motion } from "framer-motion";
import PageLayout from "@/components/PageLayout";
import ArrowLink from "@/components/ArrowLink";
import { useTranslation } from "react-i18next";
import { getFaqCategories } from "@/lib/collections";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

export default function FAQPage() {
  const { t } = useTranslation("pages");

  const faqCategories = getFaqCategories(t);

  return (
    <PageLayout>
      <div className="container mx-auto px-6 md:px-12">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <header className="mb-16 text-center">
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-[10px] uppercase tracking-[0.4em] text-primary font-bold mb-4 block"
            >
              {t("faq.badge", "FAQ")}
            </motion.span>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="font-serif text-5xl md:text-6xl mb-6 font-light"
            >
              {t("faq.heading", "Frequently Asked Questions")}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-foreground/60 font-light text-lg"
            >
              {t("faq.subtitle", "Everything you need to know about our ceramics and service.")}
            </motion.p>
          </header>

          {/* FAQ Accordion Sections */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-4"
          >
            <Accordion type="multiple" className="space-y-2">
              {faqCategories.map((category) => (
                <AccordionItem key={category.key} value={category.key}>
                  <AccordionTrigger className="text-left font-serif text-2xl md:text-3xl font-light text-foreground hover:text-primary transition-colors py-4">
                    {category.title}
                  </AccordionTrigger>
                  <AccordionContent className="pt-4 pb-6">
                    <Accordion type="multiple" className="space-y-3">
                      {category.items?.map(
                        (item: { question: string; answer: string }, itemIdx: number) => (
                          <AccordionItem key={`${category.key}-${itemIdx}`} value={`${category.key}-${itemIdx}`}>
                            <AccordionTrigger className="text-left font-light text-lg text-foreground hover:text-primary transition-colors">
                              {item.question}
                            </AccordionTrigger>
                            <AccordionContent className="text-foreground/70 font-light leading-relaxed text-base pt-3">
                              {item.answer}
                            </AccordionContent>
                          </AccordionItem>
                        )
                      )}
                    </Accordion>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </motion.div>

          {/* Support CTA */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-20 pt-12 border-t border-border/40 text-center"
          >
            <p className="text-foreground/60 font-light mb-6">
              {t("faq.stillHaveQuestions", "Can't find what you're looking for?")}
            </p>
            <ArrowLink href="/contact">
              {t("faq.contactUs", "Get in touch with our team")}
            </ArrowLink>
          </motion.div>
        </div>
      </div>
    </PageLayout>
  );
}
