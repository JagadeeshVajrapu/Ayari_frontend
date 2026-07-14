/** Placeholder images for marketing/layout surfaces when no upload exists yet. */
export function placeholderImage(seed: string, width = 800, height = 1000): string {
  const label = encodeURIComponent(seed.slice(0, 24));
  return `https://placehold.co/${width}x${height}/e8e4df/4a4a4a?text=${label}`;
}

/** Fixed URLs — use these in above-the-fold components to avoid hydration drift. */
export const HERO_IMAGE = placeholderImage('AYARI', 900, 1200);
export const SEO_DEFAULT_IMAGE = placeholderImage('AYARI', 1200, 630);
