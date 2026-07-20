import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import heroImage from "@/assets/hero-morning.png";

export default function Hero() {
  const { t } = useTranslation();
  const prefersReducedMotion = useReducedMotion();

  return (
    <section className="relative h-[70vh] md:h-[65vh] w-full overflow-hidden">
      {/* Background Image with Gradient Overlays */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-black/10 z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20 z-10" />
        <img
          src={heroImage}
          alt={t("hero.imageAlt")}
          className="w-full h-full object-cover opacity-90"
          width={1024}
          height={1024}
        />
      </div>

      <div className="relative z-20 container mx-auto px-6 md:px-12 max-w-[1820px] h-full flex flex-col justify-center items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: prefersReducedMotion ? 0.1 : 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-3xl"
        >
          <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl leading-[0.95] mb-8 text-foreground" data-testid="text-hero-heading">
            {t("hero.heading")} <br />
            <span className="italic font-light">{t("hero.headingItalic")}</span>
          </h1>

          <div className="flex flex-col md:flex-row items-center justify-center gap-10">
            <Link href="/shop">
              <button
                data-testid="button-hero-cta"
                className="group bg-primary text-primary-foreground px-10 py-5 flex items-center gap-4 hover:bg-primary/85 transition-all duration-500 shadow-xl shadow-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                <span className="uppercase tracking-[0.25em] text-xs font-bold">{t("hero.cta")}</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-2 transition-transform duration-500 rtl:rotate-180 rtl:group-hover:-translate-x-2 rtl:group-hover:translate-x-0" />
              </button>
            </Link>
          </div>
        </motion.div>
      </div>

    </section>
  );
}
