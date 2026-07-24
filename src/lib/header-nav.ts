import { shopCategoriesHref } from '@/lib/category-routes';

/**
 * Curated department links (multi-category) shown in the header.
 * Individual categories live in the Categories dropdown and `/categories/[slug]`.
 */
export const HEADER_DEPARTMENT_LINKS = [
  {
    label: 'Home Decor',
    href: shopCategoriesHref('home-decor-bottles', 'mirrors', 'Home Decor Bottles', 'Mirrors'),
  },
  {
    label: 'Gift Shop',
    href: shopCategoriesHref('flower-bouquet', 'keychains', 'Flower Bouquet', 'Keychains'),
  },
  {
    label: 'Table Decor',
    href: shopCategoriesHref(
      'handmade-candles',
      'desk-organizers',
      'Handmade Candles',
      'Desk Organizers',
    ),
  },
  {
    label: 'Wall Decor',
    href: shopCategoriesHref('wall-hangings', 'wall-decor', 'Wall Hangings', 'Wall Decor'),
  },
] as const;

/** @deprecated Prefer HEADER_DEPARTMENT_LINKS */
export const HEADER_NAV_LINKS = HEADER_DEPARTMENT_LINKS;
