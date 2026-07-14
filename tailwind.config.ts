import type { Config } from 'tailwindcss';
import tailwindcssAnimate from 'tailwindcss-animate';

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/features/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: 'hsl(var(--brand))',
          light: 'hsl(var(--brand-light))',
          dark: 'hsl(var(--brand-dark))',
          charcoal: 'hsl(var(--brand-charcoal))',
          grey: 'hsl(var(--brand-grey))',
        },
        ink: {
          DEFAULT: 'hsl(var(--ink))',
          muted: 'hsl(var(--ink-muted))',
          faint: 'hsl(var(--ink-faint))',
        },
        cream: {
          DEFAULT: 'hsl(var(--cream))',
          dark: 'hsl(var(--cream-dark))',
        },
        champagne: {
          DEFAULT: 'hsl(var(--champagne))',
          light: 'hsl(var(--champagne-light))',
          dark: 'hsl(var(--champagne-dark))',
        },
        surface: {
          DEFAULT: 'hsl(var(--surface))',
          elevated: 'hsl(var(--surface-elevated))',
        },
        border: 'hsl(var(--border))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'Georgia', 'serif'],
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'display-xl': ['clamp(3rem,8vw,6.5rem)', { lineHeight: '0.95', letterSpacing: '-0.03em' }],
        'display-lg': ['clamp(2.25rem,5vw,4rem)', { lineHeight: '1', letterSpacing: '-0.025em' }],
        'display-md': ['clamp(1.75rem,3vw,2.75rem)', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
      },
      spacing: {
        18: '4.5rem',
        22: '5.5rem',
        30: '7.5rem',
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      boxShadow: {
        soft: '0 2px 20px -4px hsl(var(--ink) / 0.06)',
        medium: '0 8px 40px -12px hsl(var(--ink) / 0.12)',
        premium: '0 20px 60px -20px hsl(var(--ink) / 0.18)',
        glow: '0 0 60px -10px hsl(var(--brand) / 0.35)',
        glass: '0 8px 32px hsl(var(--ink) / 0.08), inset 0 1px 0 hsl(0 0% 100% / 0.6)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-hero':
          'radial-gradient(ellipse 80% 60% at 50% -10%, hsl(var(--brand) / 0.12), transparent 60%), radial-gradient(ellipse 50% 40% at 90% 20%, hsl(var(--brand-light) / 0.08), transparent 50%), linear-gradient(180deg, hsl(var(--cream)) 0%, hsl(var(--cream-dark)) 100%)',
        'gradient-hero-dark':
          'radial-gradient(ellipse 70% 55% at 15% 20%, hsl(var(--brand) / 0.22), transparent 55%), radial-gradient(ellipse 55% 45% at 92% 25%, hsl(var(--brand) / 0.14), transparent 50%), linear-gradient(135deg, hsl(0 0% 3%) 0%, hsl(var(--brand-charcoal)) 42%, hsl(0 0% 5%) 100%)',
        'gradient-dark':
          'linear-gradient(135deg, hsl(var(--brand-charcoal)) 0%, hsl(0 0% 8%) 50%, hsl(var(--brand-charcoal)) 100%)',
        'gradient-champagne':
          'linear-gradient(135deg, hsl(var(--brand-dark)) 0%, hsl(var(--brand)) 50%, hsl(var(--brand-light)) 100%)',
        'gradient-brand':
          'linear-gradient(135deg, hsl(var(--brand-dark)) 0%, hsl(var(--brand)) 55%, hsl(var(--brand-light)) 100%)',
      },
      animation: {
        'fade-up': 'fade-up 0.8s ease-out forwards',
        'fade-in': 'fade-in 0.6s ease-out forwards',
        marquee: 'marquee 30s linear infinite',
        float: 'float 6s ease-in-out infinite',
        shimmer: 'shimmer 2.5s ease-in-out infinite',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        shimmer: {
          '0%, 100%': { opacity: '0.5' },
          '50%': { opacity: '1' },
        },
      },
      transitionTimingFunction: {
        premium: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
    },
  },
  plugins: [tailwindcssAnimate],
};

export default config;
