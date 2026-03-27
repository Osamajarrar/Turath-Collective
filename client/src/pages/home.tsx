import { Link } from "wouter";
import { Instagram } from "lucide-react";
import { useTranslation } from "react-i18next";
import Navbar from "@/components/navbar";
import Hero from "@/components/hero";
import CollectionCards from "@/components/collection-cards";
import StorySection from "@/components/story-section";
import Heritage from "@/components/heritage";
import ValuesSection from "@/components/values-section";
import ReviewCarousel from "@/components/review-carousel";
import SocialProof from "@/components/social-proof";
import Newsletter from "@/components/newsletter";

export default function Home() {
  const { t } = useTranslation();

  return (
    <main className="min-h-screen bg-background selection:bg-primary/20 selection:text-primary">
      <Navbar />
      <Hero />
      <div className="space-y-0">
        <CollectionCards />
        <StorySection />
        <Heritage />
        <ValuesSection />
        <ReviewCarousel />
        <SocialProof />
        <Newsletter />
      </div>

      <footer className="py-24 bg-background border-t border-border/40">
        <div className="container mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-20">
            <div className="md:col-span-2">
              <span className="font-serif text-3xl tracking-wide block mb-8">TURATH COLLECTIVE</span>
              <p className="text-sm text-foreground/60 max-w-sm font-light leading-relaxed mb-8">
                {t("footer.tagline")}
              </p>
              <div className="flex gap-6">
                <a
                  href="https://www.instagram.com/turathcollective"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-foreground/40 hover:text-primary transition-colors"
                >
                  <Instagram className="w-5 h-5" />
                </a>
              </div>
            </div>
            <div>
              <h4 className="text-[10px] uppercase tracking-[0.3em] font-bold mb-8">{t("footer.explore")}</h4>
              <ul className="space-y-4 text-sm text-foreground/60 font-light">
                <li><Link href="/shop" className="hover:text-primary transition-colors">{t("footer.allCollections")}</Link></li>
                <li><Link href="/about" className="hover:text-primary transition-colors">{t("footer.ourStory")}</Link></li>
                <li><Link href="/process" className="hover:text-primary transition-colors">{t("footer.artisanProcess")}</Link></li>
                <li><Link href="/journal" className="hover:text-primary transition-colors">{t("footer.journal")}</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-[10px] uppercase tracking-[0.3em] font-bold mb-8">{t("footer.support")}</h4>
              <ul className="space-y-4 text-sm text-foreground/60 font-light">
                <li><Link href="/shipping" className="hover:text-primary transition-colors">{t("footer.shipping")}</Link></li>
                <li><Link href="/care" className="hover:text-primary transition-colors">{t("footer.careGuide")}</Link></li>
                <li><Link href="/wholesale" className="hover:text-primary transition-colors">{t("footer.wholesale")}</Link></li>
                <li><Link href="/contact" className="hover:text-primary transition-colors">{t("footer.contactUs")}</Link></li>
              </ul>
            </div>
          </div>
          <div className="pt-10 border-t border-border/20 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-[9px] text-muted-foreground tracking-[0.2em] uppercase font-bold">
              {t("footer.copyright")}
            </p>
            <div className="flex gap-8">
              <Link href="/privacy" className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground hover:text-primary transition-colors font-bold">
                {t("footer.privacy")}
              </Link>
              <Link href="/terms" className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground hover:text-primary transition-colors font-bold">
                {t("footer.terms")}
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
