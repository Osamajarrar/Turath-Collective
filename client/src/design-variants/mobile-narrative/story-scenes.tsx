import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import heroMorning from "@/assets/hero-morning.png";
import workshop from "@/assets/workshop.png";
import lifestyle1 from "@/assets/lifestyle-1.png";

/**
 * Mobile Narrative homepage opener — replaces the single full-screen Hero
 * with three vertical "chapters" (place/craft, the making, the object),
 * designed for a visitor arriving from Instagram/TikTok process content who
 * is already primed to scroll a vertical story.
 *
 * Mobile: each chapter is a ~85svh full-bleed image with a short caption
 * pinned near the bottom. Desktop: the same three chapters compose
 * side-by-side (image 60% / text 40%, alternating sides), each ~80vh.
 *
 * Copy facts (Hebron clay, wheel-thrown, high-fire + mineral glaze) are
 * drawn from existing collection/FAQ copy — see CLAUDE.md honesty framework.
 */
export default function StoryScenes() {
  const { t } = useTranslation(["design-mobile-narrative-pages", "pages"]);
  const { t: tCommon } = useTranslation(["design-mobile-narrative", "common"]);
  const prefersReducedMotion = useReducedMotion();

  const scenes = [
    {
      image: heroMorning,
      alt: tCommon("hero.imageAlt"),
      kicker: t("storyScenes.scene1.kicker"),
      line: t("storyScenes.scene1.line"),
      cta: false,
      eager: true,
    },
    {
      image: workshop,
      alt: t("storyScenes.scene2.imageAlt"),
      kicker: t("storyScenes.scene2.kicker"),
      line: t("storyScenes.scene2.line"),
      cta: false,
      eager: false,
    },
    {
      image: lifestyle1,
      alt: t("storyScenes.scene3.imageAlt"),
      kicker: t("storyScenes.scene3.kicker"),
      line: t("storyScenes.scene3.line"),
      cta: true,
      eager: false,
    },
  ];

  return (
    <div className="w-full overflow-hidden">
      {scenes.map((scene, idx) => {
        const reverse = idx % 2 === 1;
        return (
          <section
            key={idx}
            className={`relative w-full flex flex-col md:flex-row min-h-[85svh] md:min-h-0 md:h-[80vh] ${
              reverse ? "md:flex-row-reverse" : ""
            }`}
            data-testid={`section-story-scene-${idx + 1}`}
          >
            {/* Image — full bleed on mobile (60svh), 60% width on desktop */}
            <div className="relative w-full h-[60svh] md:h-full md:w-[60%] overflow-hidden">
              <img
                src={scene.image}
                alt={scene.alt}
                className="absolute inset-0 h-full w-full object-cover"
                loading={scene.eager ? "eager" : "lazy"}
                decoding="async"
                width={1024}
                height={1024}
              />
              {/* Mobile-only caption, overlaid on the image with a gradient for legibility */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent md:hidden" />
              <div className="absolute inset-x-0 bottom-0 p-6">
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.4 }}
                  transition={{ duration: prefersReducedMotion ? 0.1 : 0.6 }}
                  className="md:hidden text-white"
                >
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em]">
                    {scene.kicker}
                  </span>
                  <p className="font-serif text-2xl leading-snug mt-2">{scene.line}</p>
                  {scene.cta && (
                    <Link href="/shop">
                      <button
                        data-testid="button-story-scene-cta-mobile"
                        className="group mt-5 inline-flex items-center gap-2 bg-primary text-white px-6 py-3.5 hover:bg-primary/85 transition-all duration-300 shadow-lg shadow-primary/10"
                      >
                        <span className="uppercase tracking-[0.3em] text-[10px] font-bold">
                          {tCommon("hero.cta")}
                        </span>
                        <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform duration-300 rtl:rotate-180 rtl:group-hover:-translate-x-1" />
                      </button>
                    </Link>
                  )}
                </motion.div>
              </div>
            </div>

            {/* Text panel — desktop only, 40% width */}
            <div className="hidden md:flex md:w-[40%] md:h-full items-center bg-background px-12 lg:px-16">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: prefersReducedMotion ? 0.1 : 0.7 }}
                className="max-w-sm"
              >
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
                  {scene.kicker}
                </span>
                <p className="font-serif text-3xl lg:text-4xl leading-snug mt-5 text-foreground">
                  {scene.line}
                </p>
                {scene.cta && (
                  <Link href="/shop">
                    <button
                      data-testid="button-story-scene-cta-desktop"
                      className="group mt-8 inline-flex items-center gap-3 bg-primary text-white px-8 py-3.5 hover:bg-primary/85 transition-all duration-300 shadow-lg shadow-primary/10"
                    >
                      <span className="uppercase tracking-[0.3em] text-[10px] font-bold">
                        {tCommon("hero.cta")}
                      </span>
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform duration-300 rtl:rotate-180 rtl:group-hover:-translate-x-1" />
                    </button>
                  </Link>
                )}
              </motion.div>
            </div>
          </section>
        );
      })}
    </div>
  );
}
