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
      <div className={noPadding ? "" : "pt-36 pb-24"}>{children}</div>
      <Footer />
    </main>
  );
}
