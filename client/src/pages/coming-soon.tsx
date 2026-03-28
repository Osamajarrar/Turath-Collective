import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Instagram, ArrowRight, Check } from "lucide-react";
import { applyRtl } from "@/lib/i18n";
import brandVideo from "@/assets/brand-video.mp4";

// Newsletter form is UI-only for launch v1.
// Connect to Mailchimp / Klaviyo when ready by replacing the handleSubscribe stub.

const LANGUAGES = ["en", "fr", "ar"] as const;

export default function ComingSoon() {
  const { t, i18n } = useTranslation();
  const [email, setEmail] = useState("");
  const [fieldError, setFieldError] = useState("");
  const [done, setDone] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isRtl = i18n.language === "ar";

  function switchLang(lang: string) {
    i18n.changeLanguage(lang);
    applyRtl(lang);
  }

  async function handleSubscribe(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) return setFieldError(t("comingSoon.errorEmpty"));
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return setFieldError(t("comingSoon.errorInvalid"));
    setFieldError("");
    setIsSubmitting(true);
    // Stub: replace with Mailchimp/Klaviyo API call when ready
    await new Promise((r) => setTimeout(r, 700));
    setIsSubmitting(false);
    setDone(true);
  }

  return (
    <div
      className="relative min-h-screen w-full overflow-hidden bg-[#0c0703] flex flex-col"
      dir={isRtl ? "rtl" : "ltr"}
    >
      {/* Background video */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover opacity-40"
          src={brandVideo}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0c0703] via-[#0c0703]/60 to-[#0c0703]/30" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0c0703]/70 via-transparent to-[#0c0703]/80" />
      </div>

      {/* Film grain texture */}
      <div
        className="absolute inset-0 z-0 opacity-[0.035] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
          backgroundSize: "128px 128px",
        }}
      />

      {/* Top bar */}
      <header className="relative z-10 flex items-center justify-between px-8 md:px-14 pt-10">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="font-serif text-[#F5EDD6] text-lg tracking-widest uppercase">
            Turath Collective
          </span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="flex items-center gap-1"
        >
          {LANGUAGES.map((lang, idx) => (
            <span key={lang} className="flex items-center">
              <button
                onClick={() => switchLang(lang)}
                data-testid={`button-lang-${lang}`}
                className={`
                  text-[10px] font-bold uppercase tracking-[0.2em] px-2 py-1
                  transition-colors duration-300
                  ${i18n.language === lang
                    ? "text-[#F5EDD6]"
                    : "text-[#F5EDD6]/35 hover:text-[#F5EDD6]/70"
                  }
                `}
              >
                {lang}
              </button>
              {idx < LANGUAGES.length - 1 && (
                <span className="text-[#F5EDD6]/20 text-[10px]">·</span>
              )}
            </span>
          ))}
        </motion.div>
      </header>

      {/* Main content */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 text-center">

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="mb-10"
        >
          <span
            data-testid="badge-coming-soon"
            className="inline-flex items-center gap-2.5 border border-[#800000]/60 text-[#800000] px-5 py-2 text-[9px] font-bold uppercase tracking-[0.4em]"
          >
            <span className="w-1 h-1 rounded-full bg-[#800000] inline-block" />
            {t("comingSoon.badge")}
            <span className="w-1 h-1 rounded-full bg-[#800000] inline-block" />
          </span>
        </motion.div>

        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="mb-6"
        >
          <h1
            data-testid="heading-brand"
            className="font-serif text-[#F5EDD6] leading-[0.88] tracking-tight"
            style={{ fontSize: "clamp(4rem, 14vw, 11rem)" }}
          >
            <span className="block font-bold">{t("comingSoon.heading")}</span>
            <span className="block italic font-light opacity-70">
              {t("comingSoon.headingItalic")}
            </span>
          </h1>
        </motion.div>

        {/* Arabic accent (shown in EN/FR only) */}
        {i18n.language !== "ar" && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2, delay: 0.5 }}
            className="font-serif text-[#F5EDD6]/25 text-3xl md:text-4xl mb-10 tracking-wide"
            dir="rtl"
          >
            {t("comingSoon.arabicWord")}
          </motion.p>
        )}

        {/* Ornamental divider */}
        <motion.div
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ duration: 1, delay: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="flex items-center gap-4 mb-10 w-full max-w-xs"
        >
          <div className="flex-1 h-px bg-gradient-to-r from-transparent to-[#800000]/50" />
          <div className="w-1.5 h-1.5 rotate-45 bg-[#800000]/60" />
          <div className="flex-1 h-px bg-gradient-to-l from-transparent to-[#800000]/50" />
        </motion.div>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
          data-testid="text-tagline"
          className="text-[#F5EDD6]/65 text-sm md:text-base tracking-wide max-w-md leading-relaxed mb-4"
        >
          {t("comingSoon.tagline")}
        </motion.p>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="text-[#F5EDD6]/40 text-xs md:text-sm tracking-wide max-w-sm leading-relaxed mb-12"
        >
          {t("comingSoon.desc")}
        </motion.p>

        {/* Email form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-sm"
        >
          <AnimatePresence mode="wait">
            {done ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                data-testid="text-subscribed"
                className="flex items-center justify-center gap-3 py-5 border border-[#800000]/30 text-[#F5EDD6]/80"
              >
                <span className="w-5 h-5 rounded-full bg-[#800000] flex items-center justify-center flex-shrink-0">
                  <Check className="w-3 h-3 text-white" />
                </span>
                <span className="text-xs tracking-widest uppercase font-bold">
                  {t("comingSoon.subscribed")}
                </span>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                onSubmit={handleSubscribe}
                className="flex flex-col sm:flex-row gap-0"
              >
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setFieldError(""); }}
                  placeholder={t("comingSoon.emailPlaceholder")}
                  data-testid="input-email"
                  disabled={isSubmitting}
                  className={`
                    flex-1 bg-transparent border text-[#F5EDD6] placeholder-[#F5EDD6]/30
                    text-xs tracking-widest px-5 py-4 outline-none transition-colors duration-300
                    ${fieldError
                      ? "border-red-500/60 focus:border-red-500"
                      : "border-[#F5EDD6]/15 focus:border-[#800000]/70"
                    }
                    sm:border-r-0 ${isRtl ? "sm:border-r sm:border-l-0" : ""}
                  `}
                />
                <button
                  type="submit"
                  data-testid="button-notify"
                  disabled={isSubmitting}
                  className="group bg-[#800000] hover:bg-[#6d0000] text-white px-7 py-4 flex items-center justify-center gap-3 text-[9px] font-bold uppercase tracking-[0.35em] transition-all duration-300 border border-[#800000] disabled:opacity-60 whitespace-nowrap"
                >
                  {isSubmitting ? (
                    <span className="w-3 h-3 border border-white/40 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      {t("comingSoon.subscribe")}
                      <ArrowRight
                        className={`w-3 h-3 transition-transform duration-300 group-hover:translate-x-1 ${isRtl ? "rotate-180 group-hover:-translate-x-1 group-hover:translate-x-0" : ""}`}
                      />
                    </>
                  )}
                </button>
              </motion.form>
            )}
          </AnimatePresence>

          {fieldError && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-2 text-red-400/80 text-[10px] tracking-wide"
            >
              {fieldError}
            </motion.p>
          )}

          {!done && (
            <p className="mt-4 text-[#F5EDD6]/25 text-[10px] tracking-wide">
              {t("comingSoon.privacy")}
            </p>
          )}
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 flex flex-col sm:flex-row items-center justify-between px-8 md:px-14 pb-10 pt-8 gap-4">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1 }}
          className="text-[#F5EDD6]/25 text-[9px] tracking-[0.35em] uppercase order-2 sm:order-1"
        >
          {t("comingSoon.craftedIn")}
        </motion.p>

        <motion.a
          href="https://instagram.com/turathcollective"
          target="_blank"
          rel="noopener noreferrer"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.1 }}
          data-testid="link-instagram"
          className="flex items-center gap-2.5 text-[#F5EDD6]/35 hover:text-[#F5EDD6]/80 transition-colors duration-300 order-1 sm:order-2"
        >
          <Instagram className="w-4 h-4" />
          <span className="text-[9px] tracking-[0.3em] uppercase font-bold">@turathcollective</span>
        </motion.a>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.2 }}
          className="text-[#F5EDD6]/25 text-[9px] tracking-[0.35em] uppercase order-3"
        >
          {t("comingSoon.location")}
        </motion.p>
      </footer>
    </div>
  );
}
