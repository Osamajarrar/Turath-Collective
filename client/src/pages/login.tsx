import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";

export default function LoginPage() {
  const { loginMutation } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate({ email, password });
  };

  return (
    <main className="min-h-screen bg-[#FDFCFB] flex flex-col items-center justify-between relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-2 bg-primary" />
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />

      <header className="py-12 w-full flex justify-center z-20">
        <Link href="/">
          <div className="flex flex-col items-center cursor-pointer">
            <span className="font-serif text-3xl tracking-[0.2em] text-foreground">TURATH</span>
            <span className="text-[10px] uppercase tracking-[0.5em] text-primary font-bold mt-1">Collective</span>
          </div>
        </Link>
      </header>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white p-12 border border-border/50 shadow-2xl relative z-10 my-auto"
      >
        <div className="text-center mb-10">
          <h1 className="font-serif text-3xl mb-2">Welcome Back</h1>
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Login to your Turath account</p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit} data-testid="form-login">
          <div className="space-y-2">
            <Label className="text-[10px] uppercase tracking-widest font-bold opacity-50">Email Address</Label>
            <Input
              data-testid="input-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@example.com"
              className="rounded-none border-b border-t-0 border-l-0 border-r-0 focus-visible:ring-0 focus-visible:border-primary px-0 bg-transparent"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label className="text-[10px] uppercase tracking-widest font-bold opacity-50">Password</Label>
              <Link href="/forgot-password">
                <span className="text-[10px] uppercase tracking-widest text-primary hover:underline cursor-pointer">Forgot?</span>
              </Link>
            </div>
            <Input
              data-testid="input-password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="rounded-none border-b border-t-0 border-l-0 border-r-0 focus-visible:ring-0 focus-visible:border-primary px-0 bg-transparent"
            />
          </div>

          {loginMutation.error && (
            <p data-testid="error-login" className="text-sm text-red-600 font-medium">
              {loginMutation.error.message}
            </p>
          )}

          <Button
            data-testid="button-login"
            type="submit"
            disabled={loginMutation.isPending}
            className="w-full bg-primary hover:bg-primary/90 text-white rounded-none py-6 uppercase tracking-widest text-xs font-bold mt-4 shadow-lg shadow-primary/20"
          >
            {loginMutation.isPending ? "Signing in..." : "Sign In"}
          </Button>
        </form>

        <div className="mt-8 space-y-3">
          <div className="relative">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border" /></div>
            <div className="relative flex justify-center text-[10px] uppercase tracking-widest"><span className="bg-white px-2 text-muted-foreground font-bold">Or continue with</span></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" className="rounded-none py-6 border-border hover:bg-muted text-[10px] uppercase tracking-widest font-bold" disabled>Google</Button>
            <Button variant="outline" className="rounded-none py-6 border-border hover:bg-muted text-[10px] uppercase tracking-widest font-bold" disabled>Apple</Button>
          </div>
        </div>

        <div className="mt-10 pt-10 border-t border-border/50 text-center">
          <p className="text-sm text-muted-foreground mb-4 font-light">Don't have an account yet?</p>
          <Link href="/signup">
            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-primary hover:text-foreground cursor-pointer transition-colors border-b border-primary/20 pb-1">Create Account</span>
          </Link>
        </div>

        <div className="mt-8 text-center">
          <Link href="/">
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground cursor-pointer">Return to Store</span>
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
