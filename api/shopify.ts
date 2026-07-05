/**
 * Shopify Storefront API Proxy
 * 
 * Vercel Function that proxies GraphQL requests to Shopify Storefront API
 * Keeps the API token secure (server-side only).
 * 
 * Environment variables required:
 * - SHOPIFY_STORE_DOMAIN: e.g. "turath-collective.myshopify.com"
 * - SHOPIFY_STOREFRONT_TOKEN: Shopify Storefront API access token
 */

import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only accept POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const token = process.env.SHOPIFY_STOREFRONT_TOKEN;
  const domain = process.env.SHOPIFY_STORE_DOMAIN;

  // Check if Shopify is configured
  if (!token || !domain) {
    return res.status(503).json({
      shopifyDisabled: true,
      message: "Shopify is not configured. Set SHOPIFY_STORE_DOMAIN and SHOPIFY_STOREFRONT_TOKEN.",
    });
  }

  try {
    // Forward request to Shopify Storefront API
    const shopifyRes = await fetch(`https://${domain}/api/2024-01/graphql.json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": token,
      },
      body: JSON.stringify(req.body),
    });

    const data = await shopifyRes.json();
    return res.status(shopifyRes.status).json(data);
  } catch (err) {
    console.error("[Shopify proxy] Error:", err);
    return res.status(502).json({ message: "Failed to reach Shopify" });
  }
}
