import { NextResponse } from "next/server";
import { createVirtualTryOn } from "../../../lib/azure-image";
import { scrapeProduct } from "../../../lib/firecrawl";
import {
  imageContentTypeFromUrl,
  imageExtensionFromContentType,
  normalizeProductImageUrl
} from "../../../lib/product-image";

async function fileFromImageUrl(imageUrl: string) {
  const response = await fetch(imageUrl, {
    headers: {
      Accept: "image/avif,image/webp,image/png,image/jpeg,image/*;q=0.8,*/*;q=0.5",
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36"
    }
  });

  if (!response.ok) {
    throw new Error("Unable to download the product clothing image.");
  }

  const responseContentType = response.headers.get("content-type") || "";
  const contentType = responseContentType.startsWith("image/")
    ? responseContentType
    : imageContentTypeFromUrl(imageUrl) || "image/jpeg";

  if (!contentType.startsWith("image/")) {
    throw new Error("The product image URL did not return an image.");
  }

  const imageBlob = await response.blob();
  const extension = imageExtensionFromContentType(contentType);

  return new File([imageBlob], `product-clothing.${extension}`, { type: contentType });
}

function getRequiredFile(formData: FormData, key: string) {
  const value = formData.get(key);

  if (!(value instanceof File) || value.size === 0) {
    throw new Error(`${key} is required.`);
  }

  if (!value.type.startsWith("image/")) {
    throw new Error(`${key} must be an image.`);
  }

  return value;
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const productTitle = String(formData.get("productTitle") || "Clothing product").trim();
    const productDescription = String(formData.get("productDescription") || "").trim();
    const productUrl = String(formData.get("productUrl") || "").trim();
    const productImageUrl = String(formData.get("productImageUrl") || "").trim();
    const modelImage = getRequiredFile(formData, "modelImage");

    let normalizedImage = normalizeProductImageUrl(productImageUrl);
    let title = productTitle;
    let description = productDescription;

    if (!normalizedImage && productUrl) {
      const scrapedProduct = await scrapeProduct(productUrl);
      normalizedImage = normalizeProductImageUrl(scrapedProduct.image, productUrl);
      title = title || scrapedProduct.title;
      description = description || scrapedProduct.description || "";
    }

    if (!normalizedImage) {
      return NextResponse.json(
        { error: "Could not find a scraped clothing image for this product." },
        { status: 400 }
      );
    }

    const clothingImage = await fileFromImageUrl(normalizedImage);

    const image = await createVirtualTryOn({
      modelImage,
      clothingImage,
      productTitle: title,
      productDescription: description
    });

    return NextResponse.json({ image });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create try-on image.";
    const status = message.includes("required") || message.includes("must be") ? 400 : 500;

    return NextResponse.json({ error: message }, { status });
  }
}
