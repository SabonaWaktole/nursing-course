'use client';

import { useReducedMotion, useScroll, useTransform, useSpring, useMotionValue, useInView, type Variants, type MotionValue } from 'framer-motion';
import { useRef, useEffect, useState, useCallback } from 'react';

// ─── Core Timing Constants ───────────────────────────────────────────────────

export const MOTION = {
  durationShort: 0.28,
  durationMedium: 0.38,
  durationLong: 0.45,
  durationSlow: 0.7,
  easeSoft: [0.25, 0.8, 0.25, 1] as [number, number, number, number],
  easeSnappy: [0.4, 0, 0.2, 1] as [number, number, number, number],
  easeElastic: [0.68, -0.6, 0.32, 1.6] as [number, number, number, number],
};

// ─── Page Transitions ────────────────────────────────────────────────────────

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

// ─── Section Variants ────────────────────────────────────────────────────────

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

// ─── Staggered Text Variants ─────────────────────────────────────────────────

const staggeredTextContainerBase: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.035,
      delayChildren: 0.1,
    },
  },
};

const staggeredTextItemBase: Variants = {
  hidden: { opacity: 0, y: 20, filter: 'blur(8px)' },
  show: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      duration: MOTION.durationMedium,
      ease: MOTION.easeSoft,
    },
  },
};

// ─── Floating Variants ───────────────────────────────────────────────────────

const floatingVariantsBase: Variants = {
  float: {
    y: [0, -14, 0],
    transition: {
      duration: 5,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

// ─── Card Shine / Shimmer Variants ───────────────────────────────────────────

const cardShineBase: Variants = {
  rest: { x: '-100%', opacity: 0 },
  hover: {
    x: '100%',
    opacity: 0.12,
    transition: {
      duration: 0.6,
      ease: 'easeInOut',
    },
  },
};

// ─── Glow Hover (button glow on hover) ───────────────────────────────────────

const glowHoverBase = {
  whileHover: {
    scale: 1.03,
    boxShadow: '0 0 25px rgba(13, 185, 242, 0.45), 0 0 50px rgba(13, 185, 242, 0.15)',
  },
  whileTap: { scale: 0.97 },
  transition: {
    duration: MOTION.durationShort,
    ease: MOTION.easeSoft,
  },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function stripTransform(variant: Record<string, unknown>) {
  const { x, y, scale, rotate, filter, ...rest } = variant;
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

// ─── Hooks ───────────────────────────────────────────────────────────────────

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

export function useStaggeredTextContainerVariants(): Variants {
  const reduce = useReducedMotion();
  return maybeReduceVariants(staggeredTextContainerBase, !!reduce);
}

export function useStaggeredTextItemVariants(): Variants {
  const reduce = useReducedMotion();
  return maybeReduceVariants(staggeredTextItemBase, !!reduce);
}

export function useFloatingVariants(): Variants {
  const reduce = useReducedMotion();
  if (reduce) return { float: {} };
  return floatingVariantsBase;
}

export function useCardShineVariants(): Variants {
  const reduce = useReducedMotion();
  if (reduce) return { rest: {}, hover: {} };
  return cardShineBase;
}

export function useGlowHoverMotion() {
  const reduce = useReducedMotion();
  if (reduce) {
    return {
      whileHover: { scale: 1 },
      whileTap: { scale: 1 },
      transition: { duration: 0 },
    };
  }
  return glowHoverBase;
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

// ─── Animated Counter Hook ───────────────────────────────────────────────────

export function useCounterAnimation(
  end: number,
  duration: number = 2,
  startOnView: boolean = true
) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  const hasStarted = useRef(false);

  useEffect(() => {
    if (startOnView && !isInView) return;
    if (hasStarted.current) return;
    hasStarted.current = true;

    const startTime = performance.now();
    const step = (currentTime: number) => {
      const elapsed = (currentTime - startTime) / 1000;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * end));
      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };
    requestAnimationFrame(step);
  }, [end, duration, isInView, startOnView]);

  return { count, ref };
}

// ─── Parallax Scroll Hook ────────────────────────────────────────────────────

export function useParallaxScroll(speed: number = 0.3): { ref: React.RefObject<HTMLDivElement | null>; y: MotionValue<number> } {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });
  const y = useTransform(scrollYProgress, [0, 1], [speed * -100, speed * 100]);
  const smoothY = useSpring(y, { stiffness: 80, damping: 30 });

  return { ref, y: smoothY };
}

// ─── Static Variants ─────────────────────────────────────────────────────────

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

/** Form field stagger container */
export const formContainerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.07,
      delayChildren: 0.15,
    },
  },
};

/** Form field stagger item */
export const formItemVariants: Variants = {
  hidden: { opacity: 0, y: 16, filter: 'blur(4px)' },
  show: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      duration: 0.35,
      ease: [0.25, 0.8, 0.25, 1],
    },
  },
};

/** Footer stagger container */
export const footerContainerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.1,
    },
  },
};

/** Footer stagger item */
export const footerItemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.45,
      ease: [0.25, 0.8, 0.25, 1],
    },
  },
};

/** Mobile menu stagger container */
export const mobileMenuContainerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.08,
    },
  },
};

/** Mobile menu stagger item */
export const mobileMenuItemVariants: Variants = {
  hidden: { opacity: 0, x: -16 },
  show: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.3,
      ease: [0.25, 0.8, 0.25, 1],
    },
  },
};
