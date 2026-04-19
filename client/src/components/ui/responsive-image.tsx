import { generateResponsiveImageAttrs } from "@/lib/responsiveImage";
import { ImgHTMLAttributes } from "react";

interface ResponsiveImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'alt'> {
  src: string;
  alt: string;
  layout?: "full-width-hero" | "product-hero" | "product-grid" | "thumbnail";
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
  fetchpriority?: "high" | "low" | "auto";
}

/**
 * ResponsiveImage Component
 * 
 * Renders an optimized responsive image with srcset and sizes attributes.
 * Works with both static assets and Shopify CDN URLs without modification.
 * 
 * When Shopify is integrated, this component automatically handles:
 * - srcset generation from Shopify URLs
 * - responsive sizing based on viewport
 * - bandwidth optimization (smaller files on mobile)
 * 
 * @example
 * // Static asset (no srcset generated)
 * <ResponsiveImage
 *   src={burgundyBowl}
 *   alt="Burgundy bowl"
 *   layout="product-hero"
 * />
 * 
 * @example
 * // Shopify CDN (srcset auto-generated)
 * <ResponsiveImage
 *   src="https://cdn.shopify.com/.../bowl.jpg?v=123"
 *   alt="Indigo bowl on cream background"
 *   layout="product-hero"
 * />
 */
export default function ResponsiveImage({
  src,
  alt,
  layout = "product-grid",
  className = "",
  width,
  height,
  priority = false,
  fetchpriority = "auto",
}: ResponsiveImageProps) {
  const attrs = generateResponsiveImageAttrs(src, alt, layout);

  return (
    <img
      {...attrs}
      width={width}
      height={height}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      className={`w-full h-full object-cover ${className}`}
      style={{
        height: 'auto',
        aspectRatio: width && height ? `${width} / ${height}` : undefined,
      }}
      {...(fetchpriority && { fetchpriority: fetchpriority as any })}
    />
  );
}
