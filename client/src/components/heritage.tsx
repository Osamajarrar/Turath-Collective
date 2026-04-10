import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import workshopImage from "@/assets/workshop.png";

export default function Heritage() {
  const { t } = useTranslation("pages");
  const prefersReducedMotion = useReducedMotion();
  return (
    <section className="py-12 bg-background border-t border-border/40">
      <div className="container mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: prefersReducedMotion ? 0.1 : 0.8 }}
            className="relative aspect-[3/4] lg:aspect-square overflow-hidden"
          >
            <div className="absolute inset-0 bg-primary/10 mix-blend-multiply z-10" />
            <img
              src={workshopImage}
              alt="Hebron ceramics workshop"
              className="w-full h-full object-cover grayscale-[20%] sepia-[10%] contrast-[1.1]"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: prefersReducedMotion ? 0.1 : 0.8, delay: prefersReducedMotion ? 0 : 0.2 }}
            className="flex flex-col justify-center lg:pl-12"
          >
            <span className="text-sm uppercase tracking-[0.2em] text-primary mb-6 font-medium">
              {t("heritage.subtitle")}
            </span>
            <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl text-foreground mb-8 leading-tight">
              {t("heritage.title")}
            </h2>
            <div className="space-y-6 text-foreground/80 font-light leading-relaxed text-lg">
              <p>{t("heritage.paragraph1")}</p>
            </div>

            <div className="mt-12">
              <a
                href="/about"
              >
                <button className="text-[10px] uppercase tracking-[0.3em] font-bold border-b border-primary/20 pb-1 hover:border-primary transition-all text-primary group-hover:text-foreground">
                  {t("heritage.cta")} →
                </button>
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
