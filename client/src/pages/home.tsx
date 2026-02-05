import Navbar from "@/components/navbar";
import Hero from "@/components/hero";
import ProductGrid from "@/components/product-grid";
import StorySection from "@/components/story-section";
import Heritage from "@/components/heritage";
import ValuesSection from "@/components/values-section";
import Newsletter from "@/components/newsletter";

export default function Home() {
  return (
    <main className="min-h-screen bg-background selection:bg-primary/20 selection:text-primary">
      <Navbar />
      <Hero />
      <div className="space-y-0">
        <ProductGrid />
        <StorySection />
        <Heritage />
        <ValuesSection />
        <Newsletter />
      </div>
      
      <footer className="py-16 bg-background border-t border-border/40">
        <div className="container mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="md:col-span-2">
              <span className="font-serif text-2xl tracking-wide block mb-6">TURATH COLLECTIVE</span>
              <p className="text-sm text-foreground/60 max-w-sm font-light leading-relaxed">
                Elevating the everyday through heritage craftsmanship. Based in Montreal, crafted in Hebron.
              </p>
            </div>
            <div>
              <h4 className="text-xs uppercase tracking-widest font-bold mb-6">Explore</h4>
              <ul className="space-y-3 text-sm text-foreground/60 font-light">
                <li><a href="#" className="hover:text-primary transition-colors">Collections</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Our Story</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Process</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Journal</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs uppercase tracking-widest font-bold mb-6">Support</h4>
              <ul className="space-y-3 text-sm text-foreground/60 font-light">
                <li><a href="#" className="hover:text-primary transition-colors">Shipping</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Returns</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Care Guide</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Contact</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-border/20 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-[10px] text-muted-foreground tracking-widest uppercase">
              © 2026 Turath Collective.
            </p>
            <div className="flex gap-6">
              <a href="#" className="text-[10px] uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors">Instagram</a>
              <a href="#" className="text-[10px] uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors">Pinterest</a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
