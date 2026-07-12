// PLACEHOLDER CONTENT — fake reviews / fake social posts for layout preview only.
// Gated by VITE_SHOW_PLACEHOLDER_CONTENT (must NEVER be set in Vercel).
// Replace with real data before ungating. See plans/07-placeholder-gating.md.

import { motion, AnimatePresence } from "framer-motion";
import { Quote } from "lucide-react";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

import img1 from "@/assets/social-1.png";
import img2 from "@/assets/social-2.png";
import img3 from "@/assets/social-3.png";

export default function ReviewCarousel() {
  const { t } = useTranslation("common");
  const reviews = t("reviewCarousel.reviews", { returnObjects: true }) as Array<{
    text: string;
    author: string;
    location: string;
    product: string;
  }>;
  const images = [img1, img2, img3];
  const [active, setActive] = useState(0);

  // TODO: these reviews are placeholder/fake data for structural testing only.
  // Replace client/src/locales/*/common.json → reviewCarousel.reviews with real
  // customer reviews, then remove this guard. Never let this render with fake
  // testimonials once ad traffic starts.
  const showPlaceholder = import.meta.env.VITE_SHOW_PLACEHOLDER_CONTENT === "true";

  useEffect(() => {
    const timer = setInterval(() => {
      setActive((prev) => (prev + 1) % reviews.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [reviews.length]);

  if (!showPlaceholder) return null;

  return (
    <section className="py-12 bg-background">
      <div className="container mx-auto px-6 md:px-12 max-w-[1820px]">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div className="order-2 lg:order-1 relative h-[500px] overflow-hidden rounded-2xl">
            <AnimatePresence mode="wait">
              <motion.img
                key={active}
                src={images[active]}
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 1 }}
                className="w-full h-full object-cover"
              />
            </AnimatePresence>
            <div className="absolute inset-0 bg-black/10" />
          </div>

          <div className="order-1 lg:order-2">
            <span className="text-[10px] uppercase tracking-[0.4em] text-primary mb-6 block font-bold">{t("reviewCarousel.badge")}</span>
            <h2 className="font-serif text-5xl md:text-6xl text-foreground mb-8">{t("reviewCarousel.heading")} <br/><span className="italic">{t("reviewCarousel.headingItalic")}</span></h2>
            
            <div className="relative h-64 flex items-center mb-12">
              <AnimatePresence mode="wait">
                <motion.div
                  key={active}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute inset-0 flex flex-col justify-center"
                >
                  <Quote className="w-12 h-12 text-primary/10 mb-8" />
                  <p className="text-quote text-foreground/90 md:text-xl mb-10">
                    "{reviews[active].text}"
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-px bg-primary/20" />
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-primary">{reviews[active].author}</p>
                      <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{reviews[active].location} • {reviews[active].product}</p>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="flex gap-4">
              {reviews.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActive(idx)}
                  aria-label={`Go to review ${idx + 1}`}
                  className={`h-1 transition-all duration-500 ${active === idx ? "w-12 bg-primary" : "w-6 bg-primary/10"}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}