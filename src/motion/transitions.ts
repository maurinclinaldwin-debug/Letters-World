/**
 * Reusable motion variants & transition definitions for Letters World
 */

import { EASING, DURATION } from './easing.ts';

export const FADE_IN = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: DURATION.normal, ease: EASING.fade },
};

export const CINEMATIC_REVEAL = {
  initial: { opacity: 0, y: 24, filter: 'blur(6px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
  exit: { opacity: 0, y: -16, filter: 'blur(4px)' },
  transition: { duration: DURATION.slow, ease: EASING.arrival },
};

export const SLOW_FLOAT = {
  animate: {
    y: [-4, 4, -4],
    transition: {
      duration: 6,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

export const MARKER_GLOW = {
  rest: { scale: 1, opacity: 0.7 },
  hover: {
    scale: 1.15,
    opacity: 1,
    transition: { duration: DURATION.fast, ease: EASING.organic },
  },
};

export const ROAD_PULSE = {
  animate: {
    opacity: [0.35, 0.65, 0.35],
    transition: {
      duration: 4.5,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};
