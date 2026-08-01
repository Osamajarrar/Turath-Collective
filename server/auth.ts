import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcryptjs";
import type { Express } from "express";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import { Pool } from "pg";
import { storage } from "./storage";

declare global {
  namespace Express {
    interface User {
      id: string;
      email: string;
      firstName: string | null;
      lastName: string | null;
    }
  }
}

export function setupAuth(app: Express) {
  const sessionSecret = process.env.SESSION_SECRET;
  if (!sessionSecret && process.env.NODE_ENV === "production") {
    throw new Error("SESSION_SECRET environment variable must be set in production");
  }

  // Auth is deferred (AUTH_ENABLED=false in routes.ts) and the DB is not
  // provisioned, so DATABASE_URL is normally unset. Only build the Postgres
  // session store when there is actually a DSN — otherwise pg opens a pool
  // against an undefined connection string and connect-pg-simple retries a
  // CREATE TABLE against it on every request. Fall back to the default
  // in-memory store, which is fine while nothing signs in.
  const databaseUrl = process.env.DATABASE_URL;
  let store: session.Store | undefined;
  if (databaseUrl) {
    const PgSession = connectPgSimple(session);
    store = new PgSession({
      pool: new Pool({ connectionString: databaseUrl }),
      createTableIfMissing: true,
    });
  } else if (process.env.NODE_ENV === "production") {
    // Not fatal today: auth is off, so no session is ever written. It becomes
    // fatal the moment AUTH_ENABLED flips on — the in-memory store loses every
    // session on restart and leaks across instances.
    console.warn(
      "[auth] DATABASE_URL is not set — sessions would use the in-memory store. Set it before enabling AUTH_ENABLED.",
    );
  }

  app.use(
    session({
      store,
      secret: sessionSecret || "turath-dev-secret-change-in-prod",
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        sameSite: "lax",
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      },
    })
  );

  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy({ usernameField: "email" }, async (email, password, done) => {
      try {
        const user = await storage.getUserByEmail(email);
        if (!user || !user.passwordHash) return done(null, false, { message: "Invalid email or password" });
        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return done(null, false, { message: "Invalid email or password" });
        return done(null, { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName });
      } catch (e) {
        return done(e);
      }
    })
  );

  passport.serializeUser((user, done) => done(null, user.id));

  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await storage.getUser(id);
      if (!user) return done(null, false);
      done(null, { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName });
    } catch (e) {
      done(e);
    }
  });
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}
