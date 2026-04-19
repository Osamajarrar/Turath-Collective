import { useTranslation } from "react-i18next";
import { lazy, Suspense } from "react";
import PageLayout from "@/components/PageLayout";
import Hero from "@/components/hero";
import CollectionCards from "@/components/collection-cards";

// Lazy-load below-fold sections to reduce initial JS parsing
// These are not critical for FCP/LCP and can load after page is interactive
const StorySection = lazy(() => import("@/components/story-section"));
const Heritage = lazy(() => import("@/components/heritage"));
const ValuesSection = lazy(() => import("@/components/values-section"));
const Newsletter = lazy(() => import("@/components/newsletter"));

// Fallback component shown while lazy sections load
function SectionFallback() {
  return <div className="h-96 bg-gray-100 animate-pulse" />;
}

export default function Home() {
  const { t } = useTranslation();

  return (
    <PageLayout noStyling>
      <Hero />
      <div className="space-y-0">
        <CollectionCards />
        
        {/* Below-fold sections loaded asynchronously */}
        <Suspense fallback={<SectionFallback />}>
          <StorySection />
        </Suspense>
        
        <Suspense fallback={<SectionFallback />}>
          <ValuesSection />
        </Suspense>
        
        <Suspense fallback={<SectionFallback />}>
          <Heritage />
        </Suspense>

        {/* Newsletter at end - lowest priority */}
        <Suspense fallback={<SectionFallback />}>
          <Newsletter />
        </Suspense>
      </div>
    </PageLayout>
  );
}
