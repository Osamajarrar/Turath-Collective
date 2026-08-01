import { motion } from "framer-motion";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

// Adapted from design/warm-immersive's "Golden Hour" craft band: a
// full-width dark maroon band that breaks the rhythm of cream sections
// between FeaturedProducts and BrandStory. Typography-led, no image.
//
// Copy here is deliberately not new marketing language — the kicker reuses
// the approved tagline (pages.brandStory.heading) verbatim, and the quote
// is a condensed restatement of the approved pages.brandStory.body, so no
// new claims enter the page beyond what BrandStory already states.
export default function CraftBand() {
  const { t } = useTranslation(["design-conversion-hybrid", "common", "pages"]);
  const prefersReducedMotion = useReducedMotion();

  return (
    <section className="bg-primary py-20 text-primary-foreground md:py-28">
      <div className="container mx-auto max-w-[1820px] px-6 md:px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: prefersReducedMotion ? 0.1 : 0.6 }}
          className="mx-auto max-w-3xl text-center"
        >
          <span className="mb-8 block text-[10px] font-bold uppercase tracking-[0.3em] text-primary-foreground/60">
            {t("craftBand.kicker")}
          </span>
          <p className="mb-10 font-serif text-3xl italic leading-snug md:text-4xl lg:text-5xl">
            {t("craftBand.quote")}
          </p>
          <Link
            href="/about"
            className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary-foreground/80 border-b border-primary-foreground/30 pb-1 transition-all hover:border-primary-foreground hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-foreground/60 focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
          >
            {t("brandStory.cta", { ns: "pages" })} →
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
