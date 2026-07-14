'use client';

import { motion } from 'framer-motion';
import { BrandLogo } from '@/components/brand/brand-logo';
import { designTokens } from '@/lib/design-tokens';
import { ThemeToggle } from './theme-toggle';
import { AuthBackground } from './auth-background';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="relative flex min-h-screen flex-col">
      <AuthBackground />

      <header className="relative z-10 flex items-center justify-between px-5 py-5 sm:px-8">
        <BrandLogo href="/" size="lg" />
        <ThemeToggle />
      </header>

      <main className="relative z-10 flex flex-1 items-center justify-center px-5 py-8 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-md"
        >
          {children}
        </motion.div>
      </main>

      <footer className="relative z-10 py-6 text-center text-xs text-ink-faint">
        &copy; {new Date().getFullYear()} {designTokens.brand.name}. All rights reserved.
      </footer>
    </div>
  );
}
