import { motion } from "framer-motion";
import { ChevronLeft, CreditCard, Apple, Truck, ShieldCheck, Lock } from "lucide-react";
import { Link } from "wouter";
import Navbar from "@/components/navbar";

export default function CheckoutPage() {
  const cartItems = [
    { id: 1, name: "Classic Indigo Mug", price: 38.00, quantity: 1 },
    { id: 2, name: "Burgundy Hand-Painted Bowl", price: 52.00, quantity: 1 }
  ];

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const shipping = 15.00;
  const total = subtotal + shipping;

  return (
    <main className="min-h-screen bg-background pt-24 pb-12 font-sans">
      <Navbar />
      
      <div className="container mx-auto px-6 md:px-12">
        <Link href="/">
          <button className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors mb-8 group">
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Bag
          </button>
        </Link>

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
                  <input placeholder="First Name" className="col-span-1 bg-transparent border-b border-border py-3 focus:outline-none focus:border-primary" />
                  <input placeholder="Last Name" className="col-span-1 bg-transparent border-b border-border py-3 focus:outline-none focus:border-primary" />
                  <input placeholder="Address" className="col-span-2 bg-transparent border-b border-border py-3 focus:outline-none focus:border-primary" />
                  <input placeholder="Apartment, suite, etc. (optional)" className="col-span-2 bg-transparent border-b border-border py-3 focus:outline-none focus:border-primary" />
                  <input placeholder="City" className="col-span-1 bg-transparent border-b border-border py-3 focus:outline-none focus:border-primary" />
                  <input placeholder="Postal Code" className="col-span-1 bg-transparent border-b border-border py-3 focus:outline-none focus:border-primary" />
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
                  <input placeholder="Card Number" className="w-full bg-transparent border-b border-border py-3 focus:outline-none focus:border-primary" />
                  <div className="grid grid-cols-2 gap-4">
                    <input placeholder="MM / YY" className="bg-transparent border-b border-border py-3 focus:outline-none focus:border-primary" />
                    <input placeholder="CVV" className="bg-transparent border-b border-border py-3 focus:outline-none focus:border-primary" />
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
            <div className="bg-[#F4F2EE] p-8 lg:sticky lg:top-32">
              <h2 className="font-serif text-2xl mb-8">Order Summary</h2>
              <div className="space-y-6 mb-8">
                {cartItems.map(item => (
                  <div key={item.id} className="flex justify-between items-start gap-4">
                    <div className="flex gap-4">
                      <div className="w-16 h-20 bg-muted rounded-none" />
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
    </main>
  );
}
