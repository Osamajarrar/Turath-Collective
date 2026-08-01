import PageLayout from "@/components/PageLayout";
import FeaturedProducts from "@/components/featured-products";
import CollectionCards from "@/components/collection-cards";
import BrandStory from "@/components/brand-story";
import ReviewCarousel from "@/components/review-carousel";
import SocialProof from "@/components/social-proof";
import Newsletter from "@/components/newsletter";
import Hero from "./hero";

// "Object First" — the hero leads with the object itself rather than a scene:
// a single product shot, a short supporting line, and a secondary browse CTA.
// Ported from branch design/object-first.
export default function ObjectFirstPage() {
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
