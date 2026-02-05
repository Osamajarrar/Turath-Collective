import { useState } from "react";
import { useRoute, Link } from "wouter";
import { motion } from "framer-motion";
import { ChevronLeft, Minus, Plus, ShoppingBag, Heart, Shield, Truck, RefreshCcw } from "lucide-react";
import Navbar from "@/components/navbar";
import { cn } from "@/lib/utils";

// Import real product assets from @assets alias
import burgundyBowl from "@assets/burgundy_bowl_1770124696039.png";
import burgundyMezze from "@assets/burgundy_mezze_1770124696040.png";
import burgundyMug from "@assets/burgundy_mug_1770124696041.png";
import burgundyOliveSet from "@assets/burgundy_olive_set_1770124696041.png";
import classicBowl from "@assets/classic_bowl_1770124706114.png";
import classicMezze from "@assets/classic_mezze_plate_1770124706115.png";
import classicMug from "@assets/classic_mug_1770124706116.png";
import classicSet from "@assets/classic_1770124706117.png";

const products = [
  { id: 1, name: "Classic Indigo Mug", price: 38.00, images: [classicMug, classicSet], description: "A hand-painted indigo mug inspired by traditional Palestinian motifs. Each stroke is a tribute to the craftsmen of Hebron.", details: "Dishwasher safe. Lead-free glaze. 350ml capacity." },
  { id: 2, name: "Burgundy Hand-Painted Bowl", price: 52.00, images: [burgundyBowl, burgundyMezze], description: "Rich burgundy tones meet organic clay. This bowl is designed for the modern table, rooted in ancient heritage.", details: "Hand-thrown in Hebron. Lead-free glaze. 18cm diameter." },
  { id: 3, name: "Classic Indigo Mezze", price: 45.00, images: [classicMezze, classicSet], description: "Perfect for serving olives, za'atar, or small delights. The indigo pattern reflects the timeless beauty of local flora.", details: "Hand-painted. Stackable design. 14cm diameter." },
  { id: 4, name: "Burgundy Heritage Mug", price: 38.00, images: [burgundyMug, burgundyOliveSet], description: "A companion for your slowest mornings. The warm burgundy glaze brings a sense of comfort to every ritual.", details: "Dishwasher safe. Lead-free. 350ml capacity." },
  { id: 5, name: "Indigo Heritage Bowl", price: 52.00, images: [classicBowl, classicSet], description: "A versatile vessel for soups, salads, or morning grains. The indigo rim adds a touch of classic elegance.", details: "Hand-thrown. Lead-free glaze. 18cm diameter." },
  { id: 6, name: "Burgundy Mezze Set", price: 48.00, images: [burgundyMezze, burgundyOliveSet], description: "An essential for the shared table. These small bowls invite connection and conversation over simple foods.", details: "Set of two. Hand-painted motifs. 12cm diameter." },
];

export default function ProductPage() {
  const [, params] = useRoute("/product/:id");
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  const product = products.find(p => p.id === Number(params?.id)) || products[0];

  return (
    <main className="min-h-screen bg-background pt-24 pb-12">
      <Navbar />
      
      <div className="container mx-auto px-6 md:px-12">
        {/* Breadcrumbs / Back */}
        <Link href="/">
          <button className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors mb-12 group">
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Collection
          </button>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
          {/* Gallery */}
          <div className="space-y-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="aspect-[4/5] bg-[#f4f2ee] overflow-hidden"
            >
              <img 
                src={product.images[selectedImage]} 
                alt={product.name}
                className="w-full h-full object-contain p-12 transition-transform duration-1000 hover:scale-105"
              />
            </motion.div>
            <div className="grid grid-cols-4 gap-4">
              {product.images.map((img, idx) => (
                <button 
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={cn(
                    "aspect-square bg-[#f4f2ee] p-4 transition-all border",
                    selectedImage === idx ? "border-primary" : "border-transparent opacity-60 hover:opacity-100"
                  )}
                >
                  <img src={img} alt="Thumbnail" className="w-full h-full object-contain" />
                </button>
              ))}
            </div>
          </div>

          {/* Details */}
          <div className="flex flex-col">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="text-xs uppercase tracking-[0.3em] text-primary font-bold mb-4 block">Hand-Painted Heritage</span>
              <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl text-foreground mb-4 leading-tight">
                {product.name}
              </h1>
              <p className="text-2xl font-sans font-medium text-foreground/80 mb-8">
                ${product.price.toFixed(2)}
              </p>
              
              <div className="space-y-6 mb-12 border-t border-border pt-8">
                <p className="text-lg text-foreground/70 font-light leading-relaxed">
                  {product.description}
                </p>
                <div className="bg-muted/30 p-4 border-l-2 border-primary italic text-sm text-foreground/80">
                  {product.details}
                </div>
              </div>

              {/* Purchase Actions */}
              <div className="space-y-6">
                <div className="flex items-center gap-8">
                  <div className="flex items-center border border-border">
                    <button 
                      onClick={() => setQuantity(q => Math.max(1, q - 1))}
                      className="p-4 hover:bg-muted transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-12 text-center font-medium">{quantity}</span>
                    <button 
                      onClick={() => setQuantity(q => q + 1)}
                      className="p-4 hover:bg-muted transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <button className="flex-1 bg-primary text-white py-4 flex items-center justify-center gap-3 uppercase tracking-widest text-sm font-medium hover:bg-primary/90 transition-all group">
                    <ShoppingBag className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    Add to Bag
                  </button>
                  <button className="p-4 border border-border hover:bg-muted transition-colors">
                    <Heart className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-2 gap-y-6 gap-x-12 mt-12 pt-12 border-t border-border">
                <div className="flex items-center gap-3">
                  <Truck className="w-5 h-5 text-muted-foreground" strokeWidth={1} />
                  <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Carbon Neutral Shipping</span>
                </div>
                <div className="flex items-center gap-3">
                  <RefreshCcw className="w-5 h-5 text-muted-foreground" strokeWidth={1} />
                  <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">14-Day Artisan Guarantee</span>
                </div>
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-muted-foreground" strokeWidth={1} />
                  <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Secure Global Checkout</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </main>
  );
}
