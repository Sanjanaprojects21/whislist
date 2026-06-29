import "server-only";

import { FirecrawlAppV1 } from "@mendable/firecrawl-js";
import { z } from "zod";
import { categorizeProduct } from "./azure-openai";
import { type ProductCategory } from "./categories";
import { normalizeProductImageUrl } from "./product-image";

const ProductSchema = z.object({
  title: z.string(),
  image: z.string().optional().nullable(),
  images: z.array(z.string()).optional().nullable(),
  imageUrl: z.string().optional().nullable(),
  productImage: z.string().optional().nullable(),
  price: z.string().optional().nullable(),
  description: z.string().optional().nullable()
});
const ProductJsonSchema = {
  type: "object",
  properties: {
    title: { type: "string" },
    image: { type: "string" },
    images: { type: "array", items: { type: "string" } },
    imageUrl: { type: "string" },
    productImage: { type: "string" },
    price: { type: "string" },
    description: { type: "string" }
  },
  required: ["title"]
} as const;

export type ExtractedProduct = z.infer<typeof ProductSchema> & {
  category: ProductCategory;
};

export type ScrapedProduct = z.infer<typeof ProductSchema>;

function getFirecrawlApp() {
  const apiKey = process.env.FIRECRAWL_API_KEY;

  if (!apiKey) {
    throw new Error("FIRECRAWL_API_KEY is not configured.");
  }

  return new FirecrawlAppV1({ apiKey });
}

function isMeeshoUrl(url: string) {
  try {
    return new URL(url).hostname.includes("meesho.com");
  } catch {
    return false;
  }
}

export async function scrapeProduct(url: string): Promise<ScrapedProduct> {
  new URL(url);
  const useMeeshoScrapeSettings = isMeeshoUrl(url);

  const result = await getFirecrawlApp().scrapeUrl(url, {
    formats: ["extract"],
    ...(useMeeshoScrapeSettings
      ? {
          headers: {
            Accept:
              "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/png,image/jpeg,*/*;q=0.8",
            "Accept-Language": "en-IN,en;q=0.9",
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36"
          },
          location: {
            country: "IN",
            languages: ["en-IN", "en"]
          },
          mobile: false,
          proxy: "stealth" as const,
          waitFor: 3000
        }
      : {}),
    extract: {
      schema: ProductJsonSchema as never,
      prompt:
        "Extract the dress/product title, main product image URL, all visible product image URLs, price, and a concise product description from this ecommerce product page. For Meesho pages, prefer the large main clothing image URL, including AVIF or WebP image URLs from images.meesho.com when available. Do not return icons, logos, placeholders, sprites, or tiny thumbnails."
    }
  });

  if ("success" in result && result.success === false) {
    throw new Error(result.error || "Firecrawl failed to scrape the product page.");
  }

  const product = ProductSchema.parse(result.extract);

  if (/access\s+denied/i.test(product.title)) {
    throw new Error("Meesho returned an Access Denied page instead of product details. Try again in a minute.");
  }

  const imageCandidates = [
    product.image,
    product.imageUrl,
    product.productImage,
    ...(product.images ?? [])
  ];
  const image = imageCandidates
    .map((candidate) => normalizeProductImageUrl(candidate, url))
    .find((candidate): candidate is string => Boolean(candidate));

  return {
    ...product,
    image
  };
}

export async function extractDress(url: string): Promise<ExtractedProduct> {
  const product = await scrapeProduct(url);
  const category = await categorizeProduct(product);

  return {
    ...product,
    category
  };
}
