import { useState, useEffect } from "react";
import { Link } from "wouter";
import { ShoppingBag, Search, Globe, User, X, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion";

export default function Navbar() {
  const [hidden, setHidden] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() ?? 0;
    setIsScrolled(latest > 50);
    if (latest > previous && latest > 150) {
      setHidden(true);
    } else {
      setHidden(false);
    }
  });

  return (
    <>
      {/* Announcement Banner */}
      <div className="bg-secondary text-secondary-foreground py-2 text-center text-[10px] uppercase tracking-[0.2em] font-medium z-[60] relative">
        Free shipping on orders above 100 CAD
      </div>

      <motion.nav
        variants={{
          visible: { y: 0 },
          hidden: { y: "-100%" },
        }}
        animate={hidden ? "hidden" : "visible"}
        transition={{ duration: 0.35, ease: "easeInOut" }}
        className={cn(
          "fixed left-0 right-0 z-50 transition-all duration-300 border-b",
          isScrolled || isCartOpen || isLangOpen || isMenuOpen
            ? "bg-background/80 backdrop-blur-md border-border py-4 top-0" 
            : "bg-transparent border-transparent py-6 top-10"
        )}
      >
        <div className="container mx-auto px-6 md:px-12 flex items-center justify-between">
          {/* Mobile Menu Trigger */}
          <div className="md:hidden w-1/3">
            <button onClick={() => setIsMenuOpen(true)} className="p-2"><Menu className="w-5 h-5" /></button>
          </div>

          {/* Left Side - Desktop */}
          <div className="hidden md:flex items-center gap-8 w-1/3">
            <Link href="/shop" className="text-[10px] uppercase tracking-[0.2em] hover:text-primary transition-colors font-bold">Shop</Link>
            <Link href="/about" className="text-[10px] uppercase tracking-[0.2em] hover:text-primary transition-colors font-bold">About</Link>
          </div>

          {/* Center Side */}
          <div className="w-1/3 flex flex-col items-center">
            <Link href="/">
              <span className="font-serif text-xl md:text-2xl tracking-[0.15em] cursor-pointer text-foreground">
                TURATH COLLECTIVE
              </span>
            </Link>
            <span className="text-[8px] uppercase tracking-[0.4em] text-primary font-bold mt-1">Heritage Craftsmanship</span>
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-3 md:gap-5 w-1/3 justify-end">
            <div className="hidden lg:flex items-center bg-muted/50 px-3 py-1.5 rounded-full border border-border/50">
              <Search className="w-3.5 h-3.5 text-muted-foreground" />
              <input type="text" placeholder="Search..." className="bg-transparent border-none text-[10px] px-2 focus:outline-none w-24" />
            </div>
            
            <button onClick={() => setIsLangOpen(true)} className="p-1.5 hover:bg-muted rounded-full transition-colors">
              <Globe className="w-4.5 h-4.5 text-foreground" strokeWidth={1.5} />
            </button>
            
            <Link href="/login">
              <button className="p-1.5 hover:bg-muted rounded-full transition-colors">
                <User className="w-4.5 h-4.5 text-foreground" strokeWidth={1.5} />
              </button>
            </Link>

            <button onClick={() => setIsCartOpen(true)} className="p-1.5 hover:bg-muted rounded-full transition-colors relative">
              <ShoppingBag className="w-4.5 h-4.5 text-foreground" strokeWidth={1.5} />
              <span className="absolute top-0 right-0 h-3 w-3 bg-primary rounded-full flex items-center justify-center text-[7px] text-white font-bold">2</span>
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
            />
            <motion.div 
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 h-full w-full max-w-sm bg-background z-[110] shadow-2xl flex flex-col"
            >
              <div className="p-8 flex items-center justify-between border-b border-border">
                <span className="font-serif text-xl tracking-[0.1em]">TURATH</span>
                <button onClick={() => setIsMenuOpen(false)} className="p-2"><X className="w-6 h-6" /></button>
              </div>
              <div className="flex-1 p-8 space-y-8 overflow-y-auto">
                <div className="space-y-4">
                  <p className="text-[10px] uppercase tracking-widest font-bold opacity-30">Collections</p>
                  <Link href="/shop" onClick={() => setIsMenuOpen(false)} className="block text-3xl font-serif">All Products</Link>
                  <Link href="/shop?category=ceramics" onClick={() => setIsMenuOpen(false)} className="block text-3xl font-serif">Ceramics</Link>
                  <Link href="/shop?category=embroidery" onClick={() => setIsMenuOpen(false)} className="block text-3xl font-serif">Embroidery</Link>
                </div>
                <div className="space-y-4 pt-8 border-t border-border/50">
                  <p className="text-[10px] uppercase tracking-widest font-bold opacity-30">Brand</p>
                  <Link href="/about" onClick={() => setIsMenuOpen(false)} className="block text-3xl font-serif">Our Story</Link>
                  <Link href="/login" onClick={() => setIsMenuOpen(false)} className="block text-3xl font-serif">Account</Link>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Language / Region Dialog */}
      <AnimatePresence>
        {isLangOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setIsLangOpen(false)} 
              className="absolute inset-0 bg-black/40 backdrop-blur-sm" 
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.95, opacity: 0 }} 
              className="relative bg-background w-full max-w-md p-8 shadow-2xl rounded-none border border-border"
            >
              <div className="flex justify-between items-center mb-8">
                <h3 className="font-serif text-2xl uppercase tracking-wider">Region & Language</h3>
                <button onClick={() => setIsLangOpen(false)}><X className="w-5 h-5" /></button>
              </div>
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-bold opacity-50">Country / Region</label>
                  <select className="w-full bg-muted/50 border border-border p-3 text-sm focus:outline-none">
                    <option>Canada (CAD $)</option>
                    <option>United States (USD $)</option>
                    <option>Palestine (ILS ₪)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-bold opacity-50">Language</label>
                  <select className="w-full bg-muted/50 border border-border p-3 text-sm focus:outline-none">
                    <option>English</option>
                    <option>Français</option>
                    <option>العربية (Arabic)</option>
                  </select>
                </div>
                <button className="w-full bg-primary text-white py-4 uppercase tracking-[0.2em] text-xs font-bold mt-4">Save Selection</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Cart Drawer */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsCartOpen(false)} className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[100]" />
            <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }} className="fixed right-0 top-0 h-full w-full max-w-md bg-background z-[110] shadow-2xl flex flex-col">
              <div className="p-8 flex items-center justify-between border-b border-border">
                <h2 className="font-serif text-2xl uppercase tracking-wider">Your Bag</h2>
                <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-muted rounded-full transition-colors"><X className="w-5 h-5" /></button>
              </div>
              <div className="flex-1 p-8 overflow-y-auto">
                <div className="flex gap-6 mb-8">
                  <div className="w-20 h-24 bg-muted" />
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-serif text-lg">Classic Indigo Mug</h4>
                      <p className="text-[10px] uppercase tracking-widest font-bold opacity-40 mt-1">Qty: 1</p>
                    </div>
                    <p className="text-sm font-bold">CAD $38.00</p>
                  </div>
                </div>
              </div>
              <div className="p-8 bg-muted/20 border-t border-border space-y-4">
                <div className="flex justify-between font-bold text-xs uppercase tracking-widest">
                  <span>Subtotal</span>
                  <span>CAD $90.00</span>
                </div>
                <Link href="/checkout"><button className="w-full bg-primary text-white py-5 uppercase tracking-[0.2em] text-[10px] font-bold">Checkout</button></Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
