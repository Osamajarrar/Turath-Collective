import { useState, useMemo } from "react";
import { useLocation, Link } from "wouter";
import Navbar from "@/components/navbar";
import { motion, AnimatePresence } from "framer-motion";
import { Filter, X, ChevronDown, Star } from "lucide-react";
import img1 from "@/assets/product-bowl-1.png";

export const ALL_PRODUCTS = [
  { 
    id: 1, 
    name: "Indigo Mosaic Bowl", 
    category: "ceramics", 
    price: 45, 
    image: img1,
    rating: 4.8,
    reviews: 24,
    isBestSeller: true,
    isNew: false,
    isLimited: false,
    dateAdded: "2024-01-15"
  },
  { 
    id: 2, 
    name: "Olive Tree Embroidery", 
    category: "embroidery", 
    price: 120, 
    image: img1,
    rating: 5.0,
    reviews: 12,
    isBestSeller: false,
    isNew: true,
    isLimited: true,
    dateAdded: "2024-02-10"
  },
  { 
    id: 3, 
    name: "Hebron Glass Vase", 
    category: "ceramics", 
    price: 65, 
    image: img1,
    rating: 4.5,
    reviews: 8,
    isBestSeller: false,
    isNew: false,
    isLimited: true,
    dateAdded: "2023-12-20"
  },
  { 
    id: 4, 
    name: "Tatreez Pattern Cushion", 
    category: "embroidery", 
    price: 85, 
    image: img1,
    rating: 4.9,
    reviews: 45,
    isBestSeller: true,
    isNew: false,
    isLimited: false,
    dateAdded: "2024-01-01"
  },
];

export default function ShopPage() {
  const [location] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  const initialCategory = searchParams.get("category") || "all";
  
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [sortBy, setSortBy] = useState("newest");

  const filteredAndSortedProducts = useMemo(() => {
    let result = selectedCategory === "all" 
      ? [...ALL_PRODUCTS] 
      : ALL_PRODUCTS.filter(p => p.category === selectedCategory);

    switch (sortBy) {
      case "price-low":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        result.sort((a, b) => b.price - a.price);
        break;
      case "best-seller":
        result.sort((a, b) => (b.isBestSeller ? 1 : 0) - (a.isBestSeller ? 1 : 0));
        break;
      case "highest-rated":
        result.sort((a, b) => b.rating - a.rating);
        break;
      case "newest":
      default:
        result.sort((a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime());
        break;
    }
    return result;
  }, [selectedCategory, sortBy]);

  return (
    <main className="min-h-screen bg-background pt-32">
      <Navbar />
      
      <div className="container mx-auto px-6 md:px-12 py-12">
        <header className="mb-16">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div>
              <h1 className="font-serif text-5xl md:text-6xl mb-6 capitalize">
                {selectedCategory === "all" ? "The Collection" : selectedCategory}
              </h1>
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
            </div>

            <div className="flex items-center gap-4">
              <span className="text-[10px] uppercase tracking-widest font-bold opacity-40">Sort By</span>
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent border-b border-border py-2 text-[10px] uppercase tracking-widest font-bold focus:outline-none focus:border-primary cursor-pointer"
              >
                <option value="newest">Newest</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="best-seller">Best Seller</option>
                <option value="highest-rated">Highest Rated</option>
              </select>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {filteredAndSortedProducts.map((product, idx) => (
            <Link href={`/product/${product.id}`} key={product.id}>
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="group cursor-pointer"
              >
                <div className="aspect-[4/5] overflow-hidden bg-muted mb-6 relative">
                  <img src={product.image} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  
                  {/* Badges */}
                  <div className="absolute top-4 left-4 flex flex-col gap-2">
                    {product.isBestSeller && (
                      <span className="bg-primary text-white text-[8px] uppercase tracking-widest font-bold px-3 py-1">Best Seller</span>
                    )}
                    {product.isNew && (
                      <span className="bg-black text-white text-[8px] uppercase tracking-widest font-bold px-3 py-1">New</span>
                    )}
                    {product.isLimited && (
                      <span className="bg-secondary text-secondary-foreground text-[8px] uppercase tracking-widest font-bold px-3 py-1">Limited Stock</span>
                    )}
                  </div>
                </div>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-serif text-xl">{product.name}</h3>
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 fill-primary text-primary" />
                    <span className="text-[10px] font-bold">{product.rating}</span>
                  </div>
                </div>
                <p className="text-xs uppercase tracking-widest text-muted-foreground mb-4">{product.category}</p>
                <p className="font-bold">CAD ${product.price}.00</p>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(" ");
}
