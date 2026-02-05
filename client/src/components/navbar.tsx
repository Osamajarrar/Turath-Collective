import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { ShoppingBag, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

// Mock cart state (in a real app this would be in a context/store)
const cartItems = [
  { id: 1, name: "Classic Indigo Mug", price: 38.00, quantity: 1 },
  { id: 2, name: "Burgundy Hand-Painted Bowl", price: 52.00, quantity: 1 }
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [location] = useLocation();

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
      <nav
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out border-b border-transparent",
          scrolled || isCartOpen ? "bg-background/80 backdrop-blur-md border-border py-4" : "bg-transparent py-6"
        )}
      >
        <div className="container mx-auto px-6 md:px-12 flex items-center justify-between">
          <div className="hidden md:block w-20">
              <Link href="/" className="text-sm uppercase tracking-widest hover:text-primary transition-colors font-medium">Home</Link>
          </div>

          <Link href="/">
            <span className="font-serif text-2xl md:text-3xl tracking-wide cursor-pointer text-foreground">
              TURATH COLLECTIVE
            </span>
          </Link>

          <div className="flex items-center gap-6 w-20 justify-end">
            <span className="text-xs font-medium cursor-pointer hover:opacity-70 transition-opacity hidden sm:inline">
              FR <span className="opacity-30 mx-1">|</span> EN
            </span>
            <button 
              onClick={() => setIsCartOpen(true)}
              className="relative group p-2"
              data-testid="button-cart"
            >
              <ShoppingBag className="w-5 h-5 text-foreground group-hover:text-primary transition-colors" strokeWidth={1.5} />
              <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-white">
                {cartItems.length}
              </span>
            </button>
          </div>
        </div>
      </nav>

      {/* Slide-out Cart Drawer */}
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
                <h2 className="font-serif text-2xl">Your Cart</h2>
                <button 
                  onClick={() => setIsCartOpen(false)}
                  className="p-2 hover:bg-muted rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-8">
                {cartItems.length > 0 ? (
                  cartItems.map((item) => (
                    <div key={item.id} className="flex gap-6">
                      <div className="w-24 h-24 bg-muted animate-pulse rounded-none" />
                      <div className="flex-1 flex flex-col justify-between py-1">
                        <div>
                          <h3 className="font-serif text-lg leading-tight">{item.name}</h3>
                          <p className="text-sm text-muted-foreground mt-1">Quantity: {item.quantity}</p>
                        </div>
                        <p className="font-sans text-sm font-medium">${item.price.toFixed(2)}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center">
                    <ShoppingBag className="w-12 h-12 text-muted mb-4" strokeWidth={1} />
                    <p className="text-muted-foreground font-light italic">Your cart is currently empty.</p>
                  </div>
                )}
              </div>

              <div className="p-8 bg-muted/30 border-t border-border space-y-6">
                <div className="flex justify-between items-baseline">
                  <span className="text-xs uppercase tracking-widest font-bold">Subtotal</span>
                  <span className="font-sans text-xl font-medium">${subtotal.toFixed(2)}</span>
                </div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
                  Shipping and taxes calculated at checkout.
                </p>
                <Link href="/checkout">
                  <button className="w-full bg-primary text-primary-foreground py-4 uppercase tracking-widest text-sm font-medium hover:bg-primary/90 transition-colors">
                    Proceed to Checkout
                  </button>
                </Link>
                <button 
                  onClick={() => setIsCartOpen(false)}
                  className="w-full text-center text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
                >
                  Continue Shopping
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
