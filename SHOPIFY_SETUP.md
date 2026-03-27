# Shopify Headless Setup Guide

This guide walks you through connecting Turath Collective to a live Shopify store using the Storefront API.

---

## Prerequisites

- A Shopify store on any paid plan (Basic or higher)
- Products already created in your Shopify admin

---

## Step 1 — Enable Storefront API Access

1. In your Shopify admin, go to **Apps → Develop apps**.
2. Click **Create an app**, name it `Turath Collective Headless`.
3. Under **Configure Storefront API scopes**, enable:
   - `unauthenticated_read_product_listings`
   - `unauthenticated_read_product_inventory`
   - `unauthenticated_read_collection_listings`
   - `unauthenticated_write_checkouts`
   - `unauthenticated_read_checkouts`
4. Click **Save** then **Install app**.
5. Copy the **Storefront API access token** shown on the next screen. You only see this once.

---

## Step 2 — Find Your Store Domain

Your store domain is the `.myshopify.com` address, e.g. `turath-collective.myshopify.com`.  
Do **not** include `https://`.

---

## Step 3 — Set Environment Variables

Add these two secrets in the Replit Secrets panel (or your deployment environment):

| Secret Key                  | Value Example                             |
|-----------------------------|-------------------------------------------|
| `SHOPIFY_STORE_DOMAIN`      | `turath-collective.myshopify.com`         |
| `SHOPIFY_STOREFRONT_TOKEN`  | `shpat_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`  |

Once both are set, the site automatically switches from mock product data to live Shopify data — no code changes needed.

---

## Step 4 — Verify

Visit `/api/health` on your deployed site. You should see:

```json
{
  "shopify": "connected"
}
```

---

## How Products Appear

- **Shop page** — Loads all published products from Shopify, sorted by newest.
- **Product page** — Loads the specific product by its Shopify handle (URL slug).
- **Collections** — Mapped to the category filter on the shop page.
- **Add to Bag / Buy Now** — Creates a Shopify cart and redirects to the Shopify-hosted checkout.

---

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| Products not loading | Check that both env vars are set and the app is restarted |
| 403 from Shopify | Verify Storefront API scopes are enabled on the app |
| Checkout redirects to wrong store | Confirm `SHOPIFY_STORE_DOMAIN` is your `.myshopify.com` domain |

---

## API Version

This integration uses Shopify Storefront API **v2024-01**.  
To upgrade the version, update the URL in `server/routes.ts` → `POST /api/shopify`.
