import { useEffect, useRef, useState, type FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { trackEvent } from "@/lib/analytics";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

/**
 * Checkout-intent dialog.
 *
 * Opens INSTEAD of navigating to Shopify checkout while the store cannot take
 * money (see REAL_CHECKOUT_ENABLED in lib/flags.ts). Someone who picked a
 * product, added it and clicked buy has revealed far more intent than someone
 * typing an address into a footer — and it tells us which product at which
 * price, which is the question the demand test is asking.
 *
 * ── Copy constraints (hard) ──────────────────────────────────────────────
 * - NOTIFICATION ONLY. The word "reserve" is deliberately absent: it implies
 *   a claim on a specific piece that we are not making.
 * - No timeline. No "shipping in X weeks" — no date is known, so none is
 *   stated.
 * - No payment fields of any kind, and the cart is left untouched.
 * - Quiet register: no urgency, no countdown, no "limited spots".
 *
 * ── CASL ─────────────────────────────────────────────────────────────────
 * The newsletter checkbox is UNTICKED by default and is a second, separate
 * consent from "tell me when this is available". The server writes them to
 * two different audiences.
 */
type Props = {
  open: boolean;
  onClose: () => void;
  /** Cart context for the demand signal. Never identifies anyone. */
  context: {
    cartValue?: number;
    currency?: string;
    numItems?: number;
  };
};

type Status = "idle" | "sending" | "sent" | "error";

export default function CheckoutIntentDialog({ open, onClose, context }: Props) {
  const { t } = useTranslation("commerce");
  const prefersReducedMotion = useReducedMotion();
  const [status, setStatus] = useState<Status>("idle");
  const dialogRef = useRef<HTMLDivElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setStatus("idle");
      emailRef.current?.focus();
    }
  }, [open]);

  // Unlike the consent dialog, this one IS dismissable — it interrupts a
  // shopping action the visitor chose, so trapping them would be hostile.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (status === "sending") return;

    const form = e.currentTarget;
    const fd = new FormData(form);
    const email = String(fd.get("email") ?? "");
    const newsletterOptIn = fd.get("newsletterOptIn") === "on";

    setStatus("sending");
    try {
      const res = await fetch("/api/reserve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          newsletterOptIn,
          company: fd.get("company") ?? "",
          cartValue: context.cartValue,
          currency: context.currency,
          locale: document.documentElement.lang || undefined,
        }),
      });
      if (!res.ok) throw new Error(`reserve endpoint returned ${res.status}`);

      // Conversion step of the funnel. NOTE: the email address is deliberately
      // NOT an event property — this repo has leaked one into analytics once
      // already, and the address adds nothing to the demand signal.
      trackEvent("checkout_intent_email_submitted", {
        cart_value: context.cartValue,
        currency: context.currency,
        num_items: context.numItems,
        newsletter_opt_in: newsletterOptIn,
      });

      setStatus("sent");
      form.reset();
    } catch {
      setStatus("error");
    }
  };

  const labelClass =
    "mb-2 block text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground";

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: prefersReducedMotion ? 0.1 : 0.3 }}
          onClick={onClose}
          className="fixed inset-0 z-[130] flex items-center justify-center bg-foreground/40 p-6 backdrop-blur-[2px]"
        >
          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="checkout-intent-title"
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: prefersReducedMotion ? 0 : 12 }}
            transition={{ duration: prefersReducedMotion ? 0.1 : 0.3, ease: "easeOut" }}
            className="w-full max-w-md border border-border bg-background p-8"
          >
            {status === "sent" ? (
              <div data-testid="text-intent-success">
                <h2 id="checkout-intent-title" className="mb-4 font-serif text-2xl">
                  {t("checkoutIntent.successTitle")}
                </h2>
                <p className="mb-8 text-sm font-light leading-relaxed text-muted-foreground">
                  {t("checkoutIntent.successBody")}
                </p>
                <button
                  type="button"
                  onClick={onClose}
                  data-testid="button-intent-close"
                  className="w-full border border-border px-5 py-3 text-[10px] font-bold uppercase tracking-[0.2em] text-foreground transition-colors hover:bg-muted"
                >
                  {t("checkoutIntent.close")}
                </button>
              </div>
            ) : (
              <form onSubmit={onSubmit} data-testid="form-checkout-intent">
                <h2 id="checkout-intent-title" className="mb-4 font-serif text-2xl">
                  {t("checkoutIntent.title")}
                </h2>
                <p className="mb-6 text-sm font-light leading-relaxed text-muted-foreground">
                  {t("checkoutIntent.body")}
                </p>

                <label htmlFor="intent-email" className={labelClass}>
                  {t("checkoutIntent.emailLabel")}
                </label>
                <input
                  ref={emailRef}
                  id="intent-email"
                  name="email"
                  type="email"
                  required
                  maxLength={254}
                  autoComplete="email"
                  placeholder={t("checkoutIntent.emailPlaceholder")}
                  className="mb-5 w-full border border-border bg-background px-4 py-3 text-sm font-light text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                />

                {/* SEPARATE consent (CASL). Unticked by default — never
                    pre-check this, and never merge it into the line above. */}
                <label className="mb-6 flex cursor-pointer items-start gap-3 text-sm font-light text-muted-foreground">
                  <input
                    type="checkbox"
                    name="newsletterOptIn"
                    data-testid="checkbox-intent-newsletter"
                    className="mt-1"
                  />
                  <span>{t("checkoutIntent.newsletter")}</span>
                </label>

                <div aria-hidden="true" className="absolute left-[-9999px] h-px w-px overflow-hidden">
                  <input name="company" tabIndex={-1} autoComplete="off" />
                </div>

                {status === "error" && (
                  <div role="alert" data-testid="text-intent-error" className="mb-5">
                    <p className="text-sm font-medium text-foreground">
                      {t("checkoutIntent.errorTitle")}
                    </p>
                    <p className="text-sm font-light text-muted-foreground">
                      {t("checkoutIntent.errorBody")}
                    </p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={status === "sending"}
                  data-testid="button-intent-submit"
                  className="w-full bg-primary px-5 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-white transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {status === "sending"
                    ? t("checkoutIntent.submitting")
                    : t("checkoutIntent.submit")}
                </button>

                <p className="mt-4 text-center text-[10px] font-light text-muted-foreground">
                  {t("checkoutIntent.cartKept")}
                </p>
              </form>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
