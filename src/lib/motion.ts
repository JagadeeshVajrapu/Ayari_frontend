import type { Variants, Transition } from 'framer-motion';

export const EASE_PREMIUM = [0.22, 1, 0.36, 1] as const;

export const transition: Transition = {
  duration: 0.5,
  ease: EASE_PREMIUM,
};

export const springTransition: Transition = {
  type: 'spring',
  stiffness: 260,
  damping: 24,
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition },
};

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition },
};

export const fadeDown: Variants = {
  hidden: { opacity: 0, y: -24 },
  visible: { opacity: 1, y: 0, transition },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: { opacity: 1, scale: 1, transition },
};

export const fadeScale: Variants = {
  hidden: { opacity: 0, scale: 0.96, y: 16 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.45, ease: EASE_PREMIUM } },
};

export const pageTransition: Variants = {
  initial: { opacity: 0, y: 14, scale: 0.992 },
  animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: EASE_PREMIUM } },
  exit: { opacity: 0, y: -10, scale: 0.992, transition: { duration: 0.28, ease: EASE_PREMIUM } },
};

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
};

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 24, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: EASE_PREMIUM },
  },
};

export const cardHover = {
  rest: { scale: 1, y: 0 },
  hover: { scale: 1.02, y: -6, transition: springTransition },
};

export const navItemVariants: Variants = {
  hidden: { opacity: 0, y: -8 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.15 + i * 0.05, duration: 0.4, ease: EASE_PREMIUM },
  }),
};
