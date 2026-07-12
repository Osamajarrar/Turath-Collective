import { useEffect, useState } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { getConsent, setConsent, onConsentChange } from "@/lib/consent";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

/**
 * Opt-in cookie consent banner (PIPEDA / Quebec Law 25).
 *
 * Fixed bottom bar — not a modal — with two equal-weight choices. Renders only
 * while no decision exists (getConsent() === null) and hides as soon as a choice
 * is made. Sits BELOW the cart drawer (z-40 vs the drawer's z-[100]/z-[110]) so
 * it never covers the mobile checkout button.
 */
export default function CookieConsent() {
  const { t } = useTranslation();
  const prefersReducedMotion = useReducedMotion();
  // Show only when there is no stored decision yet.
  const [visible, setVisible] = useState<boolean>(() => getConsent() === null);

  useEffect(() => {
    // Hide if a decision is made elsewhere (e.g. another tab / component).
    const unsubscribe = onConsentChange(() => setVisible(false));
    return unsubscribe;
  }, []);

  const decide = (granted: boolean) => {
    setConsent(granted);
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          role="region"
          aria-label={t("consent.label")}
          initial={{ y: prefersReducedMotion ? 0 : "100%", opacity: prefersReducedMotion ? 0 : 1 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: prefersReducedMotion ? 0 : "100%", opacity: prefersReducedMotion ? 0 : 1 }}
          transition={{ duration: prefersReducedMotion ? 0.1 : 0.35, ease: "easeInOut" }}
          className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background"
        >
          <div className="mx-auto flex max-w-5xl flex-col gap-4 px-6 py-5 md:flex-row md:items-center md:justify-between md:px-12">
            <p className="text-sm font-light text-muted-foreground">
              {t("consent.message")}{" "}
              <Link
                href="/privacy"
                className="underline underline-offset-4 transition-colors hover:text-foreground"
              >
                {t("consent.privacyLink")}
              </Link>
            </p>
            <div className="flex flex-shrink-0 gap-3">
              <button
                type="button"
                onClick={() => decide(false)}
                className="border border-border px-5 py-3 text-[10px] font-bold uppercase tracking-[0.2em] text-foreground transition-colors hover:bg-muted"
                data-testid="button-consent-decline"
              >
                {t("consent.decline")}
              </button>
              <button
                type="button"
                onClick={() => decide(true)}
                className="bg-foreground px-5 py-3 text-[10px] font-bold uppercase tracking-[0.2em] text-background transition-opacity hover:opacity-90"
                data-testid="button-consent-accept"
              >
                {t("consent.accept")}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
