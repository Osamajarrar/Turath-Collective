import { motion } from "framer-motion";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

// Golden Hour Immersive: a full-width dark maroon band that breaks the
// rhythm of cream sections. Typography-led, no image — a quiet pause
// between FeaturedProducts and CollectionCards that restates the craft in
// technique-and-place terms (never implying the object itself is old).
export default function CraftBand() {
  const { t } = useTranslation(["common", "pages"]);
  const prefersReducedMotion = useReducedMotion();

  return (
    <section className="bg-primary text-primary-foreground py-24 md:py-36">
      <div className="container mx-auto px-6 md:px-12 max-w-[1820px]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: prefersReducedMotion ? 0.1 : 0.6 }}
          className="max-w-3xl mx-auto text-center"
        >
          <span className="block text-[10px] font-bold uppercase tracking-[0.3em] text-primary-foreground/60 mb-8">
            {t("craftBand.kicker")}
          </span>
          <p className="font-serif italic text-3xl md:text-4xl lg:text-5xl leading-snug mb-10">
            {t("craftBand.quote")}
          </p>
          <Link href="/about">
            <button className="text-[10px] font-bold uppercase tracking-[0.3em] border-b border-primary-foreground/30 pb-1 hover:border-primary-foreground transition-all text-primary-foreground/80 hover:text-primary-foreground">
              {t("brandStory.cta", { ns: "pages" })} →
            </button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
