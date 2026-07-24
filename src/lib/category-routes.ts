/** Canonical storefront URL for a single category landing page. */
export function categoryHref(slug: string): string {
  return `/categories/${encodeURIComponent(slug)}`;
}

/** Multi-category shop filter (department groupings in the header). */
export function shopCategoriesHref(...values: string[]): string {
  return `/shop?categories=${values.map((value) => encodeURIComponent(value)).join(',')}`;
}
