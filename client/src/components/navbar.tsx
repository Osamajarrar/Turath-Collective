import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { ShoppingBag, X, Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const cartItems = [
  { id: 1, name: "Classic Indigo Mug", price: 38.00, quantity: 1 },
  { id: 2, name: "Burgundy Hand-Painted Bowl", price: 52.00, quantity: 1 }
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [currency, setCurrency] = useState("CAD");

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <>
      {/* Announcement Banner */}
      <div className="bg-secondary text-secondary-foreground py-2 text-center text-[10px] uppercase tracking-[0.2em] font-medium z-[60] relative">
        Free shipping on orders above 100 CAD
      </div>

      <nav
        className={cn(
          "fixed top-10 left-0 right-0 z-50 transition-all duration-300 ease-in-out border-b border-transparent",
          scrolled || isCartOpen ? "bg-background/80 backdrop-blur-md border-border py-4" : "bg-transparent py-6"
        )}
      >
        <div className="container mx-auto px-6 md:px-12 flex items-center justify-between">
          <div className="hidden md:flex items-center gap-6 w-48">
              <Link href="/" className="text-[10px] uppercase tracking-widest hover:text-primary transition-colors font-bold">Collection</Link>
              <div className="flex gap-2">
                {["CAD", "USD", "EUR"].map((c) => (
                  <button 
                    key={c}
                    onClick={() => setCurrency(c)}
                    className={cn("text-[9px] font-bold transition-colors", currency === c ? "text-primary" : "text-muted-foreground hover:text-foreground")}
                  >
                    {c}
                  </button>
                ))}
              </div>
          </div>

          <Link href="/">
            <span className="font-serif text-xl md:text-2xl lg:text-3xl tracking-[0.1em] cursor-pointer text-foreground text-center flex-1">
              TURATH COLLECTIVE
            </span>
          </Link>

          <div className="flex items-center gap-6 w-48 justify-end">
            <div className="flex items-center gap-3">
              <button className="text-[9px] font-bold hover:text-primary transition-colors">عربي</button>
              <span className="text-[9px] font-bold cursor-pointer hover:opacity-70 transition-opacity">
                FR <span className="opacity-30 mx-0.5">|</span> EN
              </span>
            </div>
            <button 
              onClick={() => setIsCartOpen(true)}
              className="relative group p-2"
            >
              <ShoppingBag className="w-5 h-5 text-foreground group-hover:text-primary transition-colors" strokeWidth={1.2} />
              <span className="absolute top-1 right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-primary text-[8px] text-white font-bold">
                {cartItems.length}
              </span>
            </button>
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[60]"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 h-full w-full max-w-md bg-background z-[70] shadow-2xl flex flex-col"
            >
              <div className="p-8 flex items-center justify-between border-b border-border">
                <h2 className="font-serif text-2xl">Your Bag</h2>
                <button 
                  onClick={() => setIsCartOpen(false)}
                  className="p-2 hover:bg-muted rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-8">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex gap-6">
                    <div className="w-20 h-24 bg-muted rounded-none" />
                    <div className="flex-1 flex flex-col justify-between py-1">
                      <div>
                        <h3 className="font-serif text-lg leading-tight">{item.name}</h3>
                        <p className="text-[10px] uppercase tracking-widest text-muted-foreground mt-2 font-bold">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-sans text-sm font-medium">{currency} ${item.price.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-8 bg-muted/20 border-t border-border space-y-6">
                <div className="flex justify-between items-baseline">
                  <span className="text-[10px] uppercase tracking-widest font-bold">Subtotal</span>
                  <span className="font-sans text-xl font-medium">{currency} ${subtotal.toFixed(2)}</span>
                </div>
                <Link href="/checkout">
                  <button className="w-full bg-primary text-primary-foreground py-5 uppercase tracking-widest text-xs font-bold hover:bg-primary/90 transition-colors">
                    Checkout Now
                  </button>
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
