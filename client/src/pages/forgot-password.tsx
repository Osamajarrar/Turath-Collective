import { motion } from "framer-motion";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ForgotPasswordPage() {
  return (
    <main className="min-h-screen bg-[#FDFCFB] flex flex-col items-center justify-between relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-2 bg-primary" />
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />

      <header className="py-12 w-full flex justify-center z-20">
        <Link href="/">
          <div className="flex flex-col items-center cursor-pointer">
            <span className="font-serif text-3xl tracking-[0.2em] text-foreground">TURATH</span>
            <span className="text-[9px] uppercase tracking-[0.5em] text-primary font-bold mt-1">Collective</span>
          </div>
        </Link>
      </header>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white p-12 border border-border/50 shadow-2xl relative z-10 my-auto"
      >
        <div className="text-center mb-10">
          <h1 className="font-serif text-3xl mb-2">Reset Password</h1>
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">We'll email you a recovery link</p>
        </div>

        <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
          <div className="space-y-2">
            <Label className="text-[10px] uppercase tracking-widest font-bold opacity-50">Email Address</Label>
            <Input type="email" placeholder="email@example.com" className="rounded-none border-b border-t-0 border-l-0 border-r-0 focus-visible:ring-0 focus-visible:border-primary px-0 bg-transparent" />
          </div>

          <Button className="w-full bg-primary hover:bg-primary/90 text-white rounded-none py-6 uppercase tracking-widest text-xs font-bold mt-4 shadow-lg shadow-primary/20">
            Send Recovery Link
          </Button>
        </form>

        <div className="mt-8 text-center">
          <Link href="/login">
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground cursor-pointer">Back to Login</span>
          </Link>
        </div>
      </motion.div>

      <footer className="py-12 w-full text-center z-20">
        <p className="text-[9px] text-muted-foreground tracking-[0.2em] uppercase font-bold">
          © 2026 Turath Collective. All Rights Reserved.
        </p>
      </footer>
    </main>
  );
}
