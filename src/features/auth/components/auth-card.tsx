'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface AuthCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}

export function AuthCard({ title, subtitle, children, className }: AuthCardProps) {
  return (
    <motion.div
      whileHover={{ boxShadow: '0 20px 60px -20px hsl(var(--ink) / 0.15)' }}
      transition={{ duration: 0.4 }}
      className={cn('glass-auth rounded-4xl p-8 sm:p-10', className)}
    >
      <div className="mb-8 text-center">
        <h1 className="font-display text-3xl text-foreground sm:text-4xl">{title}</h1>
        {subtitle && (
          <p className="mt-2 text-sm leading-relaxed text-ink-muted">{subtitle}</p>
        )}
      </div>
      {children}
    </motion.div>
  );
}
