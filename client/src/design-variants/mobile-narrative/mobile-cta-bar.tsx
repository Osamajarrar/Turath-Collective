import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { getConsent, onConsentChange } from "@/lib/consent";

/**
 * Persistent mobile "Shop Heritage" bar for the Mobile Narrative homepage.
 *
 * Thesis: most traffic arrives from Instagram/TikTok process content and is
 * already scrolling a vertical story on a phone. This bar removes the need
 * to scroll back to the top for the CTA once the visitor is a scene or two
 * into the story.
 *
 * - Mobile only (`md:hidden`).
 * - Appears once the visitor scrolls past roughly the first story scene
 *   (~85svh), so it never competes with the in-scene CTA on scene 3.
 * - z-40, matching the cookie-consent bar — safely BELOW the cart drawer
 *   (z-[100]/z-[110]) so it never blocks or hides behind checkout UI.
 * - Hidden while the cookie-consent banner is showing (both are bottom bars;
 *   showing both at once would overlap on small screens). It reappears once
 *   a consent decision is made.
 * - Respects `prefers-reduced-motion` for its enter/exit transition.
 */
export default function MobileCtaBar() {
  const { t } = useTranslation(["design-mobile-narrative", "common"]);
  const prefersReducedMotion = useReducedMotion();
  const [pastFirstScene, setPastFirstScene] = useState(false);
  const [consentPending, setConsentPending] = useState<boolean>(() => getConsent() === null);

  useEffect(() => {
    const unsubscribe = onConsentChange(() => setConsentPending(false));
    return unsubscribe;
  }, []);

  useEffect(() => {
    // Roughly the height of the first ~85svh story scene — once scrolled
    // past it, the hero-equivalent CTA is out of reach without scrolling
    // back, so the persistent bar takes over. React bails out on no-op
    // boolean state updates, so this is cheap enough to run on every scroll
    // event without an rAF/debounce gate (which can stall in backgrounded
    // or inactive tabs).
    const evaluate = () => {
      const threshold = window.innerHeight * 0.75;
      setPastFirstScene(window.scrollY > threshold);
    };

    evaluate();
    window.addEventListener("scroll", evaluate, { passive: true });
    window.addEventListener("resize", evaluate);
    return () => {
      window.removeEventListener("scroll", evaluate);
      window.removeEventListener("resize", evaluate);
    };
  }, []);

  const visible = pastFirstScene && !consentPending;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          role="region"
          aria-label={t("mobileCtaBar.label")}
          initial={{ y: prefersReducedMotion ? 0 : "100%", opacity: prefersReducedMotion ? 0 : 1 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: prefersReducedMotion ? 0 : "100%", opacity: prefersReducedMotion ? 0 : 1 }}
          transition={{ duration: prefersReducedMotion ? 0.1 : 0.3, ease: "easeInOut" }}
          className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background shadow-[0_-4px_16px_rgba(0,0,0,0.08)] md:hidden"
        >
          <div className="px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
            <Link href="/shop">
              <button
                data-testid="button-mobile-cta-bar"
                className="group w-full flex items-center justify-center gap-2 bg-primary text-white px-6 py-3.5 min-h-[44px] hover:bg-primary/85 transition-all duration-300"
              >
                <span className="uppercase tracking-[0.3em] text-[10px] font-bold">
                  {t("hero.cta")}
                </span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform duration-300 rtl:rotate-180 rtl:group-hover:-translate-x-1" />
              </button>
            </Link>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
