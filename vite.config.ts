import { defineConfig, loadEnv, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
import { metaImagesPlugin } from "./vite-plugin-meta-images";

/**
 * Vite plugin that injects the GA4 script into index.html at build/serve time,
 * but only when VITE_GA_MEASUREMENT_ID is set. No-op otherwise.
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
        `<!-- Google Analytics 4 -->\n    ${gaScript}`
      );
    },
  };
}

export default defineConfig(async ({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "VITE_");

  return {
    plugins: [
      react(),
      runtimeErrorOverlay(),
      tailwindcss(),
      metaImagesPlugin(),
      ga4Plugin(env.VITE_GA_MEASUREMENT_ID || ""),
      ...(process.env.NODE_ENV !== "production" &&
      process.env.REPL_ID !== undefined
        ? [
            await import("@replit/vite-plugin-cartographer").then((m) =>
              m.cartographer(),
            ),
            await import("@replit/vite-plugin-dev-banner").then((m) =>
              m.devBanner(),
            ),
          ]
        : []),
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
  };
});
