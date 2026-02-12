import { Instagram } from "lucide-react";
import img1 from "@/assets/social-1.png";
import img2 from "@/assets/social-2.png";
import img3 from "@/assets/social-3.png";
import { motion, useMotionValue } from "framer-motion";
import { useState, useEffect, useRef } from "react";

const socialPosts = [
  { username: "@layla_designs", image: img1 },
  { username: "@marwan_ab", image: img2 },
  { username: "@thecuratedhome", image: img3 },
  { username: "@heritage_vibe", image: img1 },
  { username: "@ceramic_love", image: img2 },
  { username: "@artisan_daily", image: img3 }
];

const ITEM_WIDTH = 320;
const TOTAL_WIDTH = ITEM_WIDTH * 72;

export default function SocialProof() {
  const repeatedPosts = Array.from({ length: 12 }, () => socialPosts).flat();
  const x = useMotionValue(0);
  const [isDragging, setIsDragging] = useState(false);
  const isDraggingRef = useRef(false);
  const currentXRef = useRef(0);

  useEffect(() => {
    isDraggingRef.current = isDragging;
  }, [isDragging]);

  useEffect(() => {
    let animationFrame: number;

    const animate = () => {
      // Always run animation, even while dragging
      if (!isDraggingRef.current) {
        currentXRef.current -= 2;
        if (currentXRef.current <= -TOTAL_WIDTH) {
          currentXRef.current = 0;
        }
        x.set(currentXRef.current);
      }
      animationFrame = requestAnimationFrame(animate);
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, []);

  return (
    <section className="py-32 bg-background border-t border-border">
      <div className="container mx-auto px-6 md:px-12 mb-16 flex flex-col md:flex-row justify-between items-end gap-6">
        <div>
          <span className="text-[10px] uppercase tracking-[0.4em] text-primary mb-4 block font-bold">Community</span>
          <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl text-foreground">Share your #TurathCollective</h2>
        </div>
        <div className="flex items-center gap-8">
          <a href="https://instagram.com" className="flex items-center gap-3 group">
            <Instagram className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
            <span className="text-[10px] uppercase tracking-[0.2em] font-bold border-b border-primary/20 pb-1 group-hover:border-primary transition-all">Follow</span>
          </a>
        </div>
      </div>

      <div className="relative group/carousel overflow-hidden">
        <motion.div 
          style={{ x }}
          drag="x"
          dragElastic={0.1}
          dragConstraints={{ left: -TOTAL_WIDTH, right: 0 }}
          dragMomentum={false}
          onDragStart={() => setIsDragging(true)}
          onDragEnd={(event, info) => {
            const currentX = x.get();
            const newX = currentX + info.velocity.x * 0.1;
            const constrainedX = Math.max(-TOTAL_WIDTH, Math.min(0, newX));
            x.set(constrainedX);
            currentXRef.current = constrainedX;
            setIsDragging(false);
          }}
          className="flex gap-6 px-6 md:px-12 cursor-grab active:cursor-grabbing w-fit"
        >
          {/* Seamlessly repeating items */}
          {repeatedPosts.map((post, idx) => (
            <div key={idx} className="relative w-72 md:w-80 shrink-0">
              <div className="aspect-[4/5] overflow-hidden group/item relative">
                <img 
                  src={post.image} 
                  alt={`Social post by ${post.username}`} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover/item:scale-110"
                />
                <div className="absolute inset-0 bg-black/20 group-hover/item:bg-black/40 transition-all duration-500 flex items-center justify-center hidden md:flex md:opacity-0 md:group-hover/item:opacity-100">
                  <div className="text-center text-white">
                    <p className="text-[10px] font-bold tracking-[0.2em] uppercase mb-2">{post.username}</p>
                    <Instagram className="w-4 h-4 mx-auto" />
                  </div>
                </div>
              </div>
              {/* Mobile username display */}
              <div className="md:hidden pt-3">
                <p className="text-[10px] font-bold tracking-[0.2em] uppercase" style={{ color: "hsl(0 81% 13%)" }}>
                  {post.username}
                </p>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
