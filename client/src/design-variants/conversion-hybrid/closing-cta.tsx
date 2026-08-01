import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

// Adapted from design/warm-immersive's closing CTA: repeats the single
// primary action (shop the collection) right before Newsletter, so the
// page's rhythm — hero CTA, CraftBand pause, this repeat — makes the one
// conversion action unmistakable on the way out. Claim-free heading, no
// new facts; reuses hero.cta for the button label.
export default function ClosingCta() {
  const { t } = useTranslation(["design-conversion-hybrid", "common"]);
  const prefersReducedMotion = useReducedMotion();

  return (
    <section className="bg-muted py-16 md:py-24">
      <div className="container mx-auto max-w-2xl px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: prefersReducedMotion ? 0.1 : 0.6 }}
        >
          <h2 className="mb-8 font-serif text-2xl text-foreground md:text-3xl">
            {t("closingCta.heading")}
          </h2>
          <Link href="/shop">
            <button
              data-testid="button-closing-cta"
              className="group inline-flex min-h-[52px] items-center gap-4 bg-primary px-10 py-4 text-primary-foreground shadow-lg shadow-primary/10 transition-all duration-300 hover:bg-primary/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <span className="text-[10px] font-bold uppercase tracking-[0.3em]">{t("hero.cta")}</span>
              <ArrowRight className="w-3 h-3 transition-transform duration-300 group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1" />
            </button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
