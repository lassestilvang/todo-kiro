/**
 * Animation configurations optimized for 60fps performance
 * Uses GPU-accelerated properties (opacity, transform) only
 */

import type { Transition, Variants } from 'framer-motion';

// Easing functions optimized for smooth animations
export const easings = {
  easeOut: [0.16, 1, 0.3, 1] as const,
  easeInOut: [0.4, 0, 0.2, 1] as const,
  spring: { type: 'spring', stiffness: 300, damping: 30 } as const,
};

// Standard transition durations
export const durations = {
  fast: 0.15,
  normal: 0.2,
  slow: 0.3,
};

// Fade in animation for task items
export const fadeInVariants: Variants = {
  hidden: { 
    opacity: 0, 
    y: 10,
  },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: durations.normal,
      ease: easings.easeOut,
    },
  },
  exit: { 
    opacity: 0, 
    scale: 0.95,
    transition: {
      duration: durations.fast,
      ease: easings.easeOut,
    },
  },
};

// Slide animation for sidebar
export const slideInVariants: Variants = {
  hidden: { 
    x: -264, 
    opacity: 0,
  },
  visible: { 
    x: 0, 
    opacity: 1,
    transition: {
      duration: durations.slow,
      ease: easings.easeInOut,
    },
  },
  exit: { 
    x: -264, 
    opacity: 0,
    transition: {
      duration: durations.slow,
      ease: easings.easeInOut,
    },
  },
};

// Scale animation for modals
export const scaleInVariants: Variants = {
  hidden: { 
    opacity: 0, 
    scale: 0.95, 
    y: -20,
  },
  visible: { 
    opacity: 1, 
    scale: 1, 
    y: 0,
    transition: {
      duration: durations.normal,
      ease: easings.easeOut,
    },
  },
  exit: { 
    opacity: 0, 
    scale: 0.95, 
    y: -20,
    transition: {
      duration: durations.normal,
      ease: easings.easeOut,
    },
  },
};

// Stagger children animation for lists
export const staggerContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

/**
 * Check if user prefers reduced motion
 */
export const prefersReducedMotion = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/**
 * Performance optimization: Reduce motion for users who prefer it
 * Returns simplified variants with minimal animation
 */
export const getReducedMotionVariants = (variants: Variants): Variants => {
  if (prefersReducedMotion()) {
    return {
      hidden: { opacity: 0 },
      visible: { opacity: 1, transition: { duration: 0.01 } },
      exit: { opacity: 0, transition: { duration: 0.01 } },
    };
  }
  return variants;
};

/**
 * Get transition configuration respecting reduced motion preference
 */
export const getTransition = (transition: Transition): Transition => {
  if (prefersReducedMotion()) {
    return { duration: 0.01 };
  }
  return transition;
};

// Layout animation configuration for smooth reordering
export const layoutTransition: Transition = {
  type: 'spring',
  stiffness: 500,
  damping: 50,
  mass: 1,
};

/**
 * Get layout transition respecting reduced motion preference
 */
export const getLayoutTransition = (): Transition => {
  if (prefersReducedMotion()) {
    return { duration: 0.01 };
  }
  return layoutTransition;
};
