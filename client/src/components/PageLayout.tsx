import Navbar from "@/components/navbar";
import Footer from "@/components/footer";

export default function PageLayout({
  children,
  noPadding = false,
  paddingClass = "px-6 md:px-12 pt-36 pb-24",
}: {
  children: React.ReactNode;
  noPadding?: boolean;
  paddingClass?: string;
}) {
  return (
    <main className="min-h-screen bg-background selection:bg-primary/20 selection:text-primary">
      <Navbar />
      <div
        className={`container mx-auto max-w-[1820px] ${noPadding ? "" : paddingClass}`}
      >
        {children}
      </div>
      <Footer />
    </main>
  );
}
