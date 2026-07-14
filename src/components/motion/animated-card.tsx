'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { fadeScale } from '@/lib/motion';

interface AnimatedCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  delay?: number;
}

export function AnimatedCard({
  children,
  className,
  hover = true,
  delay = 0,
}: AnimatedCardProps) {
  return (
    <motion.div
      variants={fadeScale}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-40px' }}
      transition={{ delay }}
      whileHover={hover ? { y: -6, scale: 1.02 } : undefined}
      className={cn(hover && 'transition-shadow duration-500 hover:shadow-premium', className)}
    >
      {children}
    </motion.div>
  );
}
