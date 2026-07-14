'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

export function RouteProgress() {
  const pathname = usePathname();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
    setProgress(12);

    const t1 = window.setTimeout(() => setProgress(45), 80);
    const t2 = window.setTimeout(() => setProgress(72), 180);
    const t3 = window.setTimeout(() => setProgress(88), 320);
    const t4 = window.setTimeout(() => {
      setProgress(100);
      window.setTimeout(() => {
        setVisible(false);
        setProgress(0);
      }, 280);
    }, 480);

    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(t3);
      window.clearTimeout(t4);
    };
  }, [pathname]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="pointer-events-none fixed top-0 right-0 left-0 z-[100] h-[2px] bg-transparent"
        >
          <motion.div
            className="h-full origin-left bg-gradient-to-r from-champagne-dark via-champagne to-champagne-light shadow-glow"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: progress / 100 }}
            transition={{ ease: [0.22, 1, 0.36, 1], duration: 0.25 }}
            style={{ width: '100%' }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
