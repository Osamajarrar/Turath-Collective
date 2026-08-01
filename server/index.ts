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
import { setupAuth } from "./auth";
import { shutdownPostHog } from "./posthog";

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
// NOTE: this only protects the Node/Express host. The Vercel deploy serves
// dist/public statically and runs api/*.ts as functions, so this middleware
// never executes there — the equivalent headers live in vercel.json and the
// two must be kept in sync.
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://www.googletagmanager.com", "https://www.google-analytics.com", "https://us-assets.i.posthog.com", "https://*.posthog.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      imgSrc: ["'self'", "https:", "data:"],
      // GA4 beacons go to *.google-analytics.com / *.analytics.google.com —
      // without these the gtag script loads but no event ever leaves the page.
      connectSrc: [
        "'self'",
        "https://api.shopify.com",
        "https://*.myshopify.com",
        "https://cdn.shopify.com",
        "https://www.google-analytics.com",
        "https://*.google-analytics.com",
        "https://*.analytics.google.com",
        "https://*.googletagmanager.com",
        "https://us.i.posthog.com",
        "https://us-assets.i.posthog.com",
        "https://*.posthog.com",
        // Sentry error reports are POSTed to <org>.ingest.sentry.io. Without
        // this the SDK initialises and then every report is blocked by CSP —
        // silently, with an empty dashboard that looks like "no errors".
        "https://*.ingest.sentry.io",
        "https://*.ingest.de.sentry.io",
        "https://*.ingest.us.sentry.io",
      ],
      frameSrc: ["'none'"],
      frameAncestors: ["'none'"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
    },
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

// Setup sessions + passport (must come before routes)
setupAuth(app);

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
