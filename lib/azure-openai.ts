import "server-only";

import {
  inferProductCategory,
  isProductCategory,
  PRODUCT_CATEGORIES,
  type ProductCategory
} from "./categories";

type CategorizeProductInput = {
  title: string;
  price?: string | null;
};

type AzureChatCompletion = {
  choices?: Array<{
    message?: {
      content?: string | null;
    };
  }>;
};

function getAzureOpenAIConfig() {
  const apiKey = process.env.AZURE_OPENAI_API_KEY;
  const url = process.env.AZURE_OPENAI_CHAT_COMPLETIONS_URL;

  if (!apiKey || !url) {
    return null;
  }

  return { apiKey, url };
}

function parseCategory(content: string | null | undefined): ProductCategory | null {
  if (!content) {
    return null;
  }

  try {
    const parsed = JSON.parse(content) as { category?: unknown };
    return isProductCategory(parsed.category) ? parsed.category : null;
  } catch {
    const category = content.trim();
    return isProductCategory(category) ? category : null;
  }
}

export async function categorizeProduct(input: CategorizeProductInput): Promise<ProductCategory> {
  const fallbackCategory = inferProductCategory(input.title);
  const config = getAzureOpenAIConfig();

  if (!config) {
    return fallbackCategory;
  }

  try {
    const response = await fetch(config.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": config.apiKey
      },
      body: JSON.stringify({
        messages: [
          {
            role: "system",
            content:
              "Classify ecommerce wishlist products into exactly one allowed category. Respond only as JSON: {\"category\":\"Clothes\"}."
          },
          {
            role: "user",
            content: JSON.stringify({
              allowedCategories: PRODUCT_CATEGORIES,
              product: {
                title: input.title,
                price: input.price ?? null
              }
            })
          }
        ],
        temperature: 0,
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
      return fallbackCategory;
    }

    const completion = (await response.json()) as AzureChatCompletion;
    const category = parseCategory(completion.choices?.[0]?.message?.content);

    return category ?? fallbackCategory;
  } catch {
    return fallbackCategory;
  }
}
