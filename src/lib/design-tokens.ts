export const designTokens = {
  brand: {
    name: 'Ayari Creations',
    shortName: 'Ayari',
    tagline: 'Curated for the Discerning',
  },
  colors: {
    red: '#E30613',
    charcoal: '#2B2B2B',
    grey: '#8A8A8A',
    cream: '#FAF9F7',
  },
  logo: {
    src: '/images/ayari-logo-transparent.png',
    alt: 'Ayari Creations',
  },
  animation: {
    spring: { type: 'spring' as const, stiffness: 100, damping: 20 },
    smooth: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
    stagger: 0.08,
  },
  spacing: {
    section: 'py-24 md:py-32 lg:py-40',
    container: 'mx-auto max-w-7xl px-5 sm:px-6 lg:px-8',
  },
} as const;
