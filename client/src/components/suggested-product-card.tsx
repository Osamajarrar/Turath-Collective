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
        <div className="relative mb-5 aspect-[4/5] overflow-hidden bg-muted/40 rounded-md">
          <img
            src={primaryImage}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
            width={400}
            height={500}
            loading="lazy"
            decoding="async"
          />

          {/* Badge */}
          {product.isBestSeller && (
            <div className="absolute left-3 top-3 pointer-events-none z-10">
              <div className="badge-product">Best Seller</div>
            </div>
          )}
        </div>

        {/* Card Content */}
        <div className="space-y-1.5 px-0.5">
          <h3 className="font-serif text-base leading-snug text-foreground group-hover:text-primary transition-colors line-clamp-2">
            {product.name}
          </h3>
          <p className="font-sans text-sm text-foreground/60">
            ${product.price.toFixed(2)} {product.currencyCode}
          </p>
        </div>
      </div>
    </Link>
  );
}
