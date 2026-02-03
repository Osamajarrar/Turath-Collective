import { useState } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

// Import real product assets
import burgundyBowl from "@/assets/burgundy_bowl_1770124696039.png";
import burgundyMezze from "@/assets/burgundy_mezze_1770124696040.png";
import burgundyMug from "@/assets/burgundy_mug_1770124696041.png";
import burgundyOliveSet from "@/assets/burgundy_olive_set_1770124696041.png";
import classicBowl from "@/assets/classic_bowl_1770124706114.png";
import classicMezze from "@/assets/classic_mezze_plate_1770124706115.png";
import classicMug from "@/assets/classic_mug_1770124706116.png";
import classicSet from "@/assets/classic_1770124706117.png";

interface Product {
  id: number;
  name: string;
  price: string;
  image1: string;
  image2: string;
  badge?: string;
}

const products: Product[] = [
  {
    id: 1,
    name: "Classic Indigo Mug",
    price: "$38.00",
    image1: classicMug,
    image2: classicSet,
    badge: "Limited Drop",
  },
  {
    id: 2,
    name: "Burgundy Hand-Painted Bowl",
    price: "$52.00",
    image1: burgundyBowl,
    image2: burgundyMezze,
  },
  {
    id: 3,
    name: "Classic Indigo Mezze",
    price: "$45.00",
    image1: classicMezze,
    image2: classicSet,
    badge: "Sold Out",
  },
  {
    id: 4,
    name: "Burgundy Heritage Mug",
    price: "$38.00",
    image1: burgundyMug,
    image2: burgundyOliveSet,
  },
  {
    id: 5,
    name: "Indigo Heritage Bowl",
    price: "$52.00",
    image1: classicBowl,
    image2: classicSet,
  },
  {
    id: 6,
    name: "Burgundy Mezze Set",
    price: "$48.00",
    image1: burgundyMezze,
    image2: burgundyOliveSet,
  },
];

export default function ProductGrid() {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-6 md:px-12">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16">
          <div>
            <span className="text-xs uppercase tracking-[0.3em] text-primary mb-2 block font-medium">The Collection</span>
            <h2 className="font-serif text-4xl md:text-5xl text-foreground">Hand-Painted Heritage</h2>
          </div>
          <a href="#" className="text-sm uppercase tracking-widest border-b border-foreground/20 pb-1 hover:border-foreground transition-colors mt-4 md:mt-0">
            View All Objects
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ProductCard({ product }: { product: Product }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="group cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-[#f4f2ee] mb-6">
        {product.badge && (
          <Badge 
            variant="secondary" 
            className="absolute top-4 left-4 z-20 bg-secondary text-secondary-foreground text-[10px] uppercase tracking-widest px-3 py-1 rounded-none border-none font-medium"
          >
            {product.badge}
          </Badge>
        )}
        
        <img
          src={product.image1}
          alt={product.name}
          className={`absolute inset-0 w-full h-full object-contain p-8 transition-opacity duration-700 ease-in-out ${isHovered ? "opacity-0" : "opacity-100"}`}
        />
        <img
          src={product.image2}
          alt={`${product.name} detail`}
          className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-in-out scale-105 ${isHovered ? "opacity-100 scale-100" : "opacity-0"}`}
        />
      </div>

      <div className="flex flex-col space-y-1">
        <div className="flex justify-between items-baseline">
          <h3 className="font-serif text-xl text-foreground group-hover:text-primary transition-colors duration-300">
            {product.name}
          </h3>
          <span className="font-sans text-sm font-medium text-foreground/70">{product.price}</span>
        </div>
        <p className="text-xs text-muted-foreground uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
          Quick Add +
        </p>
      </div>
    </motion.div>
  );
}
