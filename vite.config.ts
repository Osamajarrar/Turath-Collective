import { defineConfig, loadEnv, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import { metaImagesPlugin } from "./vite-plugin-meta-images";

/**
 * Inject GA4 into index.html with async loading and deferred initialization.
 * GA4 script is tagged as async and loaded after page interactive.
 * Uses Vite's native transformIndexHtml hook.
 */
function ga4Plugin(measurementId: string): Plugin {
  return {
    name: "vite-plugin-ga4",
    transformIndexHtml(html) {
      if (!measurementId) return html;
      // GA4 script is already async in gtag.js source
      // We just need to ensure it's injected properly
      const gaScript = [
        `<script async src="https://www.googletagmanager.com/gtag/js?id=${measurementId}"></script>`,
        `<script>`,
        `  window.dataLayer = window.dataLayer || [];`,
        `  function gtag(){dataLayer.push(arguments);}`,
        `  gtag('js', new Date());`,
        // Google Consent Mode v2 — deny everything by default (opt-in model,
        // PIPEDA / Quebec Law 25). gtag.js loads but sets no cookies and sends
        // no measurable hits until the consent banner flips analytics_storage
        // to 'granted'. See client/src/lib/consent.ts.
        `  gtag('consent', 'default', { analytics_storage: 'denied', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' });`,
        `  gtag('config', '${measurementId}', { 'anonymize_ip': true });`,
        `</script>`,
      ].join("\n    ");
      return html.replace(
        "<!-- GA4 injected here by Vite build when VITE_GA_MEASUREMENT_ID is set -->",
        `<!-- Google Analytics 4 -->\n    ${gaScript}`,
      );
    },
  };
}

// loadEnv with top-level call so viteConfig stays a plain object (not a function).
// server/vite.ts spreads `...viteConfig` directly — it must be a plain object.
const env = loadEnv(process.env.NODE_ENV ?? "development", process.cwd(), "VITE_");

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    metaImagesPlugin(),
    ga4Plugin(env.VITE_GA_MEASUREMENT_ID ?? ""),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  css: {
    postcss: {
      plugins: [],
    },
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks: {
          // Core vendor code (React, DOM, and essential utilities)
          vendor: [
            "react",
            "react-dom",
            "react-i18next",
            "wouter",
            "clsx",
            "tailwind-merge",
            "class-variance-authority",
          ],
          
          // Radix UI components (often unused, but all imported)
          radix: [
            "@radix-ui/react-accordion",
            "@radix-ui/react-alert-dialog",
            "@radix-ui/react-aspect-ratio",
            "@radix-ui/react-avatar",
            "@radix-ui/react-checkbox",
            "@radix-ui/react-collapsible",
            "@radix-ui/react-context-menu",
            "@radix-ui/react-dialog",
            "@radix-ui/react-dropdown-menu",
            "@radix-ui/react-hover-card",
            "@radix-ui/react-label",
            "@radix-ui/react-menubar",
            "@radix-ui/react-navigation-menu",
            "@radix-ui/react-popover",
            "@radix-ui/react-progress",
            "@radix-ui/react-radio-group",
            "@radix-ui/react-scroll-area",
            "@radix-ui/react-select",
            "@radix-ui/react-separator",
            "@radix-ui/react-slider",
            "@radix-ui/react-slot",
            "@radix-ui/react-switch",
            "@radix-ui/react-tabs",
            "@radix-ui/react-toast",
            "@radix-ui/react-toggle",
            "@radix-ui/react-toggle-group",
            "@radix-ui/react-tooltip",
          ],
          
          // Animation & UI libraries
          animation: ["framer-motion", "embla-carousel-react"],
          
          // Forms & validation
          forms: ["react-hook-form", "@hookform/resolvers", "zod", "zod-validation-error"],
          
          // Icon library (often large)
          icons: ["lucide-react"],
          
          // Data & utilities
          utils: ["date-fns", "@tanstack/react-query", "i18next", "sonner", "vaul"],
          
          // Shopify integration
          shopify: ["@shopify/storefront-api-client"],
          
          // Analytics are injected by Vite ga4Plugin via transformIndexHtml.
          // Do NOT add @vercel/analytics or @vercel/speed-insights here.
        },
      },
    },
  },
  server: {
    host: "0.0.0.0",
    allowedHosts: true,
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});
