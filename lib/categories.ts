export const PRODUCT_CATEGORIES = ["Clothes", "Cosmetics", "Books", "Jewellery"] as const;

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];

export function isProductCategory(value: unknown): value is ProductCategory {
  return typeof value === "string" && PRODUCT_CATEGORIES.includes(value as ProductCategory);
}

export function inferProductCategory(title: string): ProductCategory {
  const normalizedTitle = title.toLowerCase();

  if (
    /\b(book|novel|journal|notebook|magazine|paperback|hardcover|author|volume)\b/.test(
      normalizedTitle
    )
  ) {
    return "Books";
  }

  if (
    /\b(makeup|cosmetic|skincare|serum|cream|lipstick|mascara|foundation|cleanser|toner|blush)\b/.test(
      normalizedTitle
    )
  ) {
    return "Cosmetics";
  }

  if (
    /\b(jewel|jewellery|jewelry|ring|necklace|bracelet|earring|pendant|chain|gem|diamond|gold|silver)\b/.test(
      normalizedTitle
    )
  ) {
    return "Jewellery";
  }

  return "Clothes";
}
