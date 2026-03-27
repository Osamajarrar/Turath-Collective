import Navbar from "@/components/navbar";
import Hero from "@/components/hero";
import CollectionCards from "@/components/collection-cards";
import ProductGrid from "@/components/product-grid";
import StorySection from "@/components/story-section";
import Heritage from "@/components/heritage";
import ValuesSection from "@/components/values-section";
import ReviewCarousel from "@/components/review-carousel";
import SocialProof from "@/components/social-proof";
import Newsletter from "@/components/newsletter";

export default function Home() {
  return (
    <main className="min-h-screen bg-background selection:bg-primary/20 selection:text-primary">
      <Navbar />
      <Hero />
      <div className="space-y-0">
        <CollectionCards />
        {/* <ProductGrid /> */}
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
                Elevating the everyday through heritage craftsmanship. Based in Montreal, crafted in Hebron. We exist to preserve and share the living traditions of Palestine.
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
              <h4 className="text-[10px] uppercase tracking-[0.3em] font-bold mb-8">Explore</h4>
              <ul className="space-y-4 text-sm text-foreground/60 font-light">
                <li><Link href="/shop" className="hover:text-primary transition-colors">All Collections</Link></li>
                <li><Link href="/about" className="hover:text-primary transition-colors">Our Story</Link></li>
                <li><Link href="/process" className="hover:text-primary transition-colors">Artisan Process</Link></li>
                <li><Link href="/journal" className="hover:text-primary transition-colors">Journal</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-[10px] uppercase tracking-[0.3em] font-bold mb-8">Support</h4>
              <ul className="space-y-4 text-sm text-foreground/60 font-light">
                <li><Link href="/shipping" className="hover:text-primary transition-colors">Shipping & Returns</Link></li>
                <li><Link href="/care" className="hover:text-primary transition-colors">Artisan Care Guide</Link></li>
                <li><Link href="/wholesale" className="hover:text-primary transition-colors">Wholesale</Link></li>
                <li><Link href="/contact" className="hover:text-primary transition-colors">Contact Us</Link></li>
              </ul>
            </div>
          </div>
          <div className="pt-10 border-t border-border/20 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-[9px] text-muted-foreground tracking-[0.2em] uppercase font-bold">
              © 2026 Turath Collective. Preserving tradition, one piece at a time.
            </p>
            <div className="flex gap-8">
              <Link href="/privacy" className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground hover:text-primary transition-colors font-bold">Privacy Policy</Link>
              <Link href="/terms" className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground hover:text-primary transition-colors font-bold">Terms of Service</Link>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}

import { Link } from "wouter";
import { Instagram } from "lucide-react";
