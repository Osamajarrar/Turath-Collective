import { motion } from "framer-motion";
import Navbar from "@/components/navbar";

export default function GenericPage({ title }: { title: string }) {
  return (
    <main className="min-h-screen bg-background pt-36 pb-24">
      <Navbar />
      <div className="container mx-auto px-6 md:px-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="font-serif text-5xl mb-12">{title}</h1>
          <div className="prose prose-stone max-w-none space-y-6 text-muted-foreground font-light leading-relaxed">
            <p>At Turath Collective, we are committed to transparency and the preservation of Palestinian heritage. This page contains important information regarding our {title.toLowerCase()}.</p>
            <p>Our artisans in Hebron and across Palestine work tirelessly to bring you the highest quality craftsmanship. Every piece tells a story of resilience and tradition.</p>
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
            <h2 className="font-serif text-2xl text-foreground mt-12">Section Title</h2>
            <p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
          </div>
        </div>
      </div>
    </main>
  );
}
