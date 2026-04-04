import { Link } from "wouter";
import { motion } from "framer-motion";
import PageLayout from "@/components/PageLayout";

export default function NotFound() {
  return (
    <PageLayout>
      <div className="container mx-auto px-6 md:px-12">
        <div className="max-w-2xl mx-auto text-center py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <h1 className="font-serif text-6xl md:text-7xl mb-6">404</h1>

            <p className="text-2xl md:text-3xl font-serif mb-4 text-foreground">
              Page Not Found
            </p>

            <p className="text-muted-foreground font-light leading-relaxed mb-12 max-w-md mx-auto">
              It seems this page has been lost in time. Let's get you back to
              exploring our collections.
            </p>

            <Link href="/">
              <button className="bg-primary text-white px-12 py-4 text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-primary/90 transition-colors">
                Return Home
              </button>
            </Link>
          </motion.div>
        </div>
      </div>
    </PageLayout>
  );
}