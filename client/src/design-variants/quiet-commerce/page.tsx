import PageLayout from "@/components/PageLayout";
import ReviewCarousel from "@/components/review-carousel";
import SocialProof from "@/components/social-proof";
import Newsletter from "@/components/newsletter";
import Hero from "./hero";
import ValuesStrip from "./values-strip";
import FeaturedProducts from "./featured-products";
import CollectionCards from "./collection-cards";
import BrandStory from "./brand-story";

// "Quiet Commerce" — compresses the path to product: a shorter hero, a
// claim-safe ValuesStrip directly beneath it, and tightened product/story
// sections. Ported from branch design/quiet-commerce.
export default function QuietCommercePage() {
  return (
    <PageLayout noStyling>
      <Hero />
      <ValuesStrip />
      <div className="space-y-0">
        <FeaturedProducts />
        <CollectionCards />
        <BrandStory />
        <ReviewCarousel />
        <SocialProof />
        <Newsletter />
      </div>
    </PageLayout>
  );
}
