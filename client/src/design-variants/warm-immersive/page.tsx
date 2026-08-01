import PageLayout from "@/components/PageLayout";
import FeaturedProducts from "@/components/featured-products";
import CollectionCards from "@/components/collection-cards";
import ReviewCarousel from "@/components/review-carousel";
import SocialProof from "@/components/social-proof";
import Newsletter from "@/components/newsletter";
import Hero from "./hero";
import CraftBand from "./craft-band";
import BrandStory from "./brand-story";
import ClosingCta from "./closing-cta";

// "Golden Hour Immersive" — a warmer, slower homepage: full-bleed hero, a dark
// CraftBand pause mid-scroll, and a repeated ClosingCta before the newsletter.
// Ported from branch design/warm-immersive. See ./README.md for the palette
// shift this variant proposed and how it is previewed here.
export default function WarmImmersivePage() {
  return (
    <PageLayout noStyling>
      <div className="variant-warm-immersive">
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
