import { useReducedMotion as useMotionReducedMotion } from "motion/react";

export const springPresets = {
  snappy: { stiffness: 500, damping: 30 },
  smooth: { stiffness: 300, damping: 25 },
  gentle: { stiffness: 200, damping: 20 },
} as const;

export const transitions = {
  snappy: { type: "spring" as const, ...springPresets.snappy },
  smooth: { type: "spring" as const, ...springPresets.smooth },
  gentle: { type: "spring" as const, ...springPresets.gentle },
} as const;

export function useReducedMotion() {
  return useMotionReducedMotion();
}

export function getTransition(
  preset: keyof typeof springPresets,
  reducedMotion?: boolean
) {
  if (reducedMotion) {
    return { duration: 0 };
  }
  return transitions[preset];
}

export const motionVariants = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  scaleIn: {
    initial: { opacity: 0, scale: 0.96 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.96 },
  },
  slideUp: {
    initial: { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 8 },
  },
  buttonPress: {
    whileTap: { scale: 0.98 },
  },
  cardHover: {
    whileHover: { backgroundColor: "var(--surface-raised)" },
  },
} as const;
