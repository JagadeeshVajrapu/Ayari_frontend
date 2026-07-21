'use client';

import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';

/**
 * Lightweight route transition: a fast fade/rise on the incoming page only.
 * Keying by pathname remounts on navigation without AnimatePresence "wait" mode,
 * so the next page appears immediately instead of blocking on the previous
 * page's exit animation — navigation feels instant.
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <motion.div
      key={pathname}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
      className="min-h-[inherit]"
    >
      {children}
    </motion.div>
  );
}
