import Navbar from "@/components/navbar";
import Footer from "@/components/footer";

export default function PageLayout({
  children,
  noStyling = false,
  paddingClass = "container mx-auto max-w-[1820px] px-6 md:px-12 pt-36 pb-24",
}: {
  children: React.ReactNode;
  noStyling?: boolean;
  paddingClass?: string;
}) {
  return (
    <main className="min-h-screen bg-background selection:bg-primary/20 selection:text-primary">
      <Navbar />
      <div
        className={`${noStyling ? "" : paddingClass}`}
      >
        {children}
      </div>
      <Footer />
    </main>
  );
}
