import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { useEffect, useState } from "react";
import { shopifyService, ShopifyImage } from "@/lib/shopify";
import workshopImage from "@/assets/workshop.png";
import embroideryDetail from "@/assets/embroidery-detail.png";
import embroideryLifestyle from "@/assets/embroidery-lifestyle.png";

// Fallback images for carousel (local assets)
const FALLBACK_IMAGES = [
  { url: workshopImage, altText: "Hebron ceramics workshop" },
  { url: embroideryDetail, altText: "Embroidery detail craft" },
  { url: embroideryLifestyle, altText: "Embroidered textile lifestyle" },
];

export default function Heritage() {
  const { t } = useTranslation("pages");
  const prefersReducedMotion = useReducedMotion();
  const [carouselImages, setCarouselImages] = useState<ShopifyImage[]>(FALLBACK_IMAGES);
  const [active, setActive] = useState(0);

  // Load carousel images from Shopify (falls back to local if unavailable)
  useEffect(() => {
    const loadImages = async () => {
      const shopifyImages = await shopifyService.getHeritageCarouselImages();
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
    <section className="py-12 bg-background border-t border-border/40">
      <div className="container mx-auto px-6 md:px-12 max-w-[1820px]">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-stretch">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: prefersReducedMotion ? 0.1 : 0.8 }}
            className="relative"
          >
            <div className="relative w-full h-full overflow-hidden rounded-2xl">
              <AnimatePresence mode="wait">
                <motion.div
                  key={active}
                  initial={{ opacity: 0, scale: 1.1 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: prefersReducedMotion ? 0.1 : 0.8 }}
                  className="absolute inset-0"
                >
                  <div className="absolute inset-0 bg-primary/10 mix-blend-multiply z-10" />
                  <img
                    src={carouselImages[active].url}
                    alt={carouselImages[active].altText || "Heritage image"}
                    className="w-full h-full object-cover grayscale-[20%] sepia-[10%] contrast-[1.1]"
                  />
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: prefersReducedMotion ? 0.1 : 0.8, delay: prefersReducedMotion ? 0 : 0.2 }}
            className="flex flex-col justify-center"
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

            {/* Navigation dots - only show if more than 1 image */}
            {carouselImages.length > 1 && (
              <div className="flex gap-3 mt-8 mb-8">
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
