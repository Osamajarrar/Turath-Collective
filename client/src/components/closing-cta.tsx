import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

// Golden Hour Immersive: repeats the single primary action (shop the
// collection) right before Newsletter, so the page's rhythm of dark bands
// (craft-band, this one) makes the one CTA unmistakable on the way out.
// Claim-free heading, no new facts — reuses hero.cta for the button label.
export default function ClosingCta() {
  const { t } = useTranslation();
  const prefersReducedMotion = useReducedMotion();

  return (
    <section className="bg-muted py-20 md:py-28">
      <div className="container mx-auto px-6 text-center max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: prefersReducedMotion ? 0.1 : 0.6 }}
        >
          <h2 className="font-serif text-3xl md:text-4xl text-foreground mb-10">
            {t("closingCta.heading")}
          </h2>
          <Link href="/shop">
            <button
              data-testid="button-closing-cta"
              className="group bg-primary text-primary-foreground px-10 py-5 inline-flex items-center gap-4 hover:bg-primary/85 transition-all duration-300 shadow-lg shadow-primary/10"
            >
              <span className="uppercase tracking-[0.3em] text-[10px] font-bold">{t("hero.cta")}</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform duration-300 rtl:rotate-180 rtl:group-hover:-translate-x-1" />
            </button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
