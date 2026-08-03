import dotenv from "dotenv";
import path from "path";

// Resolve env files from the project root, i.e. the directory npm runs these
// scripts from. Deliberately NOT import.meta.url: the production bundle is
// emitted as CJS, where esbuild replaces `import.meta` with `{}` — the old
// `fileURLToPath(import.meta.url)` threw on the very first line of
// `npm start`, so the built server could never boot.
const projectRoot = process.cwd();

// Load .env.local first (dev override), then .env (defaults)
dotenv.config({ path: path.join(projectRoot, ".env.local") });
dotenv.config({ path: path.join(projectRoot, ".env") });

import express, { type Request, Response, NextFunction } from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";
import { createServer } from "http";
import { shutdownPostHog } from "./posthog";
import { cspDirectivesForHelmet } from "../worker/security-headers";

const app = express();
const httpServer = createServer(app);

// Trust the first proxy hop (Replit's reverse proxy / X-Forwarded-For)
// Required for express-rate-limit to identify clients correctly
app.set("trust proxy", 1);

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

// ── Security Headers ─────────────────────────────────────────────────────
// This only protects the local Node/Express host — `server/` ships nowhere.
// The directives come from worker/security-headers.ts, the single source of
// truth, so the policy you debug locally is the policy production serves.
// Add origins THERE, never here.
app.use(helmet({
  contentSecurityPolicy: {
    directives: cspDirectivesForHelmet({
      // DEV ONLY, and deliberately absent from the shared policy: Vite's HMR
      // client spawns a SharedWorker from a blob: URL to ping the dev server
      // back after a dropped socket (vite/dist/client/client.mjs). Nothing the
      // site actually ships uses a Worker, so production must NOT allow blob:
      // — it would widen the XSS surface for a dev-only convenience.
      "worker-src": ["'self'", "blob:"],
    }),
  },
  referrerPolicy: { policy: "strict-origin-when-cross-origin" },
  // Match the CSP frame-ancestors above for pre-CSP browsers (helmet's
  // default is SAMEORIGIN, which would disagree with it).
  frameguard: { action: "deny" },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
}));

// ── Request Parsing ──────────────────────────────────────────────────────
app.use(
  express.json({
    limit: '10kb',
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);

app.use(express.urlencoded({ extended: false, limit: '10kb' }));

// ── Rate Limiting ────────────────────────────────────────────────────────
export const shopifyLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: "Too many Shopify API requests, please try again later",
  standardHeaders: true,
  legacyHeaders: false,
});

// Sessions and passport are gone. Shopify's Customer Account API owns
// accounts, and express-session needs per-request server memory that Cloudflare
// Workers does not have. See DECISIONS.md §4 and plan 10 phase 6b.

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

// ── Logging Middleware ──────────────────────────────────────────────────
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      // Don't log response bodies for routes that return user PII or auth state.
      const isSensitive = path.startsWith("/api/auth") || path === "/api/me";
      if (capturedJsonResponse && !isSensitive) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  await registerRoutes(httpServer, app);

  app.use((err: any, _req: Request, res: Response, next: NextFunction) => {
    const status = err.status || err.statusCode || 500;

    console.error("Internal Server Error:", err);

    if (res.headersSent) {
      return next(err);
    }

    // Never surface internal error text (stack hints, driver/DSN details) to
    // clients on 5xx. 4xx messages are ours and safe to pass through.
    const message =
      status >= 500 ? "Internal Server Error" : err.message || "Request failed";

    return res.status(status).json({ message });
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (process.env.NODE_ENV === "production") {
    serveStatic(app);
  } else {
    const { setupVite } = await import("./vite");
    await setupVite(httpServer, app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || "5000", 10);
  const host = process.env.NODE_ENV === "production" ? "0.0.0.0" : "127.0.0.1";
  httpServer.listen(
    {
      port,
      host,
    },
    () => {
      log(`serving on http://${host}:${port}`);
    },
  );

  for (const sig of ["SIGTERM", "SIGINT"]) {
    process.once(sig, async () => {
      await shutdownPostHog();
      process.exit(0);
    });
  }
})();
