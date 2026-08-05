// The homepage composition that was live until Golden Hour Immersive was
// promoted to the default. Kept as a preview so the two can still be compared.
import { useTranslation } from "react-i18next";
import PageLayout from "@/components/PageLayout";
import Hero from "./hero";
import FeaturedProducts from "@/components/featured-products";
import CollectionCards from "@/components/collection-cards";
import BrandStory from "./brand-story";
import ReviewCarousel from "@/components/review-carousel";
import SocialProof from "@/components/social-proof";
import Newsletter from "@/components/newsletter";

export default function OriginalPage() {
  const { t } = useTranslation();

  return (
    <PageLayout noStyling>
      <Hero />
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
