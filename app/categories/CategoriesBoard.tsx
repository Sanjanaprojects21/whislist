"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { ChevronDown, ExternalLink, Loader2, Sparkles, X } from "lucide-react";
import { PRODUCT_CATEGORIES } from "../../lib/categories";
import { getProductImageDisplaySrc, normalizeProductImageUrl } from "../../lib/product-image";
import { getSavedWishlistProducts, type SavedWishlistProduct } from "../../lib/wishlist-storage";

function SavedProductImage({ image, productUrl }: { image?: string | null; productUrl: string }) {
  const [imageFailed, setImageFailed] = useState(false);
  const normalizedImage = normalizeProductImageUrl(image, productUrl);

  if (!normalizedImage || imageFailed) {
    return <div className="productImageFallback" />;
  }

  return <img src={getProductImageDisplaySrc(normalizedImage)} alt="" onError={() => setImageFailed(true)} />;
}

function ProductActions({
  product,
  onTrial
}: {
  product: SavedWishlistProduct;
  onTrial: (product: SavedWishlistProduct) => void;
}) {
  return (
    <details className="savedProductActions">
      <summary aria-label="Product actions">
        <ChevronDown size={16} />
      </summary>
      <div className="savedProductActionMenu">
        <a href={product.url} target="_blank" rel="noreferrer">
          <ExternalLink size={15} />
          <span>Open link</span>
        </a>
        <button type="button" onClick={() => onTrial(product)}>
          <Sparkles size={15} />
          <span>Try on model</span>
        </button>
      </div>
    </details>
  );
}

function TryOnDialog({
  product,
  onClose
}: {
  product: SavedWishlistProduct;
  onClose: () => void;
}) {
  const [modelImage, setModelImage] = useState<File | null>(null);
  const [resultImage, setResultImage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const productImageUrl = normalizeProductImageUrl(product.image, product.url);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setResultImage("");

    if (!modelImage) {
      setError("Upload a model image first.");
      return;
    }

    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("productTitle", product.title);
      formData.append("productDescription", product.description || "");
      formData.append("productUrl", product.url);
      formData.append("productImageUrl", productImageUrl || "");
      formData.append("modelImage", modelImage);

      const response = await fetch("/api/try-on", {
        method: "POST",
        body: formData
      });
      const data = (await response.json()) as { image?: string; error?: string };

      if (!response.ok || !data.image) {
        throw new Error(data.error || "Unable to create try-on image.");
      }

      setResultImage(data.image);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to create try-on image.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="tryOnOverlay" role="dialog" aria-modal="true" aria-labelledby="try-on-title">
      <div className="tryOnPanel">
        <div className="tryOnHeader">
          <div>
            <p className="eyebrow">Virtual try on</p>
            <h2 id="try-on-title">Try on model</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Close try on">
            <X size={18} />
          </button>
        </div>

        <div className="tryOnProduct">
          <SavedProductImage image={productImageUrl} productUrl={product.url} />
          <div>
            <h3>{product.title}</h3>
            {product.price ? <p>{product.price}</p> : null}
          </div>
        </div>

        <form className="tryOnForm" onSubmit={handleSubmit}>
          <label>
            <span>1. Upload model image</span>
            <input
              type="file"
              accept="image/*"
              onChange={(event) => setModelImage(event.target.files?.[0] ?? null)}
              required
            />
          </label>

          <p className="tryOnHint">
            The saved scraped product image above is sent as the clothe image. If it is missing,
            the server will scrape the product again and send that image file.
          </p>

          {error ? <p className="tryOnError">{error}</p> : null}

          <button className="primaryButton tryOnSubmit" type="submit" disabled={isLoading}>
            {isLoading ? <Loader2 className="spinIcon" size={18} /> : <Sparkles size={18} />}
            <span>{isLoading ? "Creating" : "Generate try on"}</span>
          </button>
        </form>

        {resultImage ? (
          <div className="tryOnResult">
            <img src={resultImage} alt="Generated try on result" />
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default function CategoriesBoard() {
  const [products, setProducts] = useState<SavedWishlistProduct[]>([]);
  const [tryOnProduct, setTryOnProduct] = useState<SavedWishlistProduct | null>(null);

  useEffect(() => {
    function loadProducts() {
      setProducts(getSavedWishlistProducts());
    }

    loadProducts();
    window.addEventListener("storage", loadProducts);
    window.addEventListener("wishlist-products-updated", loadProducts);

    return () => {
      window.removeEventListener("storage", loadProducts);
      window.removeEventListener("wishlist-products-updated", loadProducts);
    };
  }, []);

  const groupedProducts = useMemo(
    () =>
      PRODUCT_CATEGORIES.map((category) => ({
        category,
        products: products.filter((product) => product.category === category)
      })),
    [products]
  );

  return (
    <>
      <div className="categoryBoard">
        {groupedProducts.map(({ category, products: categoryProducts }) => (
          <section className="categoryColumn" aria-labelledby={`${category}-title`} key={category}>
            <div className="categoryColumnHeader">
              <h2 id={`${category}-title`}>{category}</h2>
              <span>{categoryProducts.length}</span>
            </div>

            {categoryProducts.length ? (
              <div className="savedProductList">
                {categoryProducts.map((product) => (
                  <article className="savedProductCard" key={product.id}>
                    <SavedProductImage image={product.image} productUrl={product.url} />
                    <div>
                      <h3>{product.title}</h3>
                      {product.price ? <p>{product.price}</p> : null}
                    </div>
                    <ProductActions product={product} onTrial={setTryOnProduct} />
                  </article>
                ))}
              </div>
            ) : (
              <p className="emptyCategory">No saved products yet.</p>
            )}
          </section>
        ))}
      </div>

      {tryOnProduct ? <TryOnDialog product={tryOnProduct} onClose={() => setTryOnProduct(null)} /> : null}
    </>
  );
}
