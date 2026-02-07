import { motion } from "framer-motion";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white p-12 border border-border shadow-sm"
      >
        <div className="text-center mb-10">
          <h1 className="font-serif text-3xl mb-2">Welcome Back</h1>
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Login to your Turath account</p>
        </div>

        <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
          <div className="space-y-2">
            <Label className="text-[10px] uppercase tracking-widest font-bold opacity-50">Email Address</Label>
            <Input type="email" placeholder="email@example.com" className="rounded-none border-b border-t-0 border-l-0 border-r-0 focus-visible:ring-0 focus-visible:border-primary px-0" />
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label className="text-[10px] uppercase tracking-widest font-bold opacity-50">Password</Label>
              <a href="#" className="text-[9px] uppercase tracking-widest text-primary hover:underline">Forgot?</a>
            </div>
            <Input type="password" placeholder="••••••••" className="rounded-none border-b border-t-0 border-l-0 border-r-0 focus-visible:ring-0 focus-visible:border-primary px-0" />
          </div>

          <Button className="w-full bg-primary hover:bg-primary/90 text-white rounded-none py-6 uppercase tracking-widest text-xs font-bold mt-4">
            Sign In
          </Button>
        </form>

        <div className="mt-10 pt-10 border-t border-border text-center">
          <p className="text-sm text-muted-foreground mb-4 font-light">Don't have an account yet?</p>
          <Link href="/signup">
            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-primary hover:text-foreground cursor-pointer transition-colors">Create Account</span>
          </Link>
        </div>

        <div className="mt-8 text-center">
          <Link href="/">
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground cursor-pointer">Return to Store</span>
          </Link>
        </div>
      </motion.div>
    </main>
  );
}
