import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { hasDecidedAll, setConsent, onConsentChange } from "@/lib/consent";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

/**
 * Opt-in analytics consent (PIPEDA / Quebec Law 25).
 *
 * A CENTERED MODAL rather than the bottom bar this started as. The bar was
 * easy to ignore, so most visitors never chose and analytics never ran for
 * them — the choice has to actually be made for either answer to mean
 * anything.
 *
 * ── Why this is not a cookie-wall ────────────────────────────────────────
 * Law 25 and PIPEDA invalidate consent that is a condition of access. What
 * they require is that refusing be as easy as accepting — so:
 *
 *   - the two buttons are VISUALLY IDENTICAL and side by side, in a
 *     randomised-free fixed order. Neither is emphasised. (The previous
 *     version filled "Accept" and outlined "Essential only", which nudges.)
 *   - both are a single click, at the same distance, with no extra step,
 *     no second confirmation and no "are you sure" on decline.
 *   - declining leaves the entire site working, with nothing withheld.
 *   - the page content behind stays rendered and is not scroll-locked, so
 *     nothing is hidden from someone who has not answered.
 *
 * There is deliberately no X, no "continue without choosing", and Escape does
 * not dismiss it — those are all ways to end up with no decision, which is the
 * state that helps nobody. They are not a way to obtain access.
 *
 * ── What is NOT done here ────────────────────────────────────────────────
 * Nothing is tracked before a choice. There is no "anonymous pre-consent"
 * mode: see plan 11 branch 4 option B — it was specified but left off, as it
 * is legally unsettled and was not signed off.
 *
 * Renders only while no decision exists (getConsent() === null).
 */
export default function CookieConsent() {
  const { t } = useTranslation();
  const prefersReducedMotion = useReducedMotion();
  // hasDecidedAll, not "is there any decision": when a NEW consent category is
  // added later, a visitor who already answered the old ones is re-prompted
  // about that category alone rather than not at all.
  const [visible, setVisible] = useState<boolean>(() => !hasDecidedAll());
  const dialogRef = useRef<HTMLDivElement>(null);
  const acceptButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    // Hide if a decision is made elsewhere (e.g. another tab / component).
    return onConsentChange(() => setVisible(false));
  }, []);

  // Focus Accept. This is the ONE lean toward consent that survives the
  // equal-weight requirement: the buttons remain visually identical, so
  // neither is emphasised, but Accept is where the keyboard lands and is
  // therefore the path of least resistance. Colour-weighting Accept instead
  // (filled primary vs outlined Decline) is the pattern regulators actually
  // cite — see the class string below, which both buttons deliberately share.
  useEffect(() => {
    if (visible) acceptButtonRef.current?.focus();
  }, [visible]);

  // Focus trap. Without it, Tab walks out of the dialog into page content the
  // dialog is covering, which is both an a11y bug and a way to never answer.
  useEffect(() => {
    if (!visible) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
        'button, a[href], [tabindex]:not([tabindex="-1"])',
      );
      if (!focusable || focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      if (e.shiftKey && active === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [visible]);

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
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary";

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: prefersReducedMotion ? 0.1 : 0.3 }}
          // z-[120] clears the cart drawer (z-[100]/z-[110]). Unlike the old
          // bottom bar it must sit ABOVE everything: it is answered and gone
          // before any shopping happens.
          className="fixed inset-0 z-[120] flex items-center justify-center bg-foreground/40 p-6 backdrop-blur-[2px]"
        >
          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="consent-title"
            aria-describedby="consent-message"
            initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: prefersReducedMotion ? 0 : 12 }}
            transition={{ duration: prefersReducedMotion ? 0.1 : 0.3, ease: "easeOut" }}
            className="w-full max-w-md border border-border bg-background p-8"
          >
            <h2
              id="consent-title"
              className="mb-4 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground"
            >
              {t("consent.label")}
            </h2>

            <p
              id="consent-message"
              className="mb-6 text-sm font-light leading-relaxed text-muted-foreground"
            >
              {t("consent.message")}{" "}
              <Link
                href="/privacy"
                className="underline underline-offset-4 transition-colors hover:text-foreground"
              >
                {t("consent.privacyLink")}
              </Link>
            </p>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => decide(false)}
                className={buttonClass}
                data-testid="button-consent-decline"
              >
                {t("consent.decline")}
              </button>
              <button
                ref={acceptButtonRef}
                type="button"
                onClick={() => decide(true)}
                className={buttonClass}
                data-testid="button-consent-accept"
              >
                {t("consent.accept")}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
