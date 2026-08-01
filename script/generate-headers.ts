/**
 * Generate client/public/_headers from worker/security-headers.ts.
 *
 * Cloudflare applies _headers to STATIC ASSET responses; the Worker applies
 * the same set to API responses via middleware. Generating one from the other
 * is what makes "one CSP source of truth" actually true instead of aspirational
 * — the vercel.json ↔ server/index.ts split was kept in sync by hand, and a
 * missing origin fails silently in the browser.
 *
 * Runs automatically as part of `npm run build`.
 */
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { SECURITY_HEADERS, CACHE_RULES } from "../worker/security-headers";

const BANNER = `# GENERATED FILE — DO NOT EDIT.
# Source: worker/security-headers.ts. Regenerate with \`npm run headers\`.
# Editing this file by hand re-creates the drift the migration removed.
`;

async function generate() {
  const lines: string[] = [BANNER];

  lines.push("/*");
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    lines.push(`  ${key}: ${value}`);
  }
  lines.push("");

  for (const rule of CACHE_RULES) {
    lines.push(rule.pattern);
    lines.push(`  Cache-Control: ${rule.value}`);
    lines.push("");
  }

  const out = path.resolve(import.meta.dirname, "..", "client", "public", "_headers");
  await mkdir(path.dirname(out), { recursive: true });
  await writeFile(out, lines.join("\n"), "utf8");
  console.log(`wrote ${out}`);
}

generate().catch((err) => {
  console.error(err);
  process.exit(1);
});
