'use client';

import { motion } from 'framer-motion';
import type { ProductSpecification } from '@/types/product.types';

interface ProductSpecificationsProps {
  specifications: ProductSpecification[];
}

export function ProductSpecifications({ specifications }: ProductSpecificationsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="rounded-3xl border border-border/60 bg-surface-elevated overflow-hidden shadow-soft"
    >
      <div className="border-b border-border/60 px-6 py-4">
        <h2 className="font-display text-xl text-foreground">Specifications</h2>
      </div>
      <dl className="divide-y divide-border/60">
        {specifications.map((spec, i) => (
          <motion.div
            key={spec.label}
            initial={{ opacity: 0, x: -8 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05 }}
            className="flex justify-between gap-4 px-6 py-4 text-sm"
          >
            <dt className="text-ink-muted">{spec.label}</dt>
            <dd className="text-right font-medium text-foreground">{spec.value}</dd>
          </motion.div>
        ))}
      </dl>
    </motion.div>
  );
}
