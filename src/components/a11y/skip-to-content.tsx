import Link from 'next/link';

export function SkipToContent() {
  return (
    <Link
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:rounded-full focus:bg-ink focus:px-5 focus:py-3 focus:text-sm focus:font-medium focus:text-cream focus:shadow-premium focus:outline-none focus:ring-2 focus:ring-champagne"
    >
      Skip to main content
    </Link>
  );
}
