import { Link } from "wouter";
import { useTranslation } from "react-i18next";

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="py-12 bg-background border-t border-border/40">
      <div className="container mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-12">
          <div className="md:col-span-2">
            <span className="font-serif text-3xl tracking-wide block mb-8">
              TURATH COLLECTIVE
            </span>
            <p className="text-sm text-foreground/60 max-w-sm font-light leading-relaxed mb-8">
              {t("footer.tagline")}
            </p>
            <div className="flex gap-6">
              <a
                href="https://www.instagram.com/turathcollective"
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground/40 hover:text-primary transition-colors"
                aria-label="Instagram"
              >
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
              <a
                href="https://www.pinterest.com/turathcollective"
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground/40 hover:text-primary transition-colors"
                aria-label="Pinterest"
              >
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z" />
                </svg>
              </a>
              <a
                href="https://www.tiktok.com/@turathcollective"
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground/40 hover:text-primary transition-colors"
                aria-label="TikTok"
              >
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.75a4.85 4.85 0 0 1-1.01-.06z" />
                </svg>
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-[12px] uppercase tracking-[0.3em] font-bold mb-8">
              {t("footer.explore")}
            </h4>
            <ul className="space-y-4 text-sm text-foreground/60 font-light">
              <li>
                <Link
                  href="/shop"
                  className="hover:text-primary transition-colors"
                >
                  {t("footer.allCollections")}
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="hover:text-primary transition-colors"
                >
                  {t("footer.ourStory")}
                </Link>
              </li>
              <li>
                <Link
                  href="/process"
                  className="hover:text-primary transition-colors"
                >
                  {t("footer.artisanProcess")}
                </Link>
              </li>
              <li>
                <Link
                  href="/journal"
                  className="hover:text-primary transition-colors"
                >
                  {t("footer.journal")}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-[12px] uppercase tracking-[0.3em] font-bold mb-8">
              {t("footer.support")}
            </h4>
            <ul className="space-y-4 text-sm text-foreground/60 font-light">
              <li>
                <Link
                  href="/shipping"
                  className="hover:text-primary transition-colors"
                >
                  {t("footer.shipping")}
                </Link>
              </li>
              <li>
                <Link
                  href="/care"
                  className="hover:text-primary transition-colors"
                >
                  {t("footer.careGuide")}
                </Link>
              </li>
              <li>
                <Link
                  href="/wholesale"
                  className="hover:text-primary transition-colors"
                >
                  {t("footer.wholesale")}
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="hover:text-primary transition-colors"
                >
                  {t("footer.contactUs")}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-10 border-t border-border/20 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-[9px] text-muted-foreground tracking-[0.2em] uppercase font-bold">
            {t("footer.copyright")}
          </p>
          <div className="flex gap-8">
            <Link
              href="/privacy"
              className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground hover:text-primary transition-colors font-bold"
            >
              {t("footer.privacy")}
            </Link>
            <Link
              href="/terms"
              className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground hover:text-primary transition-colors font-bold"
            >
              {t("footer.terms")}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}