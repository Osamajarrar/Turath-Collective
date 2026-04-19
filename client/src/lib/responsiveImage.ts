/**
 * Responsive Image Utility
 * 
 * Generates srcset and sizes attributes for responsive images.
 * Supports both static assets and Shopify CDN URLs seamlessly.
 * 
 * When Shopify is integrated, URLs like:
 *   https://cdn.shopify.com/.../product.jpg?v=123456
 * Will automatically generate srcset variants using width parameters.
 */

/**
 * Image breakpoints matching Shopify CDN optimization standards
 * These widths are commonly used for responsive image delivery
 */
export const IMAGE_WIDTHS = [330, 720, 1066, 1440, 1880, 2132] as const;

/**
 * Generates srcset string for responsive images
 * 
 * @param baseUrl - Base image URL (static asset or Shopify CDN URL)
 * @returns srcset string with width descriptors, or undefined if static asset
 * 
 * @example
 * // Static asset - returns undefined (no srcset needed)
 * generateSrcset("/assets/bowl.png") → undefined
 * 
 * // Shopify CDN - returns srcset with width parameters
 * generateSrcset("https://cdn.shopify.com/.../bowl.jpg?v=123")
 * → "https://cdn.shopify.com/.../bowl.jpg?v=123&width=330 165w, ..."
 */
export function generateSrcset(baseUrl: string): string | undefined {
  // Only generate srcset for Shopify CDN URLs
  if (!isShopifyUrl(baseUrl)) {
    return undefined;
  }

  const separator = baseUrl.includes("?") ? "&" : "?";

  return IMAGE_WIDTHS.map((width) => {
    // Calculate display width (approximately half of actual width for 2x pixel density)
    const displayWidth = Math.round(width / 2);
    return `${baseUrl}${separator}width=${width} ${displayWidth}w`;
  }).join(", ");
}

/**
 * Generates sizes attribute for responsive images
 * Tells browser which image size to load based on viewport
 * 
 * @param containerWidth - CSS width of the image container (e.g., "100vw", "col-span-3")
 * @returns CSS sizes attribute value
 * 
 * @example
 * // Full-width image on mobile, constrained on desktop
 * generateSizes("full-width-hero")
 * → "(min-width: 1200px) 800px, (min-width: 768px) 100vw, calc(100vw - 32px)"
 * 
 * // Product grid (3/5 width on desktop)
 * generateSizes("product-hero")
 * → "(min-width: 1200px) 533px, (min-width: 768px) calc((100vw - 48px) / 2), calc((100vw - 32px) / 2)"
 */
export function generateSizes(layout: "full-width-hero" | "product-hero" | "product-grid" | "thumbnail"): string {
  switch (layout) {
    case "full-width-hero":
      // Full-width hero: constrained to max-width at desktop
      // Accounts for container padding and responsive breakpoints
      return "(min-width: 1200px) 1000px, (min-width: 768px) 100vw, calc(100vw - 48px)";

    case "product-hero":
      // Product main image: 3/5 width on desktop (1820px max container)
      // Desktop: ~1066px (matching Fable pattern for optimal Shopify delivery)
      // Tablet: ~50% width with padding allowance
      // Mobile: full width minus padding
      // Includes container max-width, section padding, and grid gaps
      return "(min-width: 1200px) 1066px, (min-width: 768px) calc((100vw - 96px) / 2), calc(100vw - 48px)";

    case "product-grid":
      // Product grid thumbnail: responsive 3-4 column layout
      // Desktop (1024px+): ~33% of viewport minus padding
      // Tablet (768px+): ~50% of viewport minus padding
      // Mobile: full width minus padding
      return "(min-width: 1024px) calc((100vw - 96px) / 3), (min-width: 768px) calc((100vw - 96px) / 2), calc(100vw - 48px)";

    case "thumbnail":
      // Small thumbnail: constrained size for gallery
      // Desktop: 264px (fixed for consistency)
      // Tablet: 50% minus padding
      // Mobile: full width minus padding
      return "(min-width: 1024px) 264px, (min-width: 768px) calc((100vw - 96px) / 2), calc(100vw - 48px)";

    default:
      return "100vw";
  }
}

/**
 * Checks if a URL is from Shopify CDN
 * Shopify images can be identified by the cdn.shopify domain
 */
export function isShopifyUrl(url: string): boolean {
  return url.includes("cdn.shopify.com") || url.includes("cdn1.shopifycdn.com");
}

/**
 * Generates responsive image attributes object
 * Use this to build an <img> tag with proper responsive attributes
 * 
 * @param baseUrl - Image URL (static or Shopify CDN)
 * @param alt - Alt text for accessibility
 * @param layout - Layout preset: "full-width-hero" | "product-hero" | "product-grid" | "thumbnail"
 * @returns Object with srcSet, sizes, and other img attributes
 * 
 * @example
 * const attrs = generateResponsiveImageAttrs(
 *   "https://cdn.shopify.com/.../bowl.jpg?v=123",
 *   "Indigo bowl",
 *   "product-hero"
 * );
 * 
 * return <img {...attrs} />;
 */
export interface ResponsiveImageAttrs {
  src: string;
  alt: string;
  srcSet?: string;
  sizes: string;
}

export function generateResponsiveImageAttrs(
  baseUrl: string,
  alt: string,
  layout: "full-width-hero" | "product-hero" | "product-grid" | "thumbnail",
): ResponsiveImageAttrs {
  return {
    src: baseUrl,
    alt,
    srcSet: generateSrcset(baseUrl),
    sizes: generateSizes(layout),
  };
}

/**
 * Shopify image URL parameters
 * When integrating with Shopify, images arrive with these parameters
 * 
 * @example
 * // Input from Shopify
 * {
 *   url: "https://cdn.shopify.com/s/files/1/0123/4567/8901/products/bowl.jpg",
 *   altText: "Indigo Mosaic Bowl"
 * }
 * 
 * // With version parameter added by Shopify
 * {
 *   url: "https://cdn.shopify.com/s/files/1/0123/4567/8901/products/bowl.jpg?v=1764089925",
 *   altText: "Indigo Mosaic Bowl"
 * }
 * 
 * This utility handles both cases seamlessly.
 */

/**
 * Utility: Get optimized Shopify image URL
 * If you need a specific size, append width parameter
 * 
 * @param baseUrl - Shopify image URL (with or without size)
 * @param width - Optional: specific width in pixels
 * @returns Optimized Shopify image URL
 */
export function getShopifyImageUrl(baseUrl: string, width?: number): string {
  if (!isShopifyUrl(baseUrl)) return baseUrl;

  const separator = baseUrl.includes("?") ? "&" : "?";
  return width ? `${baseUrl}${separator}width=${width}` : baseUrl;
}
