import { useTranslation } from "react-i18next";
import { ArrowRight } from "lucide-react";

export default function Newsletter() {
  const { t } = useTranslation();

  return (
    <section className="py-12 bg-background relative overflow-hidden">
      <div className="container mx-auto px-6 text-center max-w-2xl relative z-10">
        <h2 className="font-serif text-3xl md:text-4xl text-foreground mb-4">
          {t("newsletter.heading")}
        </h2>
        <p className="text-muted-foreground mb-10 font-light">
          {t("newsletter.desc")}
        </p>

        <form className="flex flex-col md:flex-row gap-4 w-full" onSubmit={(e) => e.preventDefault()}>
          <label htmlFor="newsletter-email" className="sr-only">
            {t("newsletter.placeholder")}
          </label>
          <input
            id="newsletter-email"
            type="email"
            placeholder={t("newsletter.placeholder")}
            data-testid="input-newsletter-email"
            className="flex-1 bg-transparent border-b border-border py-3 px-2 focus:outline-none focus:border-primary transition-colors rounded-none placeholder:text-muted-foreground/50 font-sans"
          />
          <button
            data-testid="button-newsletter-subscribe"
            className="group bg-primary text-white px-8 py-3 rounded-none flex items-center justify-center gap-2 hover:bg-primary/85 transition-all duration-300 shadow-lg shadow-primary/10 uppercase tracking-[0.3em] text-[10px] font-bold whitespace-nowrap"
          >
            {t("newsletter.cta")}
            <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform duration-300 rtl:rotate-180 rtl:group-hover:-translate-x-1" />
          </button>
        </form>
      </div>
    </section>
  );
}
