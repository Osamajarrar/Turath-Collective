import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import heroImage from "@/assets/hero-morning.png";

// "Conversion Hybrid" hero — synthesizes design/editorial-split's two-column
// layout (message + CTA on solid bg-background, full-bleed image with no
// gradient overlay to manage) with design/quiet-commerce's shorter runtime
// and stronger CTA hit-area/focus treatment. Kept intentionally compact
// (~75vh desktop, ~45svh mobile image) so ValuesStrip and the first
// products are visible without a full scroll on common viewports.
export default function Hero() {
  const { t } = useTranslation(["design-conversion-hybrid", "common"]);
  const prefersReducedMotion = useReducedMotion();

  return (
    <section className="relative flex w-full flex-col bg-background lg:h-[75vh] lg:min-h-[560px] lg:flex-row lg:overflow-hidden">
      {/* Text column */}
      <div className="order-2 flex w-full items-center bg-background px-6 py-12 md:px-12 md:py-16 lg:order-1 lg:w-1/2 lg:px-16 lg:py-0 xl:px-20">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: prefersReducedMotion ? 0.1 : 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-xl"
        >
          <span className="mb-5 block text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
            {t("hero.kicker")}
          </span>

          <h1
            className="mb-6 font-serif text-4xl leading-[1.05] text-foreground md:text-5xl lg:text-6xl"
            data-testid="text-hero-heading"
          >
            {t("hero.heading")} <br />
            <span className="font-light italic">{t("hero.headingItalic")}</span>
          </h1>

          <p className="mb-8 max-w-md text-base font-light leading-relaxed text-foreground/70 md:text-lg">
            {t("hero.subheading")}
          </p>

          <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:gap-8">
            <Link href="/shop">
              <button
                data-testid="button-hero-cta"
                className="group flex min-h-[52px] items-center gap-4 bg-primary px-10 py-4 text-primary-foreground shadow-lg shadow-primary/10 transition-all duration-300 hover:bg-primary/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                <span className="text-[10px] font-bold uppercase tracking-[0.3em]">{t("hero.cta")}</span>
                <ArrowRight className="w-3 h-3 transition-transform duration-300 group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1 rtl:group-hover:translate-x-0" />
              </button>
            </Link>

            <Link
              href="/about"
              data-testid="link-hero-story"
              className="group flex min-h-[44px] items-center gap-2 border-b border-foreground/20 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/70 transition-all hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              {t("nav.ourStory")}
              <ArrowRight className="w-3 h-3 transition-transform duration-300 group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1 rtl:group-hover:translate-x-0" />
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Image column — full-bleed, no overlays needed since text lives on
          its own solid background column. */}
      <div className="order-1 h-[45svh] w-full lg:order-2 lg:h-auto lg:w-1/2">
        <img
          src={heroImage}
          alt={t("hero.imageAlt")}
          className="h-full w-full object-cover"
          width={1024}
          height={1024}
        />
      </div>
    </section>
  );
}
