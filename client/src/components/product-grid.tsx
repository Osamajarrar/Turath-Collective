import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";

// Ceramics
import burgundyBowl from "@/assets/burgundy-bowl.png";
import burgundyMezze from "@/assets/burgundy-mezze.png";
import classicBowl from "@/assets/classic-bowl.png";
import classicSet from "@/assets/classic.png";

// Embroidery
import embroideryDetail from "@/assets/embroidery.jpg";
import embroideryLifestyle from "@/assets/embroidery.jpg";

const ceramics = [
  { id: 1, name: "Indigo Heritage Mug", price: "$38.00", image1: classicSet, image2: classicSet },
  { id: 2, name: "Burgundy Hand-Painted Bowl", price: "$52.00", image1: burgundyBowl, image2: burgundyMezze },
  { id: 5, name: "Indigo Heritage Bowl", price: "$52.00", image1: classicBowl, image2: classicSet },
];

const embroidery = [
  { id: 7, name: "Heritage Cross-Stitch Cushion", price: "$145.00", image1: embroideryDetail, image2: embroideryLifestyle, badge: "Artisan Piece" },
  { id: 8, name: "Traditional Red Table Runner", price: "$180.00", image1: embroideryDetail, image2: embroideryLifestyle },
  { id: 9, name: "Modern Tatreez Linen Set", price: "$95.00", image1: embroideryDetail, image2: embroideryLifestyle, badge: "New Arrival" },
];

export default function ProductGrid() {
  const [activeTab, setActiveTab] = useState("ceramics");

  return (
    <section className="py-12 bg-background">
      <div className="container mx-auto px-6 md:px-12">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
          <div>
            <span className="text-[10px] uppercase tracking-[0.4em] text-primary mb-4 block font-bold">Explore the Collections</span>
            <div className="flex gap-8">
              <button 
                onClick={() => setActiveTab("ceramics")}
                className={cn("font-serif font-bold text-3xl md:text-4xl transition-all", activeTab === "ceramics" ? "text-foreground opacity-100" : "text-foreground/30 hover:opacity-100")}
              >
                Ceramics
              </button>
              <button 
                onClick={() => setActiveTab("embroidery")}
                className={cn("font-serif font-bold text-3xl md:text-4xl transition-all", activeTab === "embroidery" ? "text-foreground opacity-100" : "text-foreground/30 hover:opacity-100")}
              >
                Embroidery
              </button>
            </div>
          </div>
          <Link href="/shop" className="text-[10px] uppercase tracking-[0.2em] border-b border-foreground/20 pb-1 hover:border-foreground transition-all font-bold">
            Shop Everything
          </Link>
        </div>

        <motion.div 
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-20"
        >
          {(activeTab === "ceramics" ? ceramics : embroidery).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function ProductCard({ product }: any) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Link href={`/product/${product.id}`}>
      <motion.div className="group cursor-pointer" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
        <div className="relative aspect-[4/5] overflow-hidden bg-[#F4F2EE] mb-8">
          {product.badge && (
            <Badge className="absolute top-6 left-6 z-20 bg-background text-foreground text-[10px] uppercase tracking-widest px-4 py-1.5 rounded-[5px] border-none font-bold shadow-sm">
              {product.badge}
            </Badge>
          )}
          <img src={product.image1} alt={product.name} className={cn("absolute inset-0 w-full h-full object-contain p-12 transition-all duration-1000", isHovered ? "opacity-0 scale-105" : "opacity-100 scale-100")} />
          <img src={product.image2} alt={product.name} className={cn("absolute inset-0 w-full h-full object-cover transition-all duration-1000", isHovered ? "opacity-100 scale-100" : "opacity-0 scale-110")} />
        </div>
        <div className="space-y-2">
          <div className="flex justify-between items-baseline">
            <h3 className="font-sans text-base md:text-lg font-bold leading-tight text-foreground group-hover:text-primary transition-colors">{product.name}</h3>
            <span className="font-sans text-xs font-bold text-foreground/50 tracking-wider">{product.price}</span>
          </div>
          <div className="w-0 group-hover:w-full h-px bg-primary transition-all duration-500 opacity-30" />
        </div>
      </motion.div>
    </Link>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(" ");
}
