import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { CartProvider } from "@/context/cart-context";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import ProductPage from "@/pages/product";
import CheckoutPage from "@/pages/checkout";
import ShopPage from "@/pages/shop";
import ContactPage from "@/pages/contact";
import GenericPage from "@/pages/generic";
import ComingSoon from "@/pages/coming-soon";
import ScrollToTop from "@/components/scroll-to-top";

// Auth pages (login, signup, forgot-password) removed for launch v1.
// Shopify handles customer accounts. Re-add imports + routes when needed.

function Router() {
  return (
    <>
      <ScrollToTop />
      <Switch>
        {/* ── Coming Soon (active until launch) ──────────────────────────────
            To go live: change component={ComingSoon} → component={Home}
            Full site preview remains at /preview during development.
        ─────────────────────────────────────────────────────────────────── */}
        <Route path="/" component={ComingSoon} />

        {/* Full site preview — development only */}
        <Route path="/preview" component={Home} />

        <Route path="/shop" component={ShopPage} />
        <Route path="/contact" component={ContactPage} />
        <Route path="/product/:id" component={ProductPage} />
        <Route path="/checkout" component={CheckoutPage} />

        {/* Footer pages */}
        <Route path="/about">
          <GenericPage title="Our Story" />
        </Route>
        <Route path="/process">
          <GenericPage title="Artisan Process" />
        </Route>
        <Route path="/journal">
          <GenericPage title="The Journal" />
        </Route>
        <Route path="/shipping">
          <GenericPage title="Shipping & Returns" />
        </Route>
        <Route path="/care">
          <GenericPage title="Artisan Care Guide" />
        </Route>
        <Route path="/wholesale">
          <GenericPage title="Wholesale" />
        </Route>
        <Route path="/privacy">
          <GenericPage title="Privacy Policy" />
        </Route>
        <Route path="/terms">
          <GenericPage title="Terms of Service" />
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
      </CartProvider>
    </QueryClientProvider>
  );
}

export default App;
