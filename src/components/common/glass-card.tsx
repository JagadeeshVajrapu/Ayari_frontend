'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';
import { cardHover, fadeScale } from '@/lib/motion';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  dark?: boolean;
  hover?: boolean;
  animate?: boolean;
}

export function GlassCard({
  children,
  className,
  dark = false,
  hover = false,
  animate = false,
}: GlassCardProps) {
  const baseClass = cn(
    'rounded-3xl',
    dark ? 'glass-dark' : 'glass',
    hover && 'cursor-pointer',
    className,
  );

  if (!animate && !hover) {
    return <div className={baseClass}>{children}</div>;
  }

  return (
    <motion.div
      variants={animate ? fadeScale : undefined}
      initial={animate ? 'hidden' : undefined}
      whileInView={animate ? 'visible' : undefined}
      viewport={animate ? { once: true, margin: '-40px' } : undefined}
      whileHover={hover ? cardHover.hover : undefined}
      className={cn(baseClass, hover && 'transition-shadow duration-500 hover:shadow-premium')}
    >
      {children}
    </motion.div>
  );
}
