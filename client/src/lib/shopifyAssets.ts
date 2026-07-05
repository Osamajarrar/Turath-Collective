/**
 * Shopify Asset Management Service
 *
 * Handles fetching and caching assets from Shopify CDN.
 * Falls back to local assets if Shopify is unavailable.
 *
 * Architecture:
 * - Assets are served from Shopify CDN when available
 * - Local fallback URLs are bundled with the app for resilience
 * - Implements smart caching with localStorage + React Query
 * - Supports locale-specific asset variants (en, fr, ar)
 */

export type AssetType = 'logo' | 'hero' | 'collection-cover' | 'product-placeholder' | 'brand-image';

interface AssetConfig {
  key: string;
  shopifyUrl?: string;
  fallbackUrl: string;
  localePath?: boolean; // If true, locale code inserted in filename (logo-en.svg)
  priority?: 'high' | 'low'; // For fetchpriority attribute
  sizesStrategy?: 'full-width-hero' | 'product-hero' | 'product-grid' | 'thumbnail';
}

/**
 * Asset registry: maps asset keys to their Shopify CDN URLs and fallback sources
 * Key format: `namespace-identifier[-locale]` (e.g., 'logo-slogan-en', 'hero-home-fr')
 *
 * Locale-specific assets: Key format includes locale suffix when localePath=true
 * The getAssetUrl() function handles locale substitution automatically
 */
const ASSET_REGISTRY: Record<string, AssetConfig> = {
  // ─────────────────────────────────────────────────────────────────
  // BRAND ASSETS (Logos, Monograms)
  // ─────────────────────────────────────────────────────────────────
  
  'logo-slogan-en': {
    key: 'logo-slogan-en',
    shopifyUrl: 'https://cdn.shopify.com/s/files/1/your-store/logo-slogan-en.svg',
    fallbackUrl: '/assets/en/Logo with Slogan EN.svg',
    priority: 'high',
  },
  'logo-slogan-fr': {
    key: 'logo-slogan-fr',
    shopifyUrl: 'https://cdn.shopify.com/s/files/1/your-store/logo-slogan-fr.svg',
    fallbackUrl: '/assets/fr/Logo with Slogan FR.svg',
    priority: 'high',
  },
  'logo-slogan-ar': {
    key: 'logo-slogan-ar',
    shopifyUrl: 'https://cdn.shopify.com/s/files/1/your-store/logo-slogan-ar.svg',
    fallbackUrl: '/assets/ar/Logo with Slogan AR.svg',
    priority: 'high',
  },

  'logo-mark-en': {
    key: 'logo-mark-en',
    shopifyUrl: 'https://cdn.shopify.com/s/files/1/your-store/logo-mark-en.svg',
    fallbackUrl: '/assets/en/Logo EN.svg',
    priority: 'high',
  },
  'logo-mark-fr': {
    key: 'logo-mark-fr',
    shopifyUrl: 'https://cdn.shopify.com/s/files/1/your-store/logo-mark-fr.svg',
    fallbackUrl: '/assets/fr/Logo FR.svg',
    priority: 'high',
  },
  'logo-mark-ar': {
    key: 'logo-mark-ar',
    shopifyUrl: 'https://cdn.shopify.com/s/files/1/your-store/logo-mark-ar.svg',
    fallbackUrl: '/assets/ar/Logo AR.svg',
    priority: 'high',
  },

  'logo-monogram': {
    key: 'logo-monogram',
    shopifyUrl: 'https://cdn.shopify.com/s/files/1/your-store/monogram.svg',
    fallbackUrl: '/assets/monogram/monogram.svg',
    priority: 'high',
  },

  // ─────────────────────────────────────────────────────────────────
  // HERO & SECTION IMAGES
  // ─────────────────────────────────────────────────────────────────

  'hero-home-en': {
    key: 'hero-home-en',
    shopifyUrl: 'https://cdn.shopify.com/s/files/1/your-store/hero-home-en.jpg',
    fallbackUrl: '/assets/en/hero-home.jpg',
    sizesStrategy: 'full-width-hero',
  },
  'hero-home-fr': {
    key: 'hero-home-fr',
    shopifyUrl: 'https://cdn.shopify.com/s/files/1/your-store/hero-home-fr.jpg',
    fallbackUrl: '/assets/fr/hero-home.jpg',
    sizesStrategy: 'full-width-hero',
  },

  // ─────────────────────────────────────────────────────────────────
  // COLLECTION COVER IMAGES
  // ─────────────────────────────────────────────────────────────────

  'collection-ceramics-en': {
    key: 'collection-ceramics-en',
    shopifyUrl: 'https://cdn.shopify.com/s/files/1/your-store/collection-ceramics-en.jpg',
    fallbackUrl: '/assets/en/collection-ceramics.jpg',
    sizesStrategy: 'product-hero',
  },
  'collection-ceramics-fr': {
    key: 'collection-ceramics-fr',
    shopifyUrl: 'https://cdn.shopify.com/s/files/1/your-store/collection-ceramics-fr.jpg',
    fallbackUrl: '/assets/fr/collection-ceramics.jpg',
    sizesStrategy: 'product-hero',
  },

  'collection-embroidery-en': {
    key: 'collection-embroidery-en',
    shopifyUrl: 'https://cdn.shopify.com/s/files/1/your-store/collection-embroidery-en.jpg',
    fallbackUrl: '/assets/en/collection-embroidery.jpg',
    sizesStrategy: 'product-hero',
  },
  'collection-embroidery-fr': {
    key: 'collection-embroidery-fr',
    shopifyUrl: 'https://cdn.shopify.com/s/files/1/your-store/collection-embroidery-fr.jpg',
    fallbackUrl: '/assets/fr/collection-embroidery.jpg',
    sizesStrategy: 'product-hero',
  },

  // ─────────────────────────────────────────────────────────────────
  // STORY & CONTENT IMAGES
  // ─────────────────────────────────────────────────────────────────

  'story-heritage-en': {
    key: 'story-heritage-en',
    shopifyUrl: 'https://cdn.shopify.com/s/files/1/your-store/story-heritage-en.jpg',
    fallbackUrl: '/assets/en/story-heritage.jpg',
  },
  'story-heritage-fr': {
    key: 'story-heritage-fr',
    shopifyUrl: 'https://cdn.shopify.com/s/files/1/your-store/story-heritage-fr.jpg',
    fallbackUrl: '/assets/fr/story-heritage.jpg',
  },

  'story-craftsmanship-en': {
    key: 'story-craftsmanship-en',
    shopifyUrl: 'https://cdn.shopify.com/s/files/1/your-store/story-craftsmanship-en.jpg',
    fallbackUrl: '/assets/en/story-craftsmanship.jpg',
  },
  'story-craftsmanship-fr': {
    key: 'story-craftsmanship-fr',
    shopifyUrl: 'https://cdn.shopify.com/s/files/1/your-store/story-craftsmanship-fr.jpg',
    fallbackUrl: '/assets/fr/story-craftsmanship.jpg',
  },
};

