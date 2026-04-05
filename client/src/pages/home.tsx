import { useTranslation } from "react-i18next";
import PageLayout from "@/components/PageLayout";
import Hero from "@/components/hero";
import CollectionCards from "@/components/collection-cards";
import StorySection from "@/components/story-section";
import Heritage from "@/components/heritage";
import ValuesSection from "@/components/values-section";
import Newsletter from "@/components/newsletter";

export default function Home() {
  const { t } = useTranslation();

  return (
    <PageLayout noPadding>
      <Hero />
      <div className="space-y-0">
        <CollectionCards />
        <StorySection />
        <ValuesSection />
        <Heritage />
        {/* <ReviewCarousel /> */}
        {/* <SocialProof /> */}
        <Newsletter />
      </div>
    </PageLayout>
  );
}
