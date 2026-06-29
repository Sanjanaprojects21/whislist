function cleanImageCandidate(value: string) {
  return value
    .trim()
    .replace(/^url\((.*)\)$/i, "$1")
    .replace(/^["']|["']$/g, "")
    .trim();
}

function pickSrcsetCandidate(value: string) {
  const candidates = value
    .split(",")
    .map((candidate) => cleanImageCandidate(candidate).split(/\s+/)[0])
    .filter(Boolean);

  return candidates.at(-1) || value;
}

export function normalizeProductImageUrl(value: unknown, baseUrl?: string) {
  if (typeof value !== "string") {
    return null;
  }

  const rawCandidate = pickSrcsetCandidate(value);

  if (!rawCandidate || rawCandidate.startsWith("data:")) {
    return null;
  }

  try {
    return new URL(rawCandidate, baseUrl).toString();
  } catch {
    return null;
  }
}

export function getProductImageDisplaySrc(imageUrl: string) {
  return `/api/product-image?url=${encodeURIComponent(imageUrl)}`;
}

export function imageExtensionFromContentType(contentType: string) {
  if (contentType.includes("avif")) {
    return "avif";
  }

  if (contentType.includes("webp")) {
    return "webp";
  }

  if (contentType.includes("png")) {
    return "png";
  }

  if (contentType.includes("jpeg") || contentType.includes("jpg")) {
    return "jpg";
  }

  return "jpg";
}

export function imageContentTypeFromUrl(imageUrl: string) {
  const pathname = new URL(imageUrl).pathname.toLowerCase();

  if (pathname.endsWith(".avif")) {
    return "image/avif";
  }

  if (pathname.endsWith(".webp")) {
    return "image/webp";
  }

  if (pathname.endsWith(".png")) {
    return "image/png";
  }

  if (pathname.endsWith(".jpg") || pathname.endsWith(".jpeg")) {
    return "image/jpeg";
  }

  return null;
}