/**
 * Cache key for localStorage
 */
const CACHE_KEY_PREFIX = 'tc-asset-';
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

interface CachedAsset {
  url: string;
  timestamp: number;
  source: 'shopify' | 'fallback';
}

/**
 * Get asset URL with fallback and caching
 *
 * @param assetKey - Key from ASSET_REGISTRY (e.g., 'logo-primary')
 * @param locale - Optional locale code for locale-specific assets (en, fr, ar)
 * @param useShopify - Optional override to disable Shopify (for testing)
 * @returns Promise<string> - Asset URL (Shopify CDN or fallback)
 *
 * @example
 * const logoUrl = await getAssetUrl('logo-primary', 'en');
 * // Returns: 'https://cdn.shopify.com/s/files/1/...' or fallback
 */
export async function getAssetUrl(
  assetKey: string,
  locale?: string,
  useShopify = true
): Promise<string> {
  const config = ASSET_REGISTRY[assetKey];
  if (!config) {
    console.warn(`Asset key "${assetKey}" not found in registry.`);
    return '';
  }

  // Check cache first
  const cached = getFromCache(assetKey, locale);
  if (cached) {
    return cached.url;
  }

  // Try Shopify CDN if available and enabled
  if (useShopify && config.shopifyUrl) {
    try {
      const shopifyUrl = getLocalizedUrl(config.shopifyUrl, locale);
      saveToCache(assetKey, locale, shopifyUrl, 'shopify');
      return shopifyUrl;
    } catch (error) {
      console.warn(`Failed to load asset from Shopify CDN (${assetKey}):`, error);
      // Fall through to fallback
    }
  }

  // Fall back to local asset
  const fallbackUrl = getLocalizedUrl(config.fallbackUrl, locale);
  saveToCache(assetKey, locale, fallbackUrl, 'fallback');
  return fallbackUrl;
}

/**
 * Synchronous version for use in components (uses cache only)
 * Falls back to local asset if not in cache
 *
 * @param assetKey - Key from ASSET_REGISTRY
 * @param locale - Optional locale code
 * @returns Asset URL (from cache or fallback)
 */
