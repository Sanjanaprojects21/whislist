import { NextResponse } from "next/server";
import { categorizeProduct } from "../../../lib/azure-openai";
import { scrapeProduct } from "../../../lib/firecrawl";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { url?: unknown };

    if (typeof body.url !== "string" || !body.url.trim()) {
      return NextResponse.json({ error: "Product URL is required." }, { status: 400 });
    }

    const scrapedProduct = await scrapeProduct(body.url.trim());
    const category = await categorizeProduct(scrapedProduct);
    const product = {
      ...scrapedProduct,
      category
    };

    return NextResponse.json({ product });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to extract product.";
    const stage =
      message.includes("Status code: 401") || message.includes("FIRECRAWL_API_KEY")
        ? "scrape"
        : "extract";
    const status =
      message.includes("Status code: 401") || message.includes("FIRECRAWL_API_KEY")
        ? 401
        : 500;

    return NextResponse.json({ error: message, stage }, { status });
  }
}
