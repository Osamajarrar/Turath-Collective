import PageLayout from "@/components/PageLayout";
import Hero from "@/components/hero";
import FeaturedProducts from "@/components/featured-products";
import CraftBand from "@/components/craft-band";
import CollectionCards from "@/components/collection-cards";
import BrandStory from "@/components/brand-story";
import ReviewCarousel from "@/components/review-carousel";
import SocialProof from "@/components/social-proof";
import ClosingCta from "@/components/closing-cta";
import Newsletter from "@/components/newsletter";

/**
 * Homepage — "Golden Hour Immersive", promoted from the design variants on
 * 2026-08-04 after the founder chose it.
 *
 * What it changes versus the composition that was live before: a full-bleed
 * hero, a dark CraftBand pause mid-scroll, and a repeated ClosingCta before
 * the newsletter. The previous composition is preserved at /design/original so
 * the two can still be compared.
 *
 * `theme-warm` carries the warmer palette this direction proposed (see the
 * block at the bottom of index.css). It is scoped to the homepage rather than
 * applied to the root tokens, because warming every page is a separate
 * decision nobody has reviewed yet.
 */
export default function Home() {
  return (
    <PageLayout noStyling>
      <div className="theme-warm">
        <Hero />
        <div className="space-y-0">
          <FeaturedProducts />
          <CraftBand />
          <CollectionCards />
          <BrandStory />
          <ReviewCarousel />
          <SocialProof />
          <ClosingCta />
          <Newsletter />
        </div>
      </div>
    </PageLayout>
  );
}
