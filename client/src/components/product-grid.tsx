import { useState } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import vase1 from "@/assets/product-vase-1.png";
import vase2 from "@/assets/product-vase-2.png";
import bowl1 from "@/assets/product-bowl-1.png";
import bowl2 from "@/assets/product-bowl-2.png";
import cup1 from "@/assets/product-cup-1.png";
import cup2 from "@/assets/product-cup-2.png";

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
    name: "The Artisan Vase",
    price: "$120.00",
    image1: vase1,
    image2: vase2,
    badge: "Limited Drop",
  },
  {
    id: 2,
    name: "Heritage Serving Bowl",
    price: "$85.00",
    image1: bowl1,
    image2: bowl2,
  },
  {
    id: 3,
    name: "Daily Espresso Set",
    price: "$45.00",
    image1: cup1,
    image2: cup2,
    badge: "Sold Out",
  },
];

export default function ProductGrid() {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-6 md:px-12">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16">
          <h2 className="font-serif text-4xl md:text-5xl text-foreground">Curated Selection</h2>
          <a href="#" className="text-sm uppercase tracking-widest border-b border-foreground/20 pb-1 hover:border-foreground transition-colors mt-4 md:mt-0">
            View All Objects
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-16">
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
      <div className="relative aspect-[4/5] overflow-hidden bg-muted/20 mb-6">
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
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ease-in-out ${isHovered ? "opacity-0" : "opacity-100"}`}
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
