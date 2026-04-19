# Deployment Guide

## Overview

Turath Collective deploys to **Vercel** with **Vercel Functions** for serverless API proxying:

- **Frontend:** React app deployed to Vercel's CDN
- **Backend:** Single `/api/shopify` Vercel Function that proxies to Shopify
- **Database:** None (v1 — auth/contact features use Shopify instead)

---

## Prerequisites

1. **Vercel Account** — https://vercel.com
2. **Shopify Store** — https://shopify.com
3. **Shopify App** — Private app with Storefront API access (see [SHOPIFY_SETUP.md](../SHOPIFY_SETUP.md))

---

## Initial Deployment Setup

### Step 1: Connect Vercel to GitHub

1. Go to https://vercel.com/new
2. Select "Import Git Repository"
3. Authorize Vercel with your GitHub account
4. Import the Turath Collective repository

### Step 2: Configure Environment Variables

In your Vercel project settings, add:

**Production:**
```
SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
SHOPIFY_STOREFRONT_TOKEN=shpat_xxxxxxxxxxxxxxxxxxxxx
VITE_SHOPIFY_MODE=live
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX (optional)
```

**Preview (Optional):**
```
SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
SHOPIFY_STOREFRONT_TOKEN=shpat_xxxxxxxxxxxxxxxxxxxxx
VITE_SHOPIFY_MODE=mock
```

**Environment Variables Reference:**

| Variable | Required | Default | Notes |
|----------|----------|---------|-------|
| `SHOPIFY_STORE_DOMAIN` | ✅ Production only | — | Format: `mystore.myshopify.com` (no `https://`) |
| `SHOPIFY_STOREFRONT_TOKEN` | ✅ Production only | — | Get from Shopify Private App settings |
| `VITE_SHOPIFY_MODE` | ❌ | `"mock"` | `"live"` (fail on error) or `"mock"` (fallback to mock data) |
| `VITE_GA_MEASUREMENT_ID` | ❌ | — | Google Analytics 4 ID (e.g., `G-XXXXXXXXXX`) |
| `DATABASE_URL` | ❌ | — | Only needed if implementing custom backend (v2+) |

### Step 3: Deploy

Vercel automatically deploys when you push to `main`:

```bash
git push origin main
```

Visit your Vercel deployment URL to verify the site loads.

---

## Vercel Functions Configuration

The `/api/shopify` Vercel Function is configured via `vercel.json`:

```json
{
  "functions": {
    "api/shopify.ts": {
      "runtime": "nodejs20.x",
      "memory": 512,
      "maxDuration": 30
    }
  }
}
```

This configuration:
- Uses Node.js 20 runtime
- Allocates 512 MB memory
- Times out after 30 seconds

No manual configuration needed — Vercel auto-detects `api/*.ts` files.

---

## Local Development

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Local Environment

Create `.env.local` with your **development** Shopify credentials:

```env
SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
SHOPIFY_STOREFRONT_TOKEN=shpat_xxxxxxxxxxxxxxxxxxxxx
VITE_SHOPIFY_MODE=mock
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX (optional)
```

### 3. Start Development Server

```bash
npm run dev
```

This starts:
- Vite dev server (port 5173)
- `/api/shopify` Vercel Function locally via `vercel dev`

Visit `http://localhost:5173` and start developing.

---

## Build & Preview

### Build for Production

```bash
npm run build
```

Outputs:
- `dist/public/` — React app build
- `dist/index.cjs` — Vercel Function bundle

### Preview Build Locally

```bash
vercel build
vercel start
```

This runs your production build locally on `http://localhost:3000`.

---

## Deployment Modes

### Mode: "live" (Production)

- ✅ Shopify is required
- ❌ No mock fallback
- Throws errors if Shopify is misconfigured
- Ensures data is always fresh from Shopify Admin

**When to use:**
- Production environment (`vercel.com`)
- Staging with real Shopify data

### Mode: "mock" (Development)

- ✅ Works without Shopify credentials
- ✅ Silently falls back to mock data
- Safe for development and testing
- Allows CI/CD to pass without secrets

**When to use:**
- Local development (default)
- Preview deployments
- Testing without live Shopify data

---

## Updating Shopify Credentials

To update Shopify Store Domain or Storefront Token:

1. Go to https://vercel.com/dashboard
2. Select your project → Settings → Environment Variables
3. Update `SHOPIFY_STORE_DOMAIN` and/or `SHOPIFY_STOREFRONT_TOKEN`
4. Vercel redeploys automatically
5. Verify at your deployment URL

---

## Monitoring & Logs

### View Deployment Logs

1. Go to https://vercel.com/dashboard
2. Select your project → Deployments
3. Click a deployment → View Logs

### Function Logs

Monitor `/api/shopify` execution:

```bash
vercel logs --function api/shopify
```

### Error Tracking

Use Vercel's built-in monitoring or integrate Sentry:

```bash
npm install @sentry/nextjs
```

---

## Rollback

If a deployment breaks production:

1. Go to https://vercel.com/dashboard
2. Select your project → Deployments
3. Find the previous working deployment
4. Click "..." → Promote to Production

---

## Performance Tips

### 1. Enable Caching Headers

Images from Shopify CDN are cached long-term. Verify in DevTools Network tab.

### 2. Use Responsive Images

The `responsiveImage()` utility generates optimized URLs for different screen sizes.

### 3. Monitor Bundle Size

After each deployment, check Vercel's analytics:

1. Go to Vercel dashboard → your project
2. Analytics tab → Real Experience Monitoring

---

## Common Issues

### Deployment Fails: Missing Environment Variable

**Error:** `Error: Cannot find SHOPIFY_STORE_DOMAIN`

**Solution:**
1. Go to Vercel project → Settings → Environment Variables
2. Add `SHOPIFY_STORE_DOMAIN` and `SHOPIFY_STOREFRONT_TOKEN`
3. Redeploy (or wait for auto-redeploy after git push)

### Products Not Loading: Shopify API 503

**Error:** JSON response: `{ "shopifyDisabled": true }`

**Solution:**
1. Verify `SHOPIFY_STORE_DOMAIN` is correct (no `https://`)
2. Verify `SHOPIFY_STOREFRONT_TOKEN` is valid in Shopify Admin
3. Check Shopify API rate limits: https://admin.shopify.com
4. Set `VITE_SHOPIFY_MODE=mock` temporarily to verify fallback works

### Images Not Loading

**Error:** 403 Forbidden from `cdn.shopify.com`

**Solution:**
1. Check Shopify product image URLs are public
2. Verify product images are uploaded in Shopify Admin
3. Clear browser cache and reload

### Function Timeout: 504 Gateway Timeout

**Error:** Vercel Function execution exceeded 30 seconds

**Solution:**
1. Check Shopify API response time: https://status.shopify.com
2. Optimize GraphQL query (reduce `first` parameter)
3. Increase function timeout in `vercel.json` (max 60s for Pro tier)

---

## Database Setup (v2+)

For future releases that use custom authentication or contact forms:

1. Provision PostgreSQL (Vercel's Postgres, AWS RDS, etc.)
2. Set `DATABASE_URL` in Vercel environment
3. Run migrations: `npm run migrate`
4. Uncomment schema tables in `shared/schema.ts`

See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for database issues.

---

## References

- **Vercel Docs:** https://vercel.com/docs
- **Vercel Functions:** https://vercel.com/docs/functions
- **Shopify Setup:** See [SHOPIFY_SETUP.md](../SHOPIFY_SETUP.md)
