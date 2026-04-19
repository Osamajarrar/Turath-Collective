import { Switch, Route } from "wouter";
import { lazy } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { CartProvider } from "@/context/cart-context";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import ScrollToTop from "@/components/scroll-to-top";

// Dynamic imports for code splitting (pages load only when needed)
// Using default exports from each page file
const Home = lazy(() => import("@/pages/home"));
const ProductPage = lazy(() => import("@/pages/product"));
const ShopPage = lazy(() => import("@/pages/shop"));
const ContactPage = lazy(() => import("@/pages/contact"));
const ComingSoon = lazy(() => import("@/pages/coming-soon"));
const About = lazy(() => import("@/pages/about"));
const ShippingAndReturns = lazy(() => import("@/pages/ShippingAndReturns"));
const Care = lazy(() => import("@/pages/care"));
const FAQ = lazy(() => import("@/pages/faq"));
const PrivacyPolicy = lazy(() => import("@/pages/PrivacyPolicy"));
const TermsAndConditions = lazy(() => import("@/pages/TermsAndConditions"));
const NotFound = lazy(() => import("@/pages/not-found"));

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
        <Analytics />
        <SpeedInsights />
      </CartProvider>
    </QueryClientProvider>
  );
}

export default App;
