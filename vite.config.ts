import { defineConfig, loadEnv, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import { metaImagesPlugin } from "./vite-plugin-meta-images";

/**
 * Inject GA4 into index.html only when VITE_GA_MEASUREMENT_ID is set.
 * Uses Vite's native transformIndexHtml hook — no vite-plugin-html needed.
 */
function ga4Plugin(measurementId: string): Plugin {
  return {
    name: "vite-plugin-ga4",
    transformIndexHtml(html) {
      if (!measurementId) return html;
      const gaScript = [
        `<script async src="https://www.googletagmanager.com/gtag/js?id=${measurementId}"></script>`,
        `<script>`,
        `  window.dataLayer = window.dataLayer || [];`,
        `  function gtag(){dataLayer.push(arguments);}`,
        `  gtag('js', new Date());`,
        `  gtag('config', '${measurementId}');`,
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
