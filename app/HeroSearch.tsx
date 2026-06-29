"use client";

import { FormEvent, useState } from "react";
import { ExternalLink, Loader2, Search } from "lucide-react";
import { getProductImageDisplaySrc, normalizeProductImageUrl } from "../lib/product-image";
import { saveWishlistProduct } from "../lib/wishlist-storage";

type ExtractedProduct = {
  title: string;
  image?: string | null;
  price?: string;
  description?: string | null;
  category?: string;
};

export default function HeroSearch() {
  const [url, setUrl] = useState("");
  const [productUrl, setProductUrl] = useState("");
  const [product, setProduct] = useState<ExtractedProduct | null>(null);
  const [error, setError] = useState("");
  const [savedMessage, setSavedMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setSavedMessage("");
    setProduct(null);
    setImageFailed(false);

    try {
      new URL(url);
    } catch {
      setError("Enter a valid product URL.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/extract-dress", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ url })
      });
      const data = (await response.json()) as {
        product?: ExtractedProduct;
        error?: string;
        stage?: string;
      };

      if (!response.ok || !data.product) {
        const message =
          data.stage === "scrape"
            ? "Scraping failed before category analysis. Check FIRECRAWL_API_KEY."
            : data.error || "Unable to extract product.";
        throw new Error(message);
      }

      const normalizedImage = normalizeProductImageUrl(data.product.image, url);
      const normalizedProduct = {
        ...data.product,
        image: normalizedImage
      };

      setProduct(normalizedProduct);
      setProductUrl(url);
      saveWishlistProduct({
        title: normalizedProduct.title,
        image: normalizedProduct.image,
        price: normalizedProduct.price,
        description: normalizedProduct.description,
        category: normalizedProduct.category || "Clothes",
        url
      });
      setSavedMessage(`Saved to ${normalizedProduct.category || "Clothes"}.`);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to extract product.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="heroProductSearch">
      <form className="heroSearch isExpanded" aria-label="Extract product from link" onSubmit={handleSubmit}>
        <button type="submit" aria-label="Extract product" disabled={isLoading}>
          {isLoading ? <Loader2 className="spinIcon" size={20} /> : <Search size={20} />}
        </button>
        <input
          type="url"
          placeholder="Paste clothing product link"
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          disabled={isLoading}
          required
        />
      </form>

      {error ? <p className="heroSearchMessage">{error}</p> : null}
      {savedMessage ? <p className="heroSaveMessage">{savedMessage}</p> : null}

      {product ? (
        <article className="productResult">
          {product.image && !imageFailed ? (
            <img src={getProductImageDisplaySrc(product.image)} alt="" onError={() => setImageFailed(true)} />
          ) : (
            <div className="productImageFallback" />
          )}
          <div>
            <p>Product found</p>
            <h3>{product.title}</h3>
            {product.price ? <span>{product.price}</span> : null}
            {product.category ? <span>{product.category}</span> : null}
          </div>
          <a href={productUrl} target="_blank" rel="noreferrer" aria-label="Open product page">
            <ExternalLink size={18} />
          </a>
        </article>
      ) : null}
      {product ? (
        <a className="categoryPageLink" href="/categories">
          View category
        </a>
      ) : null}
    </div>
  );
}
