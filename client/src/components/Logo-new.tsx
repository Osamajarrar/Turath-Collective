/**
 * Logo Component (Asset-Aware Version)
 *
 * Serves logo images from Shopify CDN with graceful fallback to bundled assets.
 * Automatically detects language and uses appropriate localized logo.
 * 
 * This is the upgraded version of Logo.tsx that integrates with the new
 * shopifyAssets service. It demonstrates the pattern for migrating all components.
 *
 * Migration notes:
 * - Old approach: Direct Vite imports, logos bundled in app
 * - New approach: Fetch from Shopify CDN, fallback to bundled assets
 * - Result: Smaller app bundle, easier logo updates via Shopify Admin
 *
 * @example
 * // Usage is identical to old component — no refactoring needed in parent components
 * <Logo variant="with-slogan" />
 * <Logo variant="mark-only" />
 */

import { useTranslation } from "react-i18next";
import { useAssetUrl } from "@/hooks/use-asset-url";

interface LogoProps {
  variant?: "with-slogan" | "mark-only";
  className?: string;
  alt?: string;
}

export default function Logo({
  variant = "with-slogan",
  className,
  alt = "Turath Collective",
}: LogoProps) {
  const { i18n } = useTranslation();
  
  // Determine asset key based on variant and language
  const assetKey = variant === "mark-only"
    ? `logo-mark-${i18n.language}`
    : `logo-slogan-${i18n.language}`;

  // Use asset hook to get logo URL (Shopify CDN or fallback)
  const { url, loading, error } = useAssetUrl(assetKey, i18n.language);

  // Determine default className if not provided
  if (!className) {
    className = variant === "with-slogan"
      ? "h-auto"
      : "w-32 md:w-40 h-auto";
  }

  // While loading, show placeholder or return null (browser will show alt text)
  if (loading) {
    return <div className={`${className} animate-pulse bg-gray-200`} />;
  }

  // If error, log it but still render (fallback URL should be available)
  if (error) {
    console.warn(`Failed to load logo (${assetKey}):`, error);
  }

  return (
    <img
      src={url}
      alt={alt}
      className={className}
      // Logos are high-priority, load eagerly
      loading="eager"
      {...({ fetchpriority: "high" } as any)}
    />
  );
}
