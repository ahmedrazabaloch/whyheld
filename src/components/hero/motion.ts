import type { Variants } from "motion/react";

const EASE_EXPO = [0.16, 1, 0.3, 1] as const;

/** Parent stagger container for the headline column. */
export const containerVariants: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.09,
      delayChildren: 0.15,
    },
  },
};

/** Each line/block rises and fades into place. */
export const riseVariants: Variants = {
  hidden: { opacity: 0, y: 28, filter: "blur(6px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.9, ease: EASE_EXPO },
  },
};

/** Word-level mask reveal for the big serif headline. */
export const wordVariants: Variants = {
  hidden: { y: "115%" },
  show: {
    y: "0%",
    transition: { duration: 1, ease: EASE_EXPO },
  },
};

/** Destination card deck entrance. */
export const cardVariants: Variants = {
  hidden: { opacity: 0, y: 40, scale: 0.96 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 1, ease: EASE_EXPO, delay: 0.35 + i * 0.12 },
  }),
};
