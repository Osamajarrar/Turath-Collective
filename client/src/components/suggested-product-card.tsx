import { Link } from "wouter";

interface DisplayProduct {
  id: string;
  handle: string;
  name: string;
  price: number;
  currencyCode: string;
  isBestSeller: boolean;
  variations: {
    color: string;
    images: string[];
  }[];
}

interface SuggestedProductCardProps {
  product: DisplayProduct;
}

export default function SuggestedProductCard({
  product,
}: SuggestedProductCardProps) {
  // Get images from first variation, or use placeholder
  const images = product.variations?.[0]?.images || [""];
  const primaryImage = images[0];

  return (
    <Link href={`/product/${product.handle}`}>
      <div
        className="group cursor-pointer flex-shrink-0 w-full"
        data-testid={`card-suggested-${product.id}`}
      >
        {/* Image Container */}
        <div className="relative mb-4 aspect-[4/5] overflow-hidden bg-[#f4f2ee]">
          <img
            src={primaryImage}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />

          {/* Badge */}
          {product.isBestSeller && (
            <div className="absolute left-4 top-4 pointer-events-none z-10">
              <div className="badge-product">Best Seller</div>
            </div>
          )}
        </div>

        {/* Card Content */}
        <div className="space-y-1">
          <h3 className="font-sans text-sm font-bold leading-tight text-foreground group-hover:text-primary transition-colors line-clamp-2">
            {product.name}
          </h3>
          <p className="text-xs text-foreground/60">
            ${product.price.toFixed(2)}
          </p>
        </div>
      </div>
    </Link>
  );
}