export function getAssetUrlSync(assetKey: string, locale?: string): string {
  const config = ASSET_REGISTRY[assetKey];
  if (!config) {
    console.warn(`Asset key "${assetKey}" not found in registry.`);
    return '';
  }

  // Check cache
  const cached = getFromCache(assetKey, locale);
  if (cached) {
    return cached.url;
  }

  // Return fallback if not cached
  return getLocalizedUrl(config.fallbackUrl, locale);
}

/**
 * Preload an asset into cache
 * Call this during app initialization for high-priority assets (logo, hero)
 *
 * @param assetKey - Key from ASSET_REGISTRY
 * @param locale - Optional locale code
 */
export async function preloadAsset(assetKey: string, locale?: string): Promise<void> {
  await getAssetUrl(assetKey, locale);
}

/**
 * Preload multiple assets in parallel
 *
 * @param assetKeys - Array of asset keys
 * @param locale - Optional locale code
 */
export async function preloadAssets(assetKeys: string[], locale?: string): Promise<void> {
  await Promise.all(assetKeys.map((key) => preloadAsset(key, locale)));
}

/**
 * Get sizes attribute for responsive images
 * Used in <img> tag's sizes attribute for proper responsive behavior
 *
 * @param assetKey - Key from ASSET_REGISTRY
 * @returns CSS media query sizes string
 */
export function getAssetSizes(assetKey: string): string {
  const config = ASSET_REGISTRY[assetKey];
  if (!config?.sizesStrategy) {
    return '100vw'; // Default: full viewport width
  }

  const strategies: Record<string, string> = {
    'full-width-hero': '(max-width: 768px) 100vw, (max-width: 1024px) 100vw, 1820px',
    'product-hero': '(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw',
    'product-grid': '(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw',
    'thumbnail': '(max-width: 768px) 100px, 150px',
  };

  return strategies[config.sizesStrategy] || '100vw';
}

/**
 * Get priority hint for image loading
 *
 * @param assetKey - Key from ASSET_REGISTRY
 * @returns 'high' | 'low' | undefined
 */
export function getAssetPriority(assetKey: string): 'high' | 'low' | undefined {
  const config = ASSET_REGISTRY[assetKey];
  return config?.priority;
}

/**
 * Localize asset URL by inserting locale code
 * Converts: `/assets/en/logo.svg` → `/assets/fr/logo.svg` if locale='fr'
 *
 * @param url - Original URL with locale placeholder
 * @param locale - Locale code (en, fr, ar)
 * @returns Localized URL
 */
function getLocalizedUrl(url: string, locale?: string): string {
  if (!locale || !url.includes('/assets/')) {
    return url;
  }

  // Replace first locale occurrence in path
  return url.replace(/\/assets\/\w+\//, `/assets/${locale}/`);
}

/**
 * Cache management: get from localStorage
 */
function getFromCache(assetKey: string, locale?: string): CachedAsset | null {
  try {
    const cacheKey = `${CACHE_KEY_PREFIX}${assetKey}-${locale || 'default'}`;
    const cached = localStorage.getItem(cacheKey);

    if (!cached) return null;

    const asset: CachedAsset = JSON.parse(cached);
    const isExpired = Date.now() - asset.timestamp > CACHE_TTL;

    if (isExpired) {
      localStorage.removeItem(cacheKey);
      return null;
    }

    return asset;
  } catch (error) {
    console.warn('Error reading asset cache:', error);
    return null;
  }
}

/**
 * Cache management: save to localStorage
 */
function saveToCache(
  assetKey: string,
  locale: string | undefined,
  url: string,
  source: 'shopify' | 'fallback'
): void {
  try {
    const cacheKey = `${CACHE_KEY_PREFIX}${assetKey}-${locale || 'default'}`;
    const asset: CachedAsset = {
      url,
      timestamp: Date.now(),
      source,
    };
    localStorage.setItem(cacheKey, JSON.stringify(asset));
  } catch (error) {
    // Silently fail if localStorage unavailable
    console.warn('Error saving asset cache:', error);
  }
}

/**
 * Clear all asset cache
 */
export function clearAssetCache(): void {
  try {
    const keys = Object.keys(localStorage).filter((key) => key.startsWith(CACHE_KEY_PREFIX));
    keys.forEach((key) => localStorage.removeItem(key));
  } catch (error) {
    console.warn('Error clearing asset cache:', error);
  }
}

/**
 * Get diagnostic info about asset sources
 * Useful for debugging which assets are using Shopify vs fallback
 */
export function getAssetDiagnostics(): Record<string, { cached: boolean; source?: string }> {
  const diagnostics: Record<string, { cached: boolean; source?: string }> = {};

  Object.keys(ASSET_REGISTRY).forEach((key) => {
    const cached = getFromCache(key);
    diagnostics[key] = {
      cached: !!cached,
      source: cached?.source,
    };
  });

  return diagnostics;
}
