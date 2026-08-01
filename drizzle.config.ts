import { defineConfig } from "drizzle-kit";

/**
 * D1 (Cloudflare SQLite).
 *
 * NO DATABASE IS PROVISIONED and no table exists — every table in
 * shared/schema.ts is still commented out. The dialect is set now because
 * converting it costs nothing while nothing depends on it, and is genuinely
 * annoying to do later with live rows. See DECISIONS.md §3.
 *
 * The DATABASE_URL guard is gone: it threw on import, which made every
 * drizzle-kit invocation fail for a Postgres database that does not exist and
 * is no longer the target.
 *
 * When reviews/favourites actually arrive: `wrangler d1 create`, add the
 * binding to wrangler.toml, then fill in dbCredentials here.
 */
export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "sqlite",
});
