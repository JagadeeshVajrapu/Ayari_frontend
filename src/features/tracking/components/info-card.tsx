'use client';

import { memo, type ReactNode } from 'react';
import { motion } from 'framer-motion';

interface InfoCardProps {
  title: string;
  children: ReactNode;
}

export const InfoCard = memo(function InfoCard({ title, children }: InfoCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl border border-border/60 bg-surface-elevated p-5 shadow-soft sm:p-6"
    >
      <h3 className="font-display text-lg text-foreground">{title}</h3>
      <div className="mt-4">{children}</div>
    </motion.div>
  );
});
