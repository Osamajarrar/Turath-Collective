import { Children, useEffect, useState, type ReactNode } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { cn } from "@/lib/utils";

interface MobileCarouselProps {
  children: ReactNode;
  className?: string;
}

/**
 * Horizontal touch-swipe carousel for mobile viewports, following the Embla
 * pattern established by product-image-carousel.tsx: each slide takes ~85% of
 * the viewport so the next card peeks in at the edge (the cue that there is
 * more to swipe to), with the same dot indicators below.
 *
 * Layout-only: callers decide at which breakpoint to hide it (e.g. pass
 * className="md:hidden" and render the grid alongside as "hidden md:grid").
 */
export default function MobileCarousel({ children, className }: MobileCarouselProps) {
  const slides = Children.toArray(children);
  const [emblaRef, emblaApi] = useEmblaCarousel({ align: "start", skipSnaps: false });
  const [selected, setSelected] = useState(0);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelected(emblaApi.selectedScrollSnap());
    emblaApi.on("select", onSelect);
    onSelect();
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi]);

  if (slides.length === 0) return null;

  return (
    <div className={className}>
      <div ref={emblaRef} className="overflow-hidden">
        <div className="flex touch-pan-y gap-4">
          {slides.map((slide, idx) => (
            <div
              key={idx}
              className="min-w-0 flex-[0_0_85%]"
              role="group"
              aria-roledescription="slide"
              aria-label={`Slide ${idx + 1} of ${slides.length}`}
            >
              {slide}
            </div>
          ))}
        </div>
      </div>

      {slides.length > 1 && (
        <div className="mt-4 flex justify-center gap-2">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => emblaApi?.scrollTo(idx)}
              className={cn(
                "h-1 transition-all duration-500",
                idx === selected ? "w-6 bg-primary" : "w-3 bg-primary/30 hover:bg-primary/50",
              )}
              aria-label={`Go to slide ${idx + 1}`}
              aria-current={idx === selected ? "true" : "false"}
              data-testid={`mobile-carousel-dot-${idx}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
