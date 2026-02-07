import { motion } from "framer-motion";
import { Instagram } from "lucide-react";
import img1 from "@/assets/social-1.png";
import img2 from "@/assets/social-2.png";
import img3 from "@/assets/social-3.png";

const socialPosts = [
  { username: "@layla_designs", image: img1 },
  { username: "@marwan_ab", image: img2 },
  { username: "@thecuratedhome", image: img3 },
  { username: "@heritage_vibe", image: img1 },
  { username: "@ceramic_love", image: img2 }
];

export default function SocialProof() {
  return (
    <section className="py-32 bg-background border-t border-border">
      <div className="container mx-auto px-6 md:px-12 mb-16 flex flex-col md:flex-row justify-between items-end gap-6">
        <div>
          <span className="text-[10px] uppercase tracking-[0.4em] text-primary mb-4 block font-bold">Community</span>
          <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl text-foreground">Share your #TurathCollective</h2>
        </div>
        <a href="https://instagram.com" className="flex items-center gap-3 group">
          <Instagram className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
          <span className="text-[10px] uppercase tracking-[0.2em] font-bold border-b border-primary/20 pb-1 group-hover:border-primary transition-all">Follow us on Instagram</span>
        </a>
      </div>

      <div className="flex overflow-hidden gap-6 group">
        <motion.div 
          animate={{ x: [0, -1035] }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="flex gap-6 shrink-0"
        >
          {[...socialPosts, ...socialPosts].map((post, idx) => (
            <div key={idx} className="relative w-72 md:w-80 aspect-[4/5] overflow-hidden group/item">
              <img 
                src={post.image} 
                alt={`Social post by ${post.username}`} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover/item:scale-110"
              />
              <div className="absolute inset-0 bg-black/0 group-hover/item:bg-black/40 transition-all duration-500 flex items-center justify-center opacity-0 group-hover/item:opacity-100">
                <div className="text-center text-white">
                  <p className="text-xs font-bold tracking-widest uppercase mb-2">{post.username}</p>
                  <Instagram className="w-5 h-5 mx-auto" />
                </div>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
