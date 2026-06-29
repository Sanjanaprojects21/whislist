import { NextResponse } from "next/server";

const IMAGE_ACCEPT_HEADER = "image/avif,image/webp,image/png,image/jpeg,image/*;q=0.8,*/*;q=0.5";
const BROWSER_USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36";

export async function GET(request: Request) {
  const imageUrl = new URL(request.url).searchParams.get("url");

  if (!imageUrl) {
    return NextResponse.json({ error: "Image URL is required." }, { status: 400 });
  }

  let parsedUrl: URL;

  try {
    parsedUrl = new URL(imageUrl);
  } catch {
    return NextResponse.json({ error: "Invalid image URL." }, { status: 400 });
  }

  if (!["http:", "https:"].includes(parsedUrl.protocol)) {
    return NextResponse.json({ error: "Unsupported image URL." }, { status: 400 });
  }

  const response = await fetch(parsedUrl, {
    headers: {
      Accept: IMAGE_ACCEPT_HEADER,
      "User-Agent": BROWSER_USER_AGENT
    },
    next: {
      revalidate: 60 * 60 * 24
    }
  });

  if (!response.ok) {
    return NextResponse.json(
      { error: `Unable to load product image. Status: ${response.status}` },
      { status: 502 }
    );
  }

  const contentType = response.headers.get("content-type") || "image/jpeg";

  if (!contentType.startsWith("image/")) {
    return NextResponse.json({ error: "URL did not return an image." }, { status: 502 });
  }

  return new NextResponse(response.body, {
    headers: {
      "Cache-Control": "public, max-age=86400",
      "Content-Type": contentType
    }
  });
}
