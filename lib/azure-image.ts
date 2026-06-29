import "server-only";

import sharp from "sharp";
import { imageExtensionFromContentType } from "./product-image";

type AzureImageResponse = {
  data?: Array<{
    b64_json?: string;
    url?: string;
  }>;
  error?: {
    code?: string;
    message?: string;
  };
  message?: string;
};

function getAzureImageConfig() {
  const apiKey = process.env.AZURE_OPENAI_API_KEY;
  const url = process.env.AZURE_OPENAI_IMAGE_EDITS_URL;

  if (!apiKey || !url) {
    throw new Error(
      "Azure image editing is not configured. Set AZURE_OPENAI_IMAGE_EDITS_URL and AZURE_OPENAI_API_KEY."
    );
  }

  return { apiKey, url };
}

function extensionFromType(type: string) {
  return imageExtensionFromContentType(type);
}

function dataUrlFromBase64(base64: string, mimeType = "image/png") {
  return `data:${mimeType};base64,${base64}`;
}

async function prepareImageForAzure(file: File, name: string) {
  const sourceBuffer = Buffer.from(await file.arrayBuffer());

  if (file.type.includes("avif") || file.type.includes("webp")) {
    const pngBuffer = await sharp(sourceBuffer).png().toBuffer();

    return new File([pngBuffer], `${name}.png`, { type: "image/png" });
  }

  return new File([sourceBuffer], `${name}.${extensionFromType(file.type)}`, { type: file.type });
}

export async function createVirtualTryOn({
  modelImage,
  clothingImage,
  productTitle,
  productDescription
}: {
  modelImage: File;
  clothingImage: File;
  productTitle: string;
  productDescription?: string | null;
}) {
  const config = getAzureImageConfig();
  const formData = new FormData();
  const preparedModelImage = await prepareImageForAzure(modelImage, "model");
  const preparedClothingImage = await prepareImageForAzure(clothingImage, "clothing");

  formData.append(
    "prompt",
    [
      "Create a realistic virtual try-on image.",
      "Use the first image as the model/person reference and preserve the model's face, identity, pose, skin tone, and body shape.",
      "Use the second image as the clothing/product reference and place that clothing naturally on the model.",
      "Keep the result photorealistic, ecommerce-ready, and free of text or watermarks.",
      `Product title: ${productTitle}`,
      productDescription ? `Product description: ${productDescription}` : null
    ]
      .filter(Boolean)
      .join(" ")
  );
  formData.append("image[]", preparedModelImage, preparedModelImage.name);
  formData.append("image[]", preparedClothingImage, preparedClothingImage.name);
  formData.append("size", "1024x1024");
  formData.append("n", "1");

  const response = await fetch(config.url, {
    method: "POST",
    headers: {
      "api-key": config.apiKey
    },
    body: formData
  });

  const result = (await response.json().catch(() => ({}))) as AzureImageResponse;

  if (!response.ok) {
    const azureMessage = result.error?.message || result.message || "Azure image editing failed.";
    const azureCode = result.error?.code ? ` (${result.error.code})` : "";

    throw new Error(`Azure image editing failed: ${response.status}${azureCode}. ${azureMessage}`);
  }

  const image = result.data?.[0];

  if (image?.b64_json) {
    return dataUrlFromBase64(image.b64_json);
  }

  if (image?.url) {
    return image.url;
  }

  throw new Error("Azure image editing did not return an image.");
}
