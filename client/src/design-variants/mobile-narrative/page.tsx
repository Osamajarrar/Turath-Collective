import PageLayout from "@/components/PageLayout";
import FeaturedProducts from "@/components/featured-products";
import CollectionCards from "@/components/collection-cards";
import BrandStory from "@/components/brand-story";
import ReviewCarousel from "@/components/review-carousel";
import SocialProof from "@/components/social-proof";
import Newsletter from "@/components/newsletter";
import StoryScenes from "./story-scenes";
import MobileCtaBar from "./mobile-cta-bar";

// "Mobile Narrative" — built for visitors arriving from Instagram/TikTok
// process content, already primed to scroll a vertical story on a phone.
// StoryScenes replaces the single Hero with three chapters (place/craft, the
// making, the object); MobileCtaBar keeps the path to shop within thumb's
// reach once the visitor has scrolled past it. Best previewed at phone width.
// Ported from branch design/mobile-narrative.
export default function MobileNarrativePage() {
  return (
    <PageLayout noStyling>
      <StoryScenes />
      <div className="space-y-0">
        <FeaturedProducts />
        <CollectionCards />
        <BrandStory />
        <ReviewCarousel />
        <SocialProof />
        <Newsletter />
      </div>
      <MobileCtaBar />
    </PageLayout>
  );
}
