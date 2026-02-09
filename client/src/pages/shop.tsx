import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import Navbar from "@/components/navbar";
import { motion, AnimatePresence } from "framer-motion";
import { Filter, X } from "lucide-react";
import img1 from "@/assets/product-bowl-1.png";

const ALL_PRODUCTS = [
  { id: 1, name: "Indigo Mosaic Bowl", category: "ceramics", price: 45, image: img1 },
  { id: 2, name: "Olive Tree Embroidery", category: "embroidery", price: 120, image: img1 },
  { id: 3, name: "Hebron Glass Vase", category: "ceramics", price: 65, image: img1 },
  { id: 4, name: "Tatreez Pattern Cushion", category: "embroidery", price: 85, image: img1 },
];

export default function ShopPage() {
  const [location] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  const initialCategory = searchParams.get("category") || "all";
  
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);

  const filteredProducts = useMemo(() => {
    if (selectedCategory === "all") return ALL_PRODUCTS;
    return ALL_PRODUCTS.filter(p => p.category === selectedCategory);
  }, [selectedCategory]);

  return (
    <main className="min-h-screen bg-background pt-32">
      <Navbar />
      
      <div className="container mx-auto px-6 md:px-12 py-12">
        <header className="mb-16">
          <h1 className="font-serif text-5xl md:text-6xl mb-6 capitalize">{selectedCategory === "all" ? "The Collection" : selectedCategory}</h1>
          <div className="flex flex-wrap gap-4">
            {["all", "ceramics", "embroidery"].map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  "px-6 py-2 text-[10px] uppercase tracking-widest font-bold border transition-all",
                  selectedCategory === cat ? "bg-primary text-white border-primary" : "border-border hover:border-primary"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {filteredProducts.map((product, idx) => (
            <motion.div 
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="group cursor-pointer"
            >
              <div className="aspect-[4/5] overflow-hidden bg-muted mb-6">
                <img src={product.image} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
              </div>
              <h3 className="font-serif text-xl mb-2">{product.name}</h3>
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-4">{product.category}</p>
              <p className="font-bold">CAD ${product.price}.00</p>
            </motion.div>
          ))}
        </div>
      </div>
    </main>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(" ");
}
