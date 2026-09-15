/**
 * Centralized motion choreography configurations for the journey
 */

import { EASING, DURATION } from './easing.ts';

export const CHOREOGRAPHY = {
  intro: {
    blackFade: { duration: 1.8, ease: EASING.fade },
    skyEmergence: { delay: 0.6, duration: 2.0, ease: EASING.cinematic },
    landscapeReveal: { delay: 1.0, duration: 2.2, ease: EASING.cinematic },
    typographyEntry: { delay: 1.8, duration: 1.5, ease: EASING.organic },
    promptEntry: { delay: 2.8, duration: 1.2, ease: EASING.organic },
  },

  timeline: {
    // Milestones along scroll progress (0.0 to 1.0)
    prologueRange: [0.0, 0.16] as const,
    august2026Range: [0.22, 0.52] as const,
    august2026Center: 0.38,
    crossfadeRange: [0.55, 0.72] as const,
    august2027Range: [0.75, 1.0] as const,
    august2027Center: 0.88,
  },

  leafDeparture: {
    initialPause: 300,
    windRamp: 600,
    travelTime: 1800,
    blurDissolve: 1400,
  },
};
