import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import heroObject from "@/assets/burgundy-bowl.png";

// "Object First": the crafted piece itself is the hero, not a mood photo.
// The headline is kept small and subordinate; the object image is the
// visual protagonist. Product links are dynamic (mock vs. live Shopify
// data), so the secondary CTA points to /shop rather than a hardcoded
// product handle.
export default function Hero() {
  const { t } = useTranslation(["design-object-first", "common"]);
  const prefersReducedMotion = useReducedMotion();

  return (
    <section className="relative w-full min-h-[85svh] bg-muted overflow-hidden">
      <div className="relative z-10 container mx-auto px-6 md:px-12 max-w-[1820px] min-h-[85svh] flex flex-col items-center pt-24 pb-10 md:pt-28 md:pb-14">
        {/* Small, subordinate headline */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: prefersReducedMotion ? 0.1 : 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-xl text-center"
        >
          <h1
            className="font-serif text-3xl md:text-5xl leading-tight text-foreground"
            data-testid="text-hero-heading"
          >
            {t("hero.heading")}{" "}
            <span className="italic font-light">{t("hero.headingItalic")}</span>
          </h1>
          <p className="mt-4 text-sm md:text-base text-muted-foreground leading-relaxed max-w-md mx-auto">
            {t("hero.supportingLine")}
          </p>
        </motion.div>

        {/* The object: visual protagonist */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: prefersReducedMotion ? 0.1 : 1, ease: [0.16, 1, 0.3, 1], delay: prefersReducedMotion ? 0 : 0.1 }}
          className="relative flex-1 min-h-0 w-full flex items-center justify-center py-6 md:py-8"
        >
          <img
            src={heroObject}
            alt={t("hero.objectImageAlt")}
            className="max-h-full max-w-[78%] sm:max-w-[420px] md:max-w-[480px] w-auto h-auto object-contain drop-shadow-2xl md:translate-x-6"
            width={1791}
            height={1791}
          />
        </motion.div>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: prefersReducedMotion ? 0.1 : 0.8, ease: [0.16, 1, 0.3, 1], delay: prefersReducedMotion ? 0 : 0.2 }}
          className="flex flex-col items-center gap-5"
        >
          <Link href="/shop">
            <button
              data-testid="button-hero-cta"
              className="group bg-primary text-primary-foreground px-10 py-4 md:px-14 md:py-6 flex items-center gap-4 hover:bg-primary/85 transition-all duration-300 shadow-xl shadow-primary/10"
            >
              <span className="uppercase tracking-[0.3em] text-[10px] font-bold">{t("hero.cta")}</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-2 transition-transform duration-300 rtl:rotate-180 rtl:group-hover:-translate-x-2 rtl:group-hover:translate-x-0" />
            </button>
          </Link>
          <Link
            href="/shop"
            className="min-h-[44px] flex items-center text-[10px] font-bold uppercase tracking-[0.2em] text-primary border-b border-primary/20 hover:border-primary transition-all pb-1"
            data-testid="link-hero-secondary"
          >
            {t("hero.secondaryCta")}
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
