import PageLayout from "@/components/PageLayout";
import CollectionCards from "@/components/collection-cards";
import ReviewCarousel from "@/components/review-carousel";
import SocialProof from "@/components/social-proof";
import Newsletter from "@/components/newsletter";
import Hero from "./hero";
import ValuesStrip from "./values-strip";
import FeaturedProducts from "./featured-products";
import CraftBand from "./craft-band";
import BrandStory from "./brand-story";
import ClosingCta from "./closing-cta";

// "Conversion Hybrid" — stacks the strongest single lever from each sibling
// branch instead of picking one:
//   - clarity (editorial-split): split hero, left-aligned editorial heading
//     on FeaturedProducts
//   - trust (quiet-commerce): claim-safe ValuesStrip right under the hero,
//     visible focus rings on every CTA
//   - rhythm (warm-immersive): a dark CraftBand pause and a repeated
//     ClosingCta before Newsletter, so the one primary action recurs without
//     ever reading as a new claim
// Ported from branch design/conversion-hybrid.
export default function ConversionHybridPage() {
  return (
    <PageLayout noStyling>
      <Hero />
      <ValuesStrip />
      <div className="space-y-0">
        <FeaturedProducts />
        <CraftBand />
        <BrandStory />
        <CollectionCards />
        <ReviewCarousel />
        <SocialProof />
        <ClosingCta />
        <Newsletter />
      </div>
    </PageLayout>
  );
}
