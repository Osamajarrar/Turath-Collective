import { build as viteBuild } from "vite";
import { rm } from "fs/promises";
import { execFileSync } from "child_process";

/**
 * Build for Cloudflare Workers.
 *
 * The esbuild step that produced dist/index.cjs (a bundled Node Express
 * server) is gone: Wrangler bundles worker/index.ts itself, and that bundle
 * was never what production ran anyway — Vercel served dist/public statically
 * and executed api/*.ts as functions.
 *
 * client/public/_headers is generated from worker/security-headers.ts so the static
 * asset headers and the Worker's response headers cannot drift. Generating it
 * BEFORE the Vite build matters: Vite copies public/ into dist/public.
 */
async function buildAll() {
  await rm("dist", { recursive: true, force: true });

  console.log("generating client/public/_headers...");
  execFileSync("npx", ["tsx", "script/generate-headers.ts"], {
    stdio: "inherit",
    shell: process.platform === "win32",
  });

  console.log("building client...");
  await viteBuild();
}

buildAll().catch((err) => {
  console.error(err);
  process.exit(1);
});
