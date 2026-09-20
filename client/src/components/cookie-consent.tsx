import { useEffect, useState } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { hasDecidedAll, setConsent, onConsentChange } from "@/lib/consent";
import { CONSENT_BAR_ENABLED } from "@/lib/flags";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

/**
 * Opt-in analytics consent (PIPEDA / Quebec Law 25), as a sticky bottom bar.
 *
 * Renders only when VITE_CONSENT_BAR_SHOWN is on AND this visitor still owes an
 * answer. With the flag off there is no bar at all and analytics start for
 * everyone at boot (applyImplicitConsent in consent.ts) — so there is never an
 * Accept/Decline on screen that does not do exactly what it says.
 *
 * ── Why this is not a cookie-wall ────────────────────────────────────────
 * Law 25 and PIPEDA invalidate consent that is a condition of access. What
 * they require is that refusing be as easy as accepting — so:
 *
 *   - the two buttons are VISUALLY IDENTICAL and side by side, in a fixed
 *     order. Neither is emphasised. (An earlier version filled "Accept" and
 *     outlined "Essential only", which nudges.)
 *   - both are a single click, at the same distance, with no extra step, no
 *     second confirmation and no "are you sure" on decline.
 *   - declining leaves the entire site working, with nothing withheld.
 *
 * The bar sits over the page rather than blocking it: nothing is scroll-locked,
 * focus is not trapped, and the content behind stays reachable. It is not a
 * dialog and is not announced as one — role="region" with a label, so a screen
 * reader user can reach it deliberately instead of being interrupted.
 *
 * There is deliberately no X and no "continue without choosing": those leave a
 * visitor with no decision recorded, which helps nobody. They are not a way to
 * obtain access — the site already works either way.
 */
export default function CookieConsent() {
  const { t } = useTranslation();
  const prefersReducedMotion = useReducedMotion();
  // hasDecidedAll, not "is there any decision": when a NEW consent category is
  // added later, a visitor who already answered the old ones is re-prompted
  // about that category alone rather than not at all.
  const [visible, setVisible] = useState<boolean>(
    () => CONSENT_BAR_ENABLED && !hasDecidedAll(),
  );

  useEffect(() => {
    // Hide if a decision is made elsewhere (e.g. another tab / component).
    return onConsentChange(() => setVisible(false));
  }, []);

  const decide = (granted: boolean) => {
    setConsent(granted);
    setVisible(false);
  };

  // Both buttons share one class string — the equal-weight requirement is a
  // legal one, so keep it literally the same string rather than two that
  // happen to match today.
  const buttonClass =
    "flex-1 border border-border px-5 py-3 text-[10px] font-bold uppercase " +
    "tracking-[0.2em] text-foreground transition-colors hover:bg-muted " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary " +
    "sm:flex-none sm:px-8";

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          role="region"
          aria-label={t("consent.label")}
          initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: prefersReducedMotion ? 0 : 24 }}
          transition={{ duration: prefersReducedMotion ? 0.1 : 0.3, ease: "easeOut" }}
          // z-[120] clears the cart drawer (z-[100]/z-[110]) so the bar is never
          // buried under it. border-t rather than a floating card: it reads as
          // part of the page furniture instead of an interruption.
          className="fixed inset-x-0 bottom-0 z-[120] border-t border-border bg-background"
          data-testid="consent-bar"
        >
          <div className="mx-auto flex max-w-5xl flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:gap-8">
            <p
              id="consent-message"
              className="text-sm font-light leading-relaxed text-muted-foreground"
            >
              {t("consent.message")}{" "}
              <Link
                href="/privacy"
                className="underline underline-offset-4 transition-colors hover:text-foreground"
              >
                {t("consent.privacyLink")}
              </Link>
            </p>

            <div className="flex shrink-0 gap-3">
              <button
                type="button"
                onClick={() => decide(false)}
                className={buttonClass}
                data-testid="button-consent-decline"
              >
                {t("consent.decline")}
              </button>
              <button
                type="button"
                onClick={() => decide(true)}
                className={buttonClass}
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
