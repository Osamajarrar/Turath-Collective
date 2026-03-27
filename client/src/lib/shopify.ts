/**
 * Shopify Storefront API Service Wrapper
 * This service is designed to be easily swapped with the actual Shopify Storefront API.
 * Currently returns mock data for the frontend prototype.
 */

export interface Product {
  id: string;
  title: string;
  handle: string;
  description: string;
  priceRange: {
    minVariantPrice: {
      amount: string;
      currencyCode: string;
    };
  };
  images: {
    edges: Array<{
      node: {
        url: string;
        altText: string;
      };
    }>;
  };
  variants: {
    edges: Array<{
      node: {
        id: string;
        title: string;
        price: {
          amount: string;
          currencyCode: string;
        };
      };
    }>;
  };
}

export const shopifyService = {
  /**
   * Fetches all products from the collection
   * Replacement: Use Shopify Storefront API GraphQL query
   */
  async getProducts(): Promise<Product[]> {
    // Mocking a small delay for realism
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // In production, this would be:
    // const response = await fetch(SHOPIFY_STOREFRONT_API_URL, { ... });
    // const data = await response.json();
    // return data.products;
    
    return []; // Return empty for now as frontend uses its own local mock
  },

  /**
   * Fetches a single product by handle/id
   */
  async getProduct(handle: string): Promise<Product | null> {
    return null;
  },

  /**
   * Creates a checkout URL
   * Replacement: Use Shopify Storefront API checkoutCreate mutation
   */
  async createCheckout(variantId: string, quantity: number): Promise<string> {
    // In production:
    // const checkout = await client.checkout.create();
    // await client.checkout.addLineItems(checkout.id, [{ variantId, quantity }]);
    // return checkout.webUrl;
    return "/checkout";
  }
};
