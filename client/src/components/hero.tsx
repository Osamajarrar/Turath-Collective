import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import heroImage from "@/assets/hero-morning.png";

// Golden Hour Immersive: full-bleed cinematic image, magazine-style
// lower-left headline block, warm scrim strongest at the bottom-left where
// the text sits. Tagline reuses the approved "History, still handmade."
// copy from brandStory rather than inventing new claims.
export default function Hero() {
  const { t } = useTranslation(["common", "pages"]);
  const prefersReducedMotion = useReducedMotion();

  return (
    <section className="relative h-screen w-full overflow-hidden">
      {/* Background Image with Gradient Overlays */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-black/10 z-10" />
        {/* Warm scrim rising from the bottom, weighted toward the bottom-left
            where the headline block sits, so text stays readable over the
            image without flattening it. */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent z-10" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-transparent z-10" />
        <img
          src={heroImage}
          alt={t("hero.imageAlt")}
          className="w-full h-full object-cover opacity-90"
          width={1024}
          height={1024}
        />
      </div>

      <div className="relative z-20 container mx-auto px-6 md:px-12 max-w-[1820px] h-full flex flex-col justify-end items-start text-left pb-20 md:pb-28">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: prefersReducedMotion ? 0.1 : 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-2xl"
        >
          <h1
            className="font-serif text-5xl md:text-7xl lg:text-8xl leading-[0.95] mb-6 text-primary-foreground"
            data-testid="text-hero-heading"
          >
            {t("hero.heading")} <br />
            <span className="italic font-light">{t("hero.headingItalic")}</span>
          </h1>

          <p className="text-body-lg text-primary-foreground/80 max-w-md mb-10">
            {t("brandStory.heading", { ns: "pages" })}
          </p>

          <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
            <Link href="/shop">
              <button
                data-testid="button-hero-cta"
                className="group bg-primary text-primary-foreground px-10 py-5 flex items-center gap-4 hover:bg-primary/85 transition-all duration-500 shadow-xl shadow-primary/10"
              >
                <span className="uppercase tracking-[0.3em] text-[10px] font-bold">{t("hero.cta")}</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-2 transition-transform duration-500 rtl:rotate-180 rtl:group-hover:-translate-x-2 rtl:group-hover:translate-x-0" />
              </button>
            </Link>
            <Link href="/about">
              <button
                data-testid="button-hero-secondary-cta"
                className="group border border-primary-foreground/50 text-primary-foreground px-10 py-5 flex items-center gap-4 hover:bg-primary-foreground/10 hover:border-primary-foreground transition-all duration-500"
              >
                <span className="uppercase tracking-[0.3em] text-[10px] font-bold">{t("hero.secondaryCta")}</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-2 transition-transform duration-500 rtl:rotate-180 rtl:group-hover:-translate-x-2 rtl:group-hover:translate-x-0" />
              </button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
