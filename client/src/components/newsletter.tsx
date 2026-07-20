import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ArrowRight, Check } from "lucide-react";

// Submits to /api/newsletter, which stores the email locally (no provider is
// connected yet — see server/newsletter.ts). Success is shown only after the
// server confirms the email was persisted; failures show a real error state.
export default function Newsletter() {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (status === "submitting") return;
    setStatus("submitting");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      if (!res.ok) throw new Error(`newsletter signup failed: ${res.status}`);
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  return (
    <section className="py-12 bg-background relative overflow-hidden">
      <div className="container mx-auto px-6 text-center max-w-2xl relative z-10">
        <h2 className="font-serif text-3xl md:text-4xl text-foreground mb-4">
          {t("newsletter.heading")}
        </h2>
        <p className="text-muted-foreground mb-10 font-light">
          {t("newsletter.desc")}
        </p>

        {status === "success" ? (
          <div
            data-testid="text-newsletter-success"
            className="flex items-center justify-center gap-3 py-4 border border-border text-foreground/80"
          >
            <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-primary">
              <Check className="h-3 w-3 text-white" />
            </span>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em]">
              {t("newsletter.success")}
            </span>
          </div>
        ) : (
          <>
            <form className="flex flex-col md:flex-row gap-4 w-full" onSubmit={handleSubmit}>
              <label htmlFor="newsletter-email" className="sr-only">
                {t("newsletter.placeholder")}
              </label>
              <input
                id="newsletter-email"
                type="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (status === "error") setStatus("idle");
                }}
                placeholder={t("newsletter.placeholder")}
                data-testid="input-newsletter-email"
                disabled={status === "submitting"}
                className="flex-1 bg-transparent border-b border-border py-3 px-2 focus:outline-none focus:border-primary transition-colors rounded-none placeholder:text-muted-foreground/50 font-sans disabled:opacity-60"
              />
              <button
                type="submit"
                data-testid="button-newsletter-subscribe"
                disabled={status === "submitting"}
                className="group bg-primary text-primary-foreground px-9 py-4 rounded-none flex items-center justify-center gap-2 hover:bg-primary/85 transition-all duration-300 shadow-lg shadow-primary/10 uppercase tracking-[0.3em] text-[10px] font-bold whitespace-nowrap disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                {t("newsletter.cta")}
                <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform duration-300 rtl:rotate-180 rtl:group-hover:-translate-x-1" />
              </button>
            </form>
            {status === "error" && (
              <p
                data-testid="text-newsletter-error"
                className="mt-4 text-[10px] tracking-wide text-destructive"
              >
                {t("newsletter.error")}
              </p>
            )}
          </>
        )}
      </div>
    </section>
  );
}
