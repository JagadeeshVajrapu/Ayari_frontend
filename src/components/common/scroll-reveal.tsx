'use client';

import { motion, useInView } from 'framer-motion';
import { useRef, type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { EASE_PREMIUM } from '@/lib/motion';

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  variant?: 'fade' | 'scale' | 'up';
}

const directionOffset = {
  up: { y: 40, x: 0 },
  down: { y: -40, x: 0 },
  left: { x: 40, y: 0 },
  right: { x: -40, y: 0 },
  none: { x: 0, y: 0 },
};

export function ScrollReveal({
  children,
  className,
  delay = 0,
  direction = 'up',
  variant = 'up',
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  const offset = directionOffset[direction];

  const getInitial = () => {
    if (variant === 'fade') return { opacity: 0 };
    if (variant === 'scale') return { opacity: 0, scale: 0.94, ...offset };
    return { opacity: 0, ...offset };
  };

  const getAnimate = () => {
    if (variant === 'fade') return { opacity: 1 };
    if (variant === 'scale') return { opacity: 1, scale: 1, x: 0, y: 0 };
    return { opacity: 1, x: 0, y: 0 };
  };

  return (
    <motion.div
      ref={ref}
      initial={getInitial()}
      animate={isInView ? getAnimate() : getInitial()}
      transition={{ duration: 0.7, delay, ease: EASE_PREMIUM }}
      className={cn(className)}
    >
      {children}
    </motion.div>
  );
}
