'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { X } from 'lucide-react';
import { useState } from 'react';

const messages = [
  { text: 'Complimentary shipping on orders over ₹5,000', href: '/shipping' },
  { text: 'New arrivals just dropped — Shop Now', href: '/shop?sort=newest' },
  { text: 'Welcome offer: use AYARI10 for 10% off', href: '/shop' },
];

export function AnnouncementBar() {
  const [isVisible, setIsVisible] = useState(true);
  const [messageIndex, setMessageIndex] = useState(0);

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="relative z-[60] bg-ink text-cream"
    >
      <div className="container-premium flex h-9 items-center justify-center px-10">
        <motion.p
          key={messageIndex}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.4 }}
          className="text-center text-[11px] font-medium tracking-[0.15em] uppercase sm:text-xs"
        >
          <Link
            href={messages[messageIndex].href}
            className="transition-colors hover:text-champagne"
            onMouseEnter={() =>
              setMessageIndex((prev) => (prev + 1) % messages.length)
            }
          >
            {messages[messageIndex].text}
          </Link>
        </motion.p>

        <button
          type="button"
          onClick={() => setIsVisible(false)}
          aria-label="Dismiss announcement"
          suppressHydrationWarning
          className="absolute right-4 flex h-6 w-6 items-center justify-center rounded-full text-cream/50 transition-colors hover:bg-cream/10 hover:text-cream"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </motion.div>
  );
}
