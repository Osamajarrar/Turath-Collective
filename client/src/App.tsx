import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { CartProvider } from "@/context/cart-context";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import ProductPage from "@/pages/product";
import ShopPage from "@/pages/shop";
import ContactPage from "@/pages/contact";
import ScrollToTop from "@/components/scroll-to-top";
import ComingSoon from "@/pages/coming-soon";
import About from "./pages/about";
import ShippingAndReturns from "./pages/ShippingAndReturns";
import Care from "./pages/care";
import FAQ from "./pages/faq";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsAndConditions from "./pages/TermsAndConditions";

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
        <Route path="/about">
          <About />
        </Route>
        {/* <Route path="/process">
          <GenericPage title="Artisan Process" />
        </Route> */}
        {/* <Route path="/journal">
          <GenericPage title="The Journal" />
        </Route> */}
        <Route path="/shipping">
          <ShippingAndReturns />
        </Route>
        <Route path="/care">
          <Care />
        </Route>
        <Route path="/faq">
          <FAQ />
        </Route>
        {/* <Route path="/wholesale">
          <GenericPage title="Wholesale" />
        </Route> */}
        <Route path="/privacy">
          <PrivacyPolicy />
        </Route>
        <Route path="/terms">
          <TermsAndConditions />
        </Route>
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
