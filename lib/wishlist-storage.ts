export type SavedWishlistProduct = {
  id: string;
  title: string;
  url: string;
  category: string;
  image?: string | null;
  price?: string | null;
  description?: string | null;
  savedAt: string;
};

const STORAGE_KEY = "wishlist.products";

export function getSavedWishlistProducts(): SavedWishlistProduct[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    return value ? (JSON.parse(value) as SavedWishlistProduct[]) : [];
  } catch {
    return [];
  }
}

export function saveWishlistProduct(product: Omit<SavedWishlistProduct, "id" | "savedAt">) {
  if (typeof window === "undefined") {
    return;
  }

  const savedProducts = getSavedWishlistProducts();
  const nextProduct: SavedWishlistProduct = {
    ...product,
    id: crypto.randomUUID(),
    savedAt: new Date().toISOString()
  };
  const withoutDuplicate = savedProducts.filter((savedProduct) => savedProduct.url !== product.url);

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify([nextProduct, ...withoutDuplicate]));
  window.dispatchEvent(new Event("wishlist-products-updated"));
}
