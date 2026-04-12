import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { useEffect, useState } from "react";
import { shopifyService, ShopifyImage } from "@/lib/shopify";

// Fallback images for carousel (local assets)
import lifestyle1 from "@/assets/lifestyle-1.png";
import embroideryLifestyle from "@/assets/embroidery-lifestyle.png";
import workshop from "@/assets/workshop.png";

const FALLBACK_IMAGES = [
  { url: lifestyle1, altText: "Minimalist interior lifestyle" },
  { url: embroideryLifestyle, altText: "Embroidered textile lifestyle" },
  { url: workshop, altText: "Craft workshop setting" },
];

export default function StorySection() {
  const { t } = useTranslation("pages");
  const prefersReducedMotion = useReducedMotion();
  const [carouselImages, setCarouselImages] = useState<ShopifyImage[]>(FALLBACK_IMAGES);
  const [active, setActive] = useState(0);

  // Load carousel images from Shopify (falls back to local if unavailable)
  useEffect(() => {
    const loadImages = async () => {
      const shopifyImages = await shopifyService.getStoryCarouselImages();
      if (shopifyImages && shopifyImages.length > 0) {
        setCarouselImages(shopifyImages);
      }
    };
    loadImages();
  }, []);

  // Auto-advance carousel every 6 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setActive((prev) => (prev + 1) % carouselImages.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [carouselImages.length]);

  return (
    <section className="py-12 bg-muted">
      <div className="container mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: prefersReducedMotion ? 0.1 : 0.6 }}
            className="lg:col-span-5"
          >
            <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl mb-8 leading-tight">
              {t("story.mainHeading")}
            </h2>
            <p className="text-lg text-foreground/70 mb-8 font-light leading-relaxed">
              {t("story.body")}
            </p>
            <div className="grid grid-cols-2 gap-8 border-t border-border pt-8">
              <div>
                <span className="block text-featured-stat mb-1">{t("story.stats.stat1.value")}</span>
                <span className="text-xs uppercase tracking-widest text-primary font-medium">
                  {t("story.stats.stat1.label")}
                </span>
              </div>
              <div>
               <span className="block text-featured-stat mb-1">{t('story.stats.stat2.value')}</span>
                <span className="text-xs uppercase tracking-widest text-primary font-medium">{t('story.stats.stat2.label')}</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: prefersReducedMotion ? 0.1 : 0.8 }}
            className="lg:col-span-7 relative"
          >
            <div className="aspect-[16/9] overflow-hidden rounded-lg">
              <AnimatePresence mode="wait">
                <motion.img
                  key={active}
                  src={carouselImages[active].url}
                  alt={carouselImages[active].altText || "Story image"}
                  initial={{ opacity: 0, scale: 1.1 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: prefersReducedMotion ? 0.1 : 0.8 }}
                  className={`w-full h-full object-cover hover:scale-105 transition-transform ${
                    prefersReducedMotion ? "duration-100" : "duration-1000"
                  }`}
                />
              </AnimatePresence>
            </div>

            {/* Navigation dots - only show if more than 1 image */}
            {carouselImages.length > 1 && (
              <div className="flex gap-3 mt-6 md:mt-8">
                {carouselImages.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActive(idx)}
                    className={`h-1 transition-all duration-500 ${
                      active === idx ? "w-12 bg-primary" : "w-6 bg-primary/10"
                    }`}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>
            )}

            {/* Quote box */}
            <div className="absolute -bottom-6 -left-6 bg-background p-8 hidden md:block max-w-xs shadow-sm">
              <p className="text-quote">{t("story.quote")}</p>
              <span className="block text-[10px] uppercase tracking-widest mt-4 text-primary font-bold">
                {t("story.attribution")}
              </span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
