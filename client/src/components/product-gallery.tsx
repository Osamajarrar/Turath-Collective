import { cn } from "@/lib/utils";
import ResponsiveImage from "@/components/ui/responsive-image";

interface ProductGalleryProps {
  images: string[];
  selectedImageIdx: number;
  onImageSelect: (index: number) => void;
  productName: string;
}

/**
 * ProductGallery Component
 * 
 * Desktop: Grid of thumbnail images
 * Mobile: Hidden (ProductImageCarousel handles mobile)
 * 
 * Displays product images as a 2-column grid on tablet, 4-column on desktop.
 * Clicking a thumbnail updates the main product image in Section 1.
 * 
 * Shopify-ready: Accepts array of image URLs from product.variations[].images
 * Works with both static assets and Shopify CDN URLs.
 */
export default function ProductGallery({
  images,
  selectedImageIdx,
  onImageSelect,
  productName,
}: ProductGalleryProps) {
  if (images.length === 0) {
    return null;
  }

  return (
    <div className="hidden lg:block lg:col-span-3">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {images.map((image, idx) => (
          <button
            key={idx}
            onClick={() => onImageSelect(idx)}
            className={cn(
              "aspect-square overflow-hidden bg-background rounded-lg border-2 transition-all",
              selectedImageIdx === idx
                ? "border-primary"
                : "border-border hover:border-border/60 cursor-pointer"
            )}
            aria-label={`View product image ${idx + 1}`}
            data-testid={`thumbnail-image-${idx}`}
          >
            <ResponsiveImage
              src={image}
              alt={`${productName} - view ${idx + 1}`}
              layout="thumbnail"
              width={400}
              height={400}
              className="transition-transform hover:scale-105"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
