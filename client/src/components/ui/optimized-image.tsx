/**
 * Optimized Image Component
 * 
 * Serves WebP format when available, with automatic PNG fallback.
 * Dramatically reduces image bandwidth on modern browsers (~30-40% savings).
 * 
 * Extends ResponsiveImage with format optimization and lazy loading support.
 * Use this for all product images and hero sections.
 * 
 * @example
 * <OptimizedImage
 *   src="https://cdn.shopify.com/.../product.jpg"
 *   alt="Product name"
 *   webpSrc="https://cdn.shopify.com/.../product.webp"  // Optional
 *   priority="high"  // For above-fold images
 *   sizes="(min-width: 1200px) 1066px, calc((100vw - 48px) / 2)"
 * />
 */

import { ImgHTMLAttributes } from "react";

interface OptimizedImageProps
  extends Omit<
    ImgHTMLAttributes<HTMLImageElement>,
    "src" | "srcSet" | "alt" | "loading"
  > {
  src: string;
  alt: string;
  webpSrc?: string;
  priority?: "high" | "low" | "auto";
  sizes?: string;
  srcSet?: string;
  lazy?: boolean;
}

export default function OptimizedImage({
  src,
  webpSrc,
  alt,
  priority = "auto",
  sizes,
  srcSet,
  lazy = true,
  className = "",
  ...attrs
}: OptimizedImageProps) {
  // If WebP source provided, render picture element for format negotiation
  if (webpSrc) {
    return (
      <picture>
        <source srcSet={webpSrc} type="image/webp" />
        <source srcSet={src} type="image/png" />
        <img
          src={src}
          alt={alt}
          sizes={sizes}
          srcSet={srcSet}
          loading={lazy ? "lazy" : "eager"}
          decoding="async"
          className={`w-full h-full object-cover ${className}`}
          {...(priority && priority !== "auto"
            ? { fetchpriority: priority as any }
            : {})}
          {...attrs}
        />
      </picture>
    );
  }

  // Fallback: Direct img tag with WebP hint
  return (
    <img
      src={src}
      alt={alt}
      sizes={sizes}
      srcSet={srcSet}
      loading={lazy ? "lazy" : "eager"}
      decoding="async"
      className={`w-full h-full object-cover ${className}`}
      {...(priority && priority !== "auto"
        ? { fetchpriority: priority as any }
        : {})}
      {...attrs}
    />
  );
}
