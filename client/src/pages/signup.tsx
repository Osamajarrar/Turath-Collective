import { motion } from "framer-motion";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SignupPage() {
  return (
    <main className="min-h-screen bg-[#FDFCFB] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Brand Accents */}
      <div className="absolute top-0 left-0 w-full h-2 bg-primary" />
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white p-12 border border-border/50 shadow-2xl relative z-10"
      >
        <div className="text-center mb-10">
          <Link href="/">
            <span className="font-serif text-2xl tracking-[0.2em] mb-4 block cursor-pointer">TURATH</span>
          </Link>
          <h1 className="font-serif text-3xl mb-2">Join the Collective</h1>
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Create your heritage account</p>
        </div>

        <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[10px] uppercase tracking-widest font-bold opacity-50">First Name</Label>
              <Input placeholder="Layla" className="rounded-none border-b border-t-0 border-l-0 border-r-0 focus-visible:ring-0 focus-visible:border-primary px-0 bg-transparent" />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] uppercase tracking-widest font-bold opacity-50">Last Name</Label>
              <Input placeholder="Sami" className="rounded-none border-b border-t-0 border-l-0 border-r-0 focus-visible:ring-0 focus-visible:border-primary px-0 bg-transparent" />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] uppercase tracking-widest font-bold opacity-50">Email Address</Label>
            <Input type="email" placeholder="email@example.com" className="rounded-none border-b border-t-0 border-l-0 border-r-0 focus-visible:ring-0 focus-visible:border-primary px-0 bg-transparent" />
          </div>
          
          <div className="space-y-2">
            <Label className="text-[10px] uppercase tracking-widest font-bold opacity-50">Password</Label>
            <Input type="password" placeholder="••••••••" className="rounded-none border-b border-t-0 border-l-0 border-r-0 focus-visible:ring-0 focus-visible:border-primary px-0 bg-transparent" />
          </div>

          <div className="flex items-start gap-3 py-2">
            <input type="checkbox" id="terms" className="mt-1 accent-primary" />
            <label htmlFor="terms" className="text-[10px] text-muted-foreground leading-relaxed">
              I agree to the Terms of Service and Privacy Policy, and wish to receive updates from the collective.
            </label>
          </div>

          <Button className="w-full bg-primary hover:bg-primary/90 text-white rounded-none py-6 uppercase tracking-widest text-xs font-bold mt-4 shadow-lg shadow-primary/20">
            Create Account
          </Button>
        </form>

        <div className="mt-10 pt-10 border-t border-border/50 text-center">
          <p className="text-sm text-muted-foreground mb-4 font-light">Already part of the collective?</p>
          <Link href="/login">
            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-primary hover:text-foreground cursor-pointer transition-colors border-b border-primary/20 pb-1">Sign In Instead</span>
          </Link>
        </div>
      </motion.div>
    </main>
  );
}
