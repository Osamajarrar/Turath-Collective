import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

// Deliberately standalone rather than merged with vite.config.ts:
//   - vite.config.ts sets `root: client/`, which would put server tests out of
//     scope, and server/ is where the Shopify proxy validation lives.
//   - it also installs the GA4 transformIndexHtml plugin and calls loadEnv;
//     neither is wanted in a test run, and the GA snippet has no meaning here.
// The alias map below must stay in sync with vite.config.ts.
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  // Mirrors vite.config.ts. Without it, importing any component whose module
  // graph reaches a *.module.css file makes Vite run the project's PostCSS,
  // and Tailwind v4 errors out because it expects @tailwindcss/postcss. Tests
  // never assert on styling, so no PostCSS plugins are wanted here.
  css: {
    postcss: { plugins: [] },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./test/setup.ts"],
    include: ["client/src/**/*.test.{ts,tsx}", "server/**/*.test.ts", "test/**/*.test.{ts,tsx}"],
    css: false,
  },
});
