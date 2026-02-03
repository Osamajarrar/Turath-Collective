import { useState, useEffect } from "react";
import { Link } from "wouter";
import { ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out border-b border-transparent",
        scrolled ? "bg-background/80 backdrop-blur-md border-border py-4" : "bg-transparent py-6"
      )}
    >
      <div className="container mx-auto px-6 md:px-12 flex items-center justify-between">
        {/* Left - Mobile Menu Trigger (Hidden for desktop for now, keeping it minimal) */}
        <div className="hidden md:block w-20">
            <Link href="/shop" className="text-sm uppercase tracking-widest hover:text-primary transition-colors font-medium">Shop</Link>
        </div>

        {/* Center - Logo */}
        <Link href="/">
          <span className="font-serif text-2xl md:text-3xl tracking-wide cursor-pointer text-foreground">
            TURATH COLLECTIVE
          </span>
        </Link>

        {/* Right - Actions */}
        <div className="flex items-center gap-6 w-20 justify-end">
          <span className="text-xs font-medium cursor-pointer hover:opacity-70 transition-opacity">
            FR <span className="opacity-30 mx-1">|</span> EN
          </span>
          <button className="relative group">
            <ShoppingBag className="w-5 h-5 text-foreground group-hover:text-primary transition-colors" strokeWidth={1.5} />
            <span className="absolute -top-1 -right-1 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
          </button>
        </div>
      </div>
    </nav>
  );
}
