import Navbar from "@/components/navbar";
import Hero from "@/components/hero";
import ProductGrid from "@/components/product-grid";
import Heritage from "@/components/heritage";
import Newsletter from "@/components/newsletter";

export default function Home() {
  return (
    <main className="min-h-screen bg-background selection:bg-primary/20 selection:text-primary">
      <Navbar />
      <Hero />
      <ProductGrid />
      <Heritage />
      <Newsletter />
      
      <footer className="py-12 bg-background border-t border-border/40 text-center">
        <p className="text-xs text-muted-foreground tracking-widest uppercase">
          © 2024 Turath Collective. All Rights Reserved.
        </p>
      </footer>
    </main>
  );
}
