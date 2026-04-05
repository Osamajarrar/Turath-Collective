import { motion } from "framer-motion";
import { ChevronLeft, CreditCard, Apple, Truck, ShieldCheck, Lock, Instagram } from "lucide-react";
import { Link } from "wouter";
import img1 from "@/assets/burgundy-mug.png";
export default function CheckoutPage() {
  const cartItems = [
    { id: 1, name: "Classic Indigo Mug", price: 38.00, quantity: 1 },
    { id: 2, name: "Burgundy Hand-Painted Bowl", price: 52.00, quantity: 1 }
  ];

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const shipping = 15.00;
  const total = subtotal + shipping;

  return (
    <main className="min-h-screen bg-background flex flex-col font-sans">
      {/* Branded Header */}
      <header className="py-8 border-b border-border bg-white sticky top-0 z-50">
        <div className="container mx-auto px-6 md:px-12 flex justify-center items-center relative">
          <Link href="/" className="absolute left-6 md:left-12">
            <button className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors group font-bold">
              <ChevronLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
              Back
            </button>
          </Link>
          <Link href="/">
            <div className="flex flex-col items-center cursor-pointer">
              <span className="font-serif text-2xl tracking-[0.15em] text-foreground">
                TURATH COLLECTIVE
              </span>
              <span className="text-[10px] uppercase tracking-[0.4em] text-primary font-bold mt-1">Heritage Craftsmanship</span>
            </div>
          </Link>
        </div>
      </header>

      <div className="flex-1 container mx-auto px-6 md:px-12 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          {/* Form Side */}
          <div className="lg:col-span-7 space-y-12">
            <section>
              <h2 className="font-serif text-3xl mb-8">Express Checkout</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button className="bg-[#000] text-white py-4 rounded-none flex items-center justify-center gap-2 hover:opacity-90 transition-opacity">
                  <Apple className="w-5 h-5 fill-current" />
                  <span className="font-medium">Apple Pay</span>
                </button>
                <button className="bg-[#635BFF] text-white py-4 rounded-none flex items-center justify-center gap-2 hover:opacity-90 transition-opacity">
                  <span className="font-bold italic">Stripe</span>
                </button>
              </div>
              <div className="relative my-10 text-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border"></div>
                </div>
                <span className="relative px-4 bg-background text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Or pay with card</span>
              </div>
            </section>

            <section className="space-y-8">
              <div>
                <h3 className="text-xs uppercase tracking-widest font-bold mb-6 flex items-center gap-2">
                  <Truck className="w-4 h-4" /> 01. Shipping Address
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-1">
                    <label htmlFor="first-name" className="sr-only">First Name</label>
                    <input id="first-name" placeholder="First Name" className="w-full bg-transparent border-b border-border py-3 focus:outline-none focus:border-primary" />
                  </div>
                  <div className="col-span-1">
                    <label htmlFor="last-name" className="sr-only">Last Name</label>
                    <input id="last-name" placeholder="Last Name" className="w-full bg-transparent border-b border-border py-3 focus:outline-none focus:border-primary" />
                  </div>
                  <div className="col-span-2">
                    <label htmlFor="address" className="sr-only">Address</label>
                    <input id="address" placeholder="Address" className="w-full bg-transparent border-b border-border py-3 focus:outline-none focus:border-primary" />
                  </div>
                  <div className="col-span-2">
                    <label htmlFor="apartment" className="sr-only">Apartment, suite, etc. (optional)</label>
                    <input id="apartment" placeholder="Apartment, suite, etc. (optional)" className="w-full bg-transparent border-b border-border py-3 focus:outline-none focus:border-primary" />
                  </div>
                  <div className="col-span-1">
                    <label htmlFor="city" className="sr-only">City</label>
                    <input id="city" placeholder="City" className="w-full bg-transparent border-b border-border py-3 focus:outline-none focus:border-primary" />
                  </div>
                  <div className="col-span-1">
                    <label htmlFor="postal-code" className="sr-only">Postal Code</label>
                    <input id="postal-code" placeholder="Postal Code" className="w-full bg-transparent border-b border-border py-3 focus:outline-none focus:border-primary" />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xs uppercase tracking-widest font-bold mb-6 flex items-center gap-2">
                  <CreditCard className="w-4 h-4" /> 02. Payment Details
                </h3>
                <div className="space-y-4 border border-border p-6">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-sm font-medium">Credit Card</span>
                    <div className="flex gap-2 opacity-50">
                      <div className="w-8 h-5 bg-foreground rounded-sm" />
                      <div className="w-8 h-5 bg-foreground rounded-sm" />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="card-number" className="sr-only">Card Number</label>
                    <input id="card-number" placeholder="Card Number" className="w-full bg-transparent border-b border-border py-3 focus:outline-none focus:border-primary" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="card-expiry" className="sr-only">MM / YY</label>
                      <input id="card-expiry" placeholder="MM / YY" className="w-full bg-transparent border-b border-border py-3 focus:outline-none focus:border-primary" />
                    </div>
                    <div>
                      <label htmlFor="card-cvv" className="sr-only">CVV</label>
                      <input id="card-cvv" placeholder="CVV" className="w-full bg-transparent border-b border-border py-3 focus:outline-none focus:border-primary" />
                    </div>
                  </div>
                </div>
              </div>

              <button className="w-full bg-primary text-white py-5 uppercase tracking-widest text-sm font-medium hover:bg-primary/90 transition-all flex items-center justify-center gap-3">
                <Lock className="w-4 h-4" />
                Complete Purchase — ${total.toFixed(2)}
              </button>
            </section>
          </div>

          {/* Order Summary Side */}
          <div className="lg:col-span-5">
            <div className="bg-muted p-8 lg:sticky lg:top-32">
              <h2 className="font-serif text-2xl mb-8">Order Summary</h2>
              <div className="space-y-6 mb-8">
                {cartItems.map(item => (
                  <div key={item.id} className="flex justify-between items-start gap-4">
                    <div className="flex gap-4">
                      <div className="w-16 h-20 bg-muted rounded-none"><img src={img1} alt="Product" className="w-full h-full object-cover" /></div>
                      <div>
                        <p className="font-serif text-lg leading-none mb-1">{item.name}</p>
                        <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <span className="text-sm font-medium">${item.price.toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-4 border-t border-border/50 pt-6">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground font-light">Subtotal</span>
                  <span className="font-medium">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground font-light">Shipping</span>
                  <span className="font-medium">${shipping.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-serif border-t border-border pt-4 mt-4">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>

              <div className="mt-8 space-y-4">
                <div className="flex items-center gap-3 text-muted-foreground">
                  <ShieldCheck className="w-4 h-4" />
                  <span className="text-[10px] uppercase tracking-widest font-bold">Secure SSL Encryption</span>
                </div>
                <p className="text-[10px] text-muted-foreground leading-relaxed uppercase tracking-widest">
                  By completing your order, you agree to our Terms of Service and Privacy Policy.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer className="py-12 border-t border-border/40 bg-accent">
        <div className="container mx-auto px-6 md:px-12 text-center">
          <p className="text-[10px] text-muted-foreground tracking-[0.2em] uppercase font-bold">
            © 2026 Turath Collective. All Rights Reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}
