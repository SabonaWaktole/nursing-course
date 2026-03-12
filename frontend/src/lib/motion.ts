'use client';

import { useReducedMotion, type Variants } from 'framer-motion';

export const MOTION = {
  durationShort: 0.28,
  durationMedium: 0.38,
  durationLong: 0.45,
  easeSoft: [0.25, 0.8, 0.25, 1] as [number, number, number, number],
};

const pageVariantsBase: Variants = {
  hidden: { opacity: 0, y: 16 },
  enter: {
    opacity: 1,
    y: 0,
    transition: {
      duration: MOTION.durationMedium,
      ease: MOTION.easeSoft,
    },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: {
      duration: MOTION.durationShort,
      ease: MOTION.easeSoft,
    },
  },
};

const sectionContainerBase: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      duration: MOTION.durationMedium,
      ease: MOTION.easeSoft,
      staggerChildren: 0.08,
    },
  },
};

const sectionItemBase: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: MOTION.durationMedium,
      ease: MOTION.easeSoft,
    },
  },
};

function stripTransform(variant: Record<string, unknown>) {
  const { x, y, scale, rotate, ...rest } = variant;
  return {
    ...rest,
    transition: {
      ...(rest.transition as object | undefined),
      duration: 0,
    },
  };
}

function maybeReduceVariants(base: Variants, reduce: boolean): Variants {
  if (!reduce) return base;
  const reduced: Variants = {};
  for (const key of Object.keys(base)) {
    const value = base[key];
    if (!value || typeof value !== 'object') {
      reduced[key] = value as any;
      continue;
    }
    reduced[key] = stripTransform(value as Record<string, unknown>);
  }
  return reduced;
}

export function usePageVariants(): Variants {
  const reduce = useReducedMotion();
  return maybeReduceVariants(pageVariantsBase, !!reduce);
}

export function useSectionContainerVariants(): Variants {
  const reduce = useReducedMotion();
  return maybeReduceVariants(sectionContainerBase, !!reduce);
}

export function useSectionItemVariants(): Variants {
  const reduce = useReducedMotion();
  return maybeReduceVariants(sectionItemBase, !!reduce);
}

export function useButtonHoverMotion() {
  const reduce = useReducedMotion();

  if (reduce) {
    return {
      whileHover: { scale: 1 },
      whileTap: { scale: 1 },
      transition: { duration: 0 },
    };
  }

  return {
    whileHover: { scale: 1.03 },
    whileTap: { scale: 0.97 },
    transition: {
      duration: MOTION.durationShort,
      ease: MOTION.easeSoft,
    },
  };
}

export function useCardHoverMotion() {
  const reduce = useReducedMotion();

  if (reduce) {
    return {
      whileHover: { y: 0, scale: 1 },
      whileTap: { scale: 1 },
      transition: { duration: 0 },
    };
  }

  return {
    whileHover: { y: -4, scale: 1.01 },
    whileTap: { scale: 0.98 },
    transition: {
      duration: MOTION.durationMedium,
      ease: MOTION.easeSoft,
    },
  };
}

/** Gentle in-view fade + slight scale for images/media. Use with initial/whileInView. */
export const imageInViewVariants: Variants = {
  hidden: { opacity: 0, scale: 0.98 },
  show: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.4, ease: [0.25, 0.8, 0.25, 1] as [number, number, number, number] },
  },
};

/** Default viewport for section/image reveals: once, with margin. */
export const viewportOnce = { once: true, margin: '-60px' as const };

