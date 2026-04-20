import { useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ResponsiveImage from "@/components/ui/responsive-image";

interface ProductImageCarouselProps {
  images: string[];
  selectedImageIdx: number;
  onImageSelect: (index: number) => void;
  productName: string;
}

/**
 * ProductImageCarousel Component
 * 
 * Mobile-only carousel using Embla Carousel library.
 * Desktop: Hidden (ProductGallery handles desktop)
 * Mobile: Full-width swipeable image carousel
 * 
 * Features:
 * - Touch-friendly swipe navigation
 * - Keyboard navigation (arrow keys)
 * - Dot indicators at bottom showing current slide
 * - Syncs with main image selection state
 * 
 * Shopify-ready: Works with arrays of image URLs from Shopify products.
 */
export default function ProductImageCarousel({
  images,
  selectedImageIdx,
  onImageSelect,
  productName,
}: ProductImageCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    loop: true,
    skipSnaps: false,
  });
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  useEffect(() => {
    if (!emblaApi) return;

    const onSelect = () => {
      const selected = emblaApi.selectedScrollSnap();
      onImageSelect(selected);
      setCanScrollPrev(emblaApi.canScrollPrev());
      setCanScrollNext(emblaApi.canScrollNext());
    };

    emblaApi.on("select", onSelect);
    onSelect();

    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, onImageSelect]);

  // Sync carousel to selected image when index changes externally
  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.scrollTo(selectedImageIdx);
  }, [emblaApi, selectedImageIdx]);

  if (images.length === 0) {
    return null;
  }

  const handlePrev = () => {
    if (emblaApi) emblaApi.scrollPrev();
  };

  const handleNext = () => {
    if (emblaApi) emblaApi.scrollNext();
  };

  return (
    <div className="lg:hidden w-full">
      {/* Carousel Container - shows next image peeking for UX */}
      <div ref={emblaRef} className="overflow-hidden w-full">
        <div className="flex w-full touch-pan-y gap-4">
          {images.map((image, idx) => (
            <div
              key={idx}
              className="flex-[0_0_90%] min-w-0 aspect-square"
              role="group"
              aria-roledescription="slide"
              aria-label={`Slide ${idx + 1} of ${images.length}`}
            >
              <div className="w-full h-full overflow-hidden">
                <ResponsiveImage
                  src={image}
                  alt={`${productName} - image ${idx + 1}`}
                  layout="product-hero"
                  width={1200}
                  height={1200}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Arrows (visible only if more than one image) - hidden on mobile */}
      {images.length > 1 && false && (
        <>
          <button
            onClick={handlePrev}
            disabled={!canScrollPrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-black/20 text-white hover:bg-black/40 disabled:opacity-20 disabled:cursor-not-allowed transition-all"
            aria-label="Previous image"
            data-testid="carousel-prev"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            onClick={handleNext}
            disabled={!canScrollNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-black/20 text-white hover:bg-black/40 disabled:opacity-20 disabled:cursor-not-allowed transition-all"
            aria-label="Next image"
            data-testid="carousel-next"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

      {/* Dot Indicators - styled like Heritage section, positioned below */}
      {images.length > 1 && (
        <div className="flex gap-2 justify-center mt-4 pb-4">
          {images.map((_, idx) => (
            <button
              key={idx}
              onClick={() => {
                if (emblaApi) {
                  emblaApi.scrollTo(idx);
                }
              }}
              className={`h-1 transition-all duration-500 ${
                idx === selectedImageIdx
                  ? "w-6 bg-primary"
                  : "w-3 bg-primary/30 hover:bg-primary/50"
              }`}
              aria-label={`Go to image ${idx + 1}`}
              aria-current={idx === selectedImageIdx ? "true" : "false"}
              data-testid={`carousel-dot-${idx}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
