# Troubleshooting Guide

## Common Issues & Solutions

---

## 🟠 Products Not Loading

### Symptom
Products grid shows empty or displays "No products found"

### Causes & Solutions

**1. Shopify API Unconfigured**

Check environment variables:
```bash
echo $SHOPIFY_STORE_DOMAIN
echo $SHOPIFY_STOREFRONT_TOKEN
```

**Solution:**
- Add both variables to `.env.local` or Vercel environment
- Verify values don't have extra spaces or quotes
- Format: `SHOPIFY_STORE_DOMAIN=mystore.myshopify.com` (no `https://`)

**2. Invalid Token**

**Solution:**
1. Go to Shopify Admin → Apps → Custom Apps → Your App
2. Copy the Storefront API access token
3. Replace `SHOPIFY_STOREFRONT_TOKEN` in environment
4. Restart dev server or redeploy to Vercel

**3. Shopify API Rate Limited**

Check Shopify status: https://status.shopify.com

**Solution:**
- Wait 1-2 minutes before retrying
- Check API call quotas in Shopify Admin
- Reduce `first` parameter in pagination queries

**4. Mode Mismatch**

If `VITE_SHOPIFY_MODE=live` and Shopify is unconfigured, the app will error (intended behavior).

**Solution:**
- For development: Set `VITE_SHOPIFY_MODE=mock`
- For production: Ensure `SHOPIFY_STOREFRONT_TOKEN` is valid

---

## 🟠 Build Fails with "Cannot find module"

### Symptom
```
Error: Cannot find module '@/lib/shopify'
```

### Causes & Solutions

**1. Vite Alias Misconfigured**

Check `vite.config.ts`:
```typescript
resolve: {
  alias: {
    "@": fileURLToPath(new URL("./client/src", import.meta.url)),
  },
},
```

**Solution:** If missing, add the alias to `vite.config.ts`

**2. TypeScript Path Mismatch**

Check `tsconfig.json`:
```json
{
  "compilerOptions": {
    "baseUrl": "client/src",
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

**Solution:** Ensure `baseUrl` and `paths` are correct

**3. Node Modules Not Installed**

**Solution:**
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

---

## 🟠 Vercel Deployment Fails

### Symptom
Deployment shows red "Failed" status

### Causes & Solutions

**1. Missing Environment Variables**

Check Vercel logs (click deployment → View Logs)

**Solution:**
1. Go to Vercel project → Settings → Environment Variables
2. Add `SHOPIFY_STORE_DOMAIN` and `SHOPIFY_STOREFRONT_TOKEN`
3. Trigger redeploy: `git push` or click "Redeploy"

**2. Function Timeout (504 Gateway Timeout)**

Shopify API took >30 seconds to respond

**Solution:**
- Check https://status.shopify.com for API issues
- Optimize GraphQL queries (reduce data fetched)
- Increase timeout in `vercel.json` to 60s (Pro tier only)
```json
{
  "functions": {
    "api/shopify.ts": {
      "maxDuration": 60
    }
  }
}
```

**3. Memory Limit Exceeded**

Function used >512 MB memory

**Solution:**
- Simplify GraphQL queries
- Increase memory in `vercel.json`:
```json
{
  "functions": {
    "api/shopify.ts": {
      "memory": 1024
    }
  }
}
```

---

## 🟠 Cart Not Persisting

### Symptom
Items disappear from cart when page refreshes

### Causes & Solutions

**1. LocalStorage Disabled**

Some browsers block localStorage (private mode, etc.)

**Solution:**
- Clear browser cache/cookies
- Try in normal (non-private) mode
- Check browser console for errors

**2. Cart ID Lost**

Cart ID stored in localStorage but Shopify returns null (cart expired)

**Solution:**
- Carts expire after 30 days of inactivity
- User should recreate cart (happens automatically)

**3. Mock Cart in Live Mode**

If Shopify is configured and `VITE_SHOPIFY_MODE=live`, mock cart is disabled.

**Solution:**
- Ensure you're adding products from Shopify (not mock products)
- Mock product variant IDs start with `mock-`

---

## 🟠 Images Not Loading

### Symptom
Product images show broken image icon (🖼️ ❌)

### Causes & Solutions

**1. Shopify CDN Blocked**

Some networks/proxies block CDN access

**Solution:**
- Try different network or VPN
- Check Network tab in DevTools → images should come from `cdn.shopify.com`

**2. Product Image Not Uploaded**

Product in Shopify Admin has no image

**Solution:**
- Go to Shopify Admin → Products → Your product
- Add a featured image
- Wait 1-2 minutes for CDN cache to refresh
- Reload site

**3. Responsive Image Utility Issue**

Check `responsiveImage()` function in `client/src/lib/responsiveImage.ts`

**Solution:**
- Verify image URL starts with `https://cdn.shopify.com`
- Check `SIZES_MAP` configuration matches breakpoints
- Test with direct URL in browser

---

## 🟠 Internationalization (i18n) Not Working

### Symptom
Text stays in English even when switching language

### Causes & Solutions

**1. Missing Translation Key**

Check browser console for warnings:
```
i18next: key "myKey" not found
```

