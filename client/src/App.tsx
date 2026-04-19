import { Switch, Route } from "wouter";
import { lazy, Suspense } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { CartProvider } from "@/context/cart-context";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import ScrollToTop from "@/components/scroll-to-top";

// Analytics are deferred until after initial render
// Using lazy + Suspense with no fallback = loads in background
const Analytics = lazy(() => import("@vercel/analytics/react").then(m => ({ default: m.Analytics })));
const SpeedInsights = lazy(() => import("@vercel/speed-insights/react").then(m => ({ default: m.SpeedInsights })));

// Critical pages loaded eagerly for fast initial load
import Home from "@/pages/home";
import ProductPage from "@/pages/product";
import ShopPage from "@/pages/shop";
import ComingSoon from "@/pages/coming-soon";
import NotFound from "@/pages/not-found";

// Secondary pages lazy-loaded (less critical for initial render)
const ContactPage = lazy(() => import("@/pages/contact"));
const About = lazy(() => import("@/pages/about"));
const ShippingAndReturns = lazy(() => import("@/pages/ShippingAndReturns"));
const Care = lazy(() => import("@/pages/care"));
const FAQ = lazy(() => import("@/pages/faq"));
const PrivacyPolicy = lazy(() => import("@/pages/PrivacyPolicy"));
const TermsAndConditions = lazy(() => import("@/pages/TermsAndConditions"));

// Auth pages (login, signup, forgot-password) removed for launch v1.
// Shopify handles customer accounts. Re-add imports + routes when needed.

function Router() {
  return (
    <>
      <ScrollToTop />
      <Switch>
        {import.meta.env.VITE_COMING_SOON === "true" ? (
          <Route path="/" component={ComingSoon} />
        ) : (
          <Route path="/" component={Home} />
        )}
        <Route path="/shop" component={ShopPage} />
        <Route path="/contact" component={ContactPage} />
        <Route path="/product/:id" component={ProductPage} />
        {/* Footer pages */}
        <Route path="/about" component={About} />
        <Route path="/shipping" component={ShippingAndReturns} />
        <Route path="/care" component={Care} />
        <Route path="/faq" component={FAQ} />
        <Route path="/privacy" component={PrivacyPolicy} />
        <Route path="/terms" component={TermsAndConditions} />
        <Route component={NotFound} />
      </Switch>
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <CartProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
        {/* Analytics deferred: Load after critical rendering complete */}
        <Suspense fallback={null}>
          <Analytics />
          <SpeedInsights />
        </Suspense>
      </CartProvider>
    </QueryClientProvider>
  );
}

export default App;
