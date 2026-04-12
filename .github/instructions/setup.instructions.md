---
name: Project Setup & Build Configuration
description: "Use when: setting up the development environment, debugging build issues, configuring dependencies, or deploying the project."
---

# Project Setup & Build Configuration

## Development Environment

### Prerequisites
- **Node.js**: v18+ (check with `node --version`)
- **npm**: v9+ (check with `npm --version`)
- **Git**: For version control

### Initial Setup

```bash
# Clone the repository (if not already done)
git clone <repository-url>
cd Turath-Collective

# Install dependencies
npm install

# Start development server
npm run dev
```

### Available Commands

| Command | Purpose | Notes |
|---------|---------|-------|
| `npm run dev` | Start Vite dev server with hot reload | Frontend runs on http://localhost:5173 |
| `npm run build` | Build for production (frontend + backend) | Creates optimized bundles |
| `npm run preview` | Preview production build locally | Useful for testing optimized assets |
| `npm run type-check` | Run TypeScript type checking | Catches type errors without building |
| `npm run lint` | Run ESLint (if configured) | Checks code style |

### Folder Structure for Build

```
client/                    # Frontend (React, Vite, TypeScript)
├── src/
│   ├── main.tsx          # React entry point
│   ├── App.tsx           # Root component
│   ├── index.css         # Global styles + Tailwind directives
│   └── ... components, pages, hooks, etc.
├── public/               # Static assets (stays as-is)
├── package.json          # Frontend dependencies
├── vite.config.ts        # Vite build configuration
└── tsconfig.json         # TypeScript configuration

server/                    # Backend (Node.js, Express)
├── index.ts              # Express server entry
├── routes.ts             # API endpoint definitions
├── db.ts                 # Drizzle ORM + database setup
├── auth.ts               # Authentication logic (JWT, sessions)
├── email.ts              # Email service integration
└── ... other endpoints

shared/                    # Shared types & schemas
├── schema.ts             # TypeScript types used by both client & server

root/
├── vite.config.ts        # Vite configuration (unified for both apps)
├── drizzle.config.ts     # Drizzle ORM migrations config
├── tsconfig.json         # Root TypeScript settings
├── package.json          # Root dependencies + workspaces/scripts
└── .env.local            # Local environment variables (git ignored)
```

## Web Bundling (Vite)

### Vite Configuration
Located at `vite.config.ts`. Key settings:

```typescript
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "dist",           // Output directory
    sourcemap: false,         // Production builds exclude sourcemaps
  },
  server: {
    port: 5173,              // Dev server port
    proxy: {                 // Proxy API calls during dev
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
    },
  },
});
```

### CSS Processing
- **Tailwind CSS v4**: Compiled from `client/src/index.css`
- **PostCSS**: Processes CSS variables and prefixes
- **Autoprefixer**: Adds vendor prefixes automatically

## Database (Drizzle ORM)

### Configuration
Located at `drizzle.config.ts`. Usually points to:
- **SQLite** (development): Uses local file database
- **PostgreSQL** (production): Points to production database via `DATABASE_URL`

### Migration Workflow

```bash
# Generate migration from schema changes
npm run db:generate

# Run pending migrations
npm run db:migrate

# Push all migrations to database
npm run db:push
```

### Database Schema
Located at `shared/schema.ts` (or `server/db.ts` depending on setup). Defines tables using Drizzle ORM:

```typescript
import { drizzle } from "drizzle-orm/node-postgres";
import { text, integer, timestamp, pgTable } from "drizzle-orm/pg-core";

const users = pgTable("users", {
  id: text().primaryKey(),
  email: text().notNull().unique(),
  name: text(),
  createdAt: timestamp().defaultNow(),
});

export const db = drizzle(process.env.DATABASE_URL);
```

## Server (Express)

### Server Entry Point
Located at `server/index.ts`. Typical setup:

```typescript
import express from "express";
import routes from "./routes";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use("/api", routes);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
```

### API Routes
Located at `server/routes.ts`. Organize endpoints by domain:

