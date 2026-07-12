// Renders REAL, manually curated posts from the Shopify shop metafield
// `custom.social_feed` whenever any exist — the founder adds entries through
// Shopify admin without a redeploy (see shopifyService.getSocialFeed).
//
// PLACEHOLDER CONTENT below — fake social posts for layout preview only,
// gated by VITE_SHOW_PLACEHOLDER_CONTENT (must NEVER be set in Vercel).
// Real metafield entries take precedence over the placeholder regardless of
// that flag. See plans/07-placeholder-gating.md.

import img1 from "@/assets/social-1.png";
import img2 from "@/assets/social-2.png";
import img3 from "@/assets/social-3.png";
import { motion, useMotionValue } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { shopifyService, SocialFeedEntry } from "@/lib/shopify";

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

// ── Real curated feed (from the shop metafield) ──────────────────────────────

function SectionHeader() {
  const { t } = useTranslation("common");
  return (
    <div className="container mx-auto px-6 md:px-12 max-w-[1820px] mb-16 flex flex-col md:flex-row justify-between items-end gap-6">
      <div>
        <span className="text-[10px] uppercase tracking-[0.4em] text-primary mb-4 block font-bold">
          {t("socialProof.badge")}
        </span>
        <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl text-foreground">
          {t("socialProof.heading")}
        </h2>
      </div>
      <div className="flex items-center gap-8">
        <a
          href="https://www.instagram.com/turathcollective"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] uppercase tracking-[0.3em] font-bold border-b border-primary/20 pb-1 hover:border-primary transition-all text-primary"
          aria-label="Instagram"
        >
          {t("socialProof.instagram")}
        </a>
      </div>
    </div>
  );
}

function RealSocialFeed({ posts }: { posts: SocialFeedEntry[] }) {
  return (
    <section
      className="py-12 bg-background border-t border-border"
      data-testid="section-real-social-feed"
    >
      <SectionHeader />
      <div className="container mx-auto px-6 md:px-12 max-w-[1820px]">
        <div className="flex flex-wrap justify-center gap-6">
          {posts.map((post, idx) => {
            const card = (
              <div className="relative w-72 md:w-80">
                <div className="aspect-[4/5] overflow-hidden group/item relative">
                  <img
                    src={post.imageUrl}
                    alt={post.caption || post.handle || "Shared photo"}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover/item:scale-105"
                  />
                </div>
                {(post.handle || post.caption) && (
                  <div className="pt-3 space-y-1">
                    {post.handle && (
                      <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-primary">
                        {post.handle}
                      </p>
                    )}
                    {post.caption && (
                      <p className="text-sm text-foreground/60 font-light leading-relaxed">
                        {post.caption}
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
            return post.link ? (
              <a
                key={idx}
                href={post.link}
                target="_blank"
                rel="noopener noreferrer"
                className="block hover:opacity-90 transition-opacity"
              >
                {card}
              </a>
            ) : (
              <div key={idx}>{card}</div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default function SocialProof() {
  const repeatedPosts = Array.from({ length: 12 }, () => socialPosts).flat();
  const x = useMotionValue(0);
  const [isDragging, setIsDragging] = useState(false);
  const isDraggingRef = useRef(false);
  const currentXRef = useRef(0);
  // null = still loading / no real content; entries = founder-curated feed
  const [realPosts, setRealPosts] = useState<SocialFeedEntry[] | null>(null);

  // TODO: these are placeholder Instagram posts with fake usernames, for
  // structural testing only. Replace `socialPosts` above with a real
  // Instagram embed or real customer posts, then remove this guard. Never
  // let this render with fake community content once ad traffic starts.
  const showPlaceholder = import.meta.env.VITE_SHOW_PLACEHOLDER_CONTENT === "true";

  // Load the founder-curated feed from the shop metafield.
  useEffect(() => {
    let cancelled = false;
    shopifyService
      .getSocialFeed()
      .then((entries) => {
        if (!cancelled && entries) setRealPosts(entries);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

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

  // Real curated content exists: show it, regardless of the placeholder flag.
  if (realPosts && realPosts.length > 0) {
    return <RealSocialFeed posts={realPosts} />;
  }

  // No real content: render nothing unless the dev-only placeholder gate is on.
  if (!showPlaceholder) return null;

  return (
    <section className="py-12 bg-background border-t border-border">
      <SectionHeader />

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
                    <p className="text-[10px] font-bold tracking-[0.2em] uppercase mb-2">
                      {post.username}
                    </p>
                    <svg
                      className="w-4 h-4 mx-auto"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                    </svg>
                  </div>
                </div>
              </div>
              {/* Mobile username display */}
              <div className="md:hidden pt-3">
                <p
                  className="text-[10px] font-bold tracking-[0.2em] uppercase text-primary"
                >
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