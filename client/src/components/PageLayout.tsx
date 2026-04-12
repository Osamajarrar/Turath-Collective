import Navbar from "@/components/navbar";
import Footer from "@/components/footer";

export default function PageLayout({
  children,
  noPadding = false,
}: {
  children: React.ReactNode;
  noPadding?: boolean;
}) {
  return (
    <main className="min-h-screen bg-background selection:bg-primary/20 selection:text-primary">
      <Navbar />
      {noPadding ? (
        children
      ) : (
        <div className="pt-36 pb-24">
          <div className="container mx-auto px-6 md:px-12 max-w-[1820px]">
            {children}
          </div>
        </div>
      )}
      <Footer />
    </main>
  );
}