**Solution:**
- Add missing key to `client/src/locales/en/common.json`
- Add translations to `fr/common.json` and `ar/common.json`
- Reload page (dev server auto-reloads)

**2. RTL Not Applied**

Arabic text appears left-to-right

**Solution:**
1. Check `html` element has `dir` attribute:
```tsx
<html dir={lang === 'ar' ? 'rtl' : 'ltr'}>
```
2. Verify Tailwind RTL classes work:
```tsx
<div className="text-right rtl:text-left">
```
3. Clear browser cache

**3. Translation File Parse Error**

JSON is invalid (missing comma, bracket, etc.)

**Solution:**
- Validate JSON in VS Code or https://jsonlint.com
- Check for trailing commas
- Restart dev server

---

## 🟠 Analytics Not Tracking

### Symptom
Google Analytics shows no events

### Causes & Solutions

**1. GA4 Measurement ID Not Set**

**Solution:**
- Set `VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX` in environment
- Get ID from GA4 property: https://analytics.google.com

**2. GA4 Blocked by Ad Blocker**

Ad blockers prevent Google Analytics from loading

**Solution:**
- Disable ad blocker for testing
- Verify analytics loads in DevTools Console (no errors)

**3. Event Not Tracked**

Check that events are fired (e.g., product view, add to cart)

**Solution:**
- Verify `trackEvent()` calls in components
- Check DevTools Console for `[Analytics]` logs
- Verify event names match GA4 events list

---

## 🟠 Port Already in Use (Local Dev)

### Symptom
```
Error: listen EADDRINUSE :::5173
```

### Solution

Kill process using port 5173:

**On Linux/Mac:**
```bash
lsof -i :5173
kill -9 <PID>
```

**On Windows:**
```powershell
netstat -ano | findstr :5173
taskkill /PID <PID> /F
```

Or use different port:
```bash
npm run dev -- --port 3000
```

---

## 🟠 TypeScript Errors

### Symptom
Build fails with `TS2322` or similar

### Causes & Solutions

**1. Type Mismatch**

```
Type 'string | null' is not assignable to type 'string'
```

**Solution:**
- Add type guards or null checks:
```tsx
if (!value) return null;
// Now value is type 'string'
```

**2. Missing Type Definition**

```
Cannot find name 'MyComponent'
```

**Solution:**
- Import the component:
```tsx
import MyComponent from "@/components/MyComponent";
```

**3. Strict Mode Issues**

TypeScript strict mode is enabled. Solution options:

Option A: Fix the type issue
```tsx
// Before
const value: string = null; // ❌ Error

// After
const value: string | null = null; // ✅ OK
```

Option B: Use type assertion (last resort)
```tsx
const value = null as unknown as string; // ⚠️ Use sparingly
```

---

## 🟠 Slow Build Time

### Symptom
`npm run build` takes >30 seconds

### Causes & Solutions

**1. Large Dependency Tree**

**Solution:**
- Check dependency sizes: `npm ls`
- Remove unused packages (see Phase 2 cleanup)

**2. TypeScript Checking**

**Solution:**
- TypeScript checking is necessary — can't skip it
- For faster iteration: `npm run dev` (faster than build)

**3. Vite Cache Issues**

**Solution:**
```bash
rm -rf .vite
npm run build
```

---

## 🟠 Shopify Metafields Not Found

### Symptom
Product metafields return null or undefined

### Causes & Solutions

**1. Metafield Not Set in Shopify Admin**

**Solution:**
1. Go to Shopify Admin → Products → Your product → Metafields
2. Add metafield with correct namespace and key
3. Verify GraphQL query includes metafield:
```graphql
metafields(identifiers: [{ namespace: "custom", key: "quantity_style" }]) {
  key
  value
}
```

**2. Metafield Namespace Mismatch**

**Solution:**
- Default Shopify namespace: `custom`
- Verify namespace matches in GraphQL query and Shopify Admin

**3. Metafield Value Type**

Metafields return as strings; parse if needed:

```tsx
const value = metafield?.value;
if (value === "true") { /* ... */ }
```

---

## Getting Help

### Debug Steps

1. **Check browser console** for errors
2. **Check Vercel logs** (Deployments → View Logs)
3. **Verify environment variables** are set correctly
4. **Try local development** to isolate issue:
   ```bash
   npm run dev
   ```
5. **Check Shopify status** (https://status.shopify.com)
6. **Clear cache**:
   ```bash
   # Browser
   DevTools → Application → Clear storage
   
   # Local
   rm -rf .vite dist node_modules
   npm install
   npm run dev
   ```

### Reporting Bugs

Include:
- Browser & version (Chrome 120, Safari 17, etc.)
- OS (Windows 11, macOS 13, etc.)
- Reproduction steps
- Browser console errors
- Vercel deployment logs (if applicable)
- Environment mode (`VITE_SHOPIFY_MODE`)

---

## References

- **Shopify API Status:** https://status.shopify.com
- **Vercel Logs:** https://vercel.com/docs/monitoring/logs
- **TypeScript Handbook:** https://www.typescriptlang.org/docs
- **Vite Troubleshooting:** https://vitejs.dev/guide/troubleshooting.html
