/**
 * useAssetUrl Hook
 *
 * React hook to get asset URLs with Shopify CDN fallback and caching.
 * Integrates with shopifyAssets service for async loading.
 *
 * @example
 * const { url, loading, error, source } = useAssetUrl('logo-primary', locale);
 * return <img src={url} alt="Logo" />;
 */

import { useState, useEffect } from 'react';
import { getAssetUrl, getAssetPriority, getAssetSizes } from '@/lib/shopifyAssets';

interface UseAssetUrlResult {
  url: string;
  loading: boolean;
  error: Error | null;
  source: 'shopify' | 'fallback' | 'loading';
  priority: 'high' | 'low' | undefined;
  sizes: string;
}

/**
 * Hook to get asset URL with Shopify CDN fallback
 *
 * @param assetKey - Key from ASSET_REGISTRY (e.g., 'logo-primary')
 * @param locale - Optional locale code (en, fr, ar)
 * @param useShopify - Optional override to disable Shopify (for testing)
 * @returns Object containing URL, loading state, error, and metadata
 */
export function useAssetUrl(
  assetKey: string,
  locale?: string,
  useShopify = true
): UseAssetUrlResult {
  const [url, setUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [source, setSource] = useState<'shopify' | 'fallback' | 'loading'>('loading');

  useEffect(() => {
    let cancelled = false;

    const loadAsset = async () => {
      try {
        setLoading(true);
        setError(null);
        setSource('loading');

        const assetUrl = await getAssetUrl(assetKey, locale, useShopify);
        if (!cancelled) {
          setUrl(assetUrl);
          // Determine source from URL (heuristic: Shopify URLs contain 'cdn.shopify.com')
          const isShopify = assetUrl.includes('cdn.shopify.com');
          setSource(isShopify ? 'shopify' : 'fallback');
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error(String(err)));
          setLoading(false);
          setSource('fallback');
        }
      }
    };

    loadAsset();

    return () => {
      cancelled = true;
    };
  }, [assetKey, locale, useShopify]);

  return {
    url,
    loading,
    error,
    source,
    priority: getAssetPriority(assetKey),
    sizes: getAssetSizes(assetKey),
  };
}

/**
 * Hook to preload assets (logo, hero image) on app initialization
 * Used in App.tsx or PageLayout for critical assets
 *
 * @param assetKeys - Array of asset keys to preload
 * @param locale - Optional locale code
 */
export function usePreloadAssets(assetKeys: string[], locale?: string): void {
  useEffect(() => {
    // Dynamically import and preload to avoid circular deps
    import('@/lib/shopifyAssets').then(({ preloadAssets }) => {
      preloadAssets(assetKeys, locale).catch((err) => {
        console.warn('Error preloading assets:', err);
      });
    });
  }, [assetKeys, locale]);
}
