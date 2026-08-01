import { Switch, Route } from "wouter";
import { lazy, Suspense } from "react";
// GA4 is injected server-side via custom Vite plugin (transformIndexHtml).
// Do not add @vercel/analytics or @vercel/speed-insights — they are not installed.
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { CartProvider } from "@/context/cart-context";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import ScrollToTop from "@/components/scroll-to-top";
import CookieConsent from "@/components/cookie-consent";
import { COMING_SOON } from "@/lib/flags";

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

// Homepage design-variant previews (/design). Internal only: noindexed, not
// linked from the navbar or footer, and lazy-loaded so none of it reaches the
// main bundle. See client/src/design-variants/README.md.
const DesignGallery = lazy(() => import("@/design-variants/gallery"));
const DesignVariantPage = lazy(() => import("@/design-variants/VariantPage"));

function Router() {
  return (
    <>
      <ScrollToTop />
      <Switch>
        {COMING_SOON ? (
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
        {/* Design-variant previews — internal, remove with the gallery */}
        <Route path="/design" component={DesignGallery} />
        <Route path="/design/:variant" component={DesignVariantPage} />
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
          <Suspense fallback={null}>
            <Router />
          </Suspense>
          <CookieConsent />
        </TooltipProvider>
      </CartProvider>
    </QueryClientProvider>
  );
}

export default App;
