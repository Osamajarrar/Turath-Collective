import { ChevronLeft, ChevronRight, Instagram } from "lucide-react";
import img1 from "@/assets/social-1.png";
import img2 from "@/assets/social-2.png";
import img3 from "@/assets/social-3.png";
import { useRef } from "react";
import { motion } from "framer-motion";

const socialPosts = [
  { username: "@layla_designs", image: img1 },
  { username: "@marwan_ab", image: img2 },
  { username: "@thecuratedhome", image: img3 },
  { username: "@heritage_vibe", image: img1 },
  { username: "@ceramic_love", image: img2 },
  { username: "@artisan_daily", image: img3 }
];

export default function SocialProof() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === "left" ? scrollLeft - clientWidth : scrollLeft + clientWidth;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: "smooth" });
    }
  };

  return (
    <section className="py-32 bg-background border-t border-border">
      <div className="container mx-auto px-6 md:px-12 mb-16 flex flex-col md:flex-row justify-between items-end gap-6">
        <div>
          <span className="text-[10px] uppercase tracking-[0.4em] text-primary mb-4 block font-bold">Community</span>
          <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl text-foreground">Share your #TurathCollective</h2>
        </div>
        <div className="flex items-center gap-8">
          <div className="hidden md:flex gap-2">
            <button onClick={() => scroll("left")} className="p-2 border border-border hover:border-primary transition-colors"><ChevronLeft className="w-4 h-4"/></button>
            <button onClick={() => scroll("right")} className="p-2 border border-border hover:border-primary transition-colors"><ChevronRight className="w-4 h-4"/></button>
          </div>
          <a href="https://instagram.com" className="flex items-center gap-3 group">
            <Instagram className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
            <span className="text-[10px] uppercase tracking-[0.2em] font-bold border-b border-primary/20 pb-1 group-hover:border-primary transition-all">Follow</span>
          </a>
        </div>
      </div>

      <div className="relative group/carousel">
        <motion.div 
          ref={scrollRef}
          className="flex overflow-x-auto gap-6 px-6 md:px-12 no-scrollbar scroll-smooth snap-x snap-mandatory"
        >
          {/* Duplicating items for seamless marquee effect but with manual override */}
          {[...socialPosts, ...socialPosts, ...socialPosts].map((post, idx) => (
            <div key={idx} className="relative w-72 md:w-80 aspect-[4/5] overflow-hidden group/item shrink-0 snap-start">
              <img 
                src={post.image} 
                alt={`Social post by ${post.username}`} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover/item:scale-110"
              />
              <div className="absolute inset-0 bg-black/20 group-hover/item:bg-black/40 transition-all duration-500 flex items-center justify-center opacity-100 md:opacity-0 md:group-hover/item:opacity-100">
                <div className="text-center text-white">
                  <p className="text-[10px] font-bold tracking-[0.2em] uppercase mb-2">{post.username}</p>
                  <Instagram className="w-4 h-4 mx-auto" />
                </div>
              </div>
            </div>
          ))}
        </motion.div>
        
        {/* Animated Marquee Overlay logic simplified: keeping manual scroll behavior as primary but ensuring it feels dynamic */}
      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </section>
  );
}