```typescript
import express from "express";
import { getProducts, getProduct } from "./handlers/products";
import { createOrder } from "./handlers/orders";

const router = express.Router();

// Products
router.get("/products", getProducts);
router.get("/products/:id", getProduct);

// Orders
router.post("/orders", createOrder);

export default router;
```

### Environment Variables
Create `.env.local` in the project root:

```env
# Server
PORT=3000
NODE_ENV=development

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/turath_db

# Shopify
SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
SHOPIFY_API_KEY=your_api_key
SHOPIFY_API_SECRET=your_api_secret

# Email Service
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Auth
JWT_SECRET=your_jwt_secret_key
```

**Important**: Never commit `.env.local` (it's in `.gitignore`).

## Shopify Integration

### Setup
1. Create a Shopify app in your store's admin
2. Get API credentials (API key, API secret, access token)
3. Add to `.env.local`:
   ```env
   SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
   SHOPIFY_API_KEY=your_api_key
   SHOPIFY_API_SECRET=your_api_secret
   ```

### Using Shopify API
Located at `client/src/lib/shopify.ts`:

```typescript
import shopifyClient from "@/lib/shopify";

// Fetch products
const products = await shopifyClient.getProducts();

// Fetch product by ID
const product = await shopifyClient.getProduct(productId);

// Fetch collections
const collections = await shopifyClient.getCollections();
```

## i18n (Internationalization)

### Locales Folder
Located at `client/src/locales/`:

```
locales/
├── en/
│   ├── common.json       # Shared keys (navbar, footer, etc.)
│   ├── products.json     # Product-specific strings
│   └── ... other domains
├── fr/
│   ├── common.json
│   ├── products.json
│   └── ...
└── ar/
    ├── common.json
    ├── products.json
    └── ...
```

### i18n Configuration
Located at `client/src/lib/i18n.ts`:

```typescript
import i18n from "i18next";
import enCommon from "@/locales/en/common.json";
import frCommon from "@/locales/fr/common.json";
import arCommon from "@/locales/ar/common.json";

i18n.init({
  resources: {
    en: { common: enCommon },
    fr: { common: frCommon },
    ar: { common: arCommon },
  },
  lng: "en",
  defaultNS: "common",
  interpolation: { escapeValue: false },
});
```

### Using Translations
```tsx
import { useTranslation } from "react-i18next";

export default function MyComponent() {
  const { t, i18n } = useTranslation();

  return (
    <>
      <h1>{t("common.title")}</h1>
      <button onClick={() => i18n.changeLanguage("fr")}>
        Switch to French
      </button>
    </>
  );
}
```

## Deployment

### Frontend (Vercel)
1. Push code to GitHub
2. Connect GitHub repository to Vercel
3. Vercel auto-detects Vite and configures build settings
4. Deploys to https://your-domain.vercel.app

**Config**: `vercel.json` at project root (if needed for overrides)

### Backend (Custom Node.js Server)
1. Deploy to cloud platform (Heroku, Railway, DigitalOcean, etc.)
2. Set environment variables on the platform
3. Server listens on `process.env.PORT` (usually 3000)
4. Point frontend API calls to backend domain

### Environment Variables for Production
Add to your hosting platform's environment config:
- `DATABASE_URL` (production database)
- `JWT_SECRET` (secure random string)
- `SHOPIFY_*` keys
- `SMTP_*` credentials

## Troubleshooting

### Build Fails
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Type Errors
```bash
# Run type checking to see all errors
npm run type-check
```

### Server Won't Start
```bash
# Check if port is in use
# Windows: netstat -ano | findstr :<PORT>
# Mac/Linux: lsof -i :<PORT>

# Kill the process using the port and try again
```

### Database Connection Issues
1. Verify `DATABASE_URL` in `.env.local`
2. Check database credentials are correct
3. Ensure database server is running
4. Run migrations: `npm run db:push`

## When to Update This File

When you:
- Add new build commands
- Change environment variables
- Update deployment process
- Fix configuration issues
- Add new services or integrations

Update this file with the changes and any lessons learned.
