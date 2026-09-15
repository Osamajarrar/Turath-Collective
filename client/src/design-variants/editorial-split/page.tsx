import PageLayout from "@/components/PageLayout";
import CollectionCards from "@/components/collection-cards";
import BrandStory from "@/components/brand-story";
import ReviewCarousel from "@/components/review-carousel";
import SocialProof from "@/components/social-proof";
import Newsletter from "@/components/newsletter";
import Hero from "./hero";
import FeaturedProducts from "./featured-products";

// "Editorial Split" — a two-column hero (copy left, object right) with a
// kicker and supporting subheading, and a left-aligned editorial heading on
// the featured products. Ported from branch design/editorial-split.
export default function EditorialSplitPage() {
  return (
    <PageLayout noStyling>
      <Hero />
      <div className="space-y-0">
        <FeaturedProducts />
        <BrandStory />
        <CollectionCards />
        <ReviewCarousel />
        <SocialProof />
        <Newsletter />
      </div>
    </PageLayout>
  );
}
