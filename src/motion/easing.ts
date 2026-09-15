/**
 * Cinematic easing curves for organic, weighted natural transitions
 */

export const EASING = {
  // Editorial smooth camera easing
  cinematic: [0.25, 1, 0.5, 1] as const,
  // Gentle organic float for wind & vegetation
  organic: [0.33, 1, 0.68, 1] as const,
  // Deep slow deceleration for arriving at destinations
  arrival: [0.16, 1, 0.3, 1] as const,
  // Swift departure for the wind-swept leaf
  departure: [0.7, 0, 0.84, 0] as const,
  // Atmospheric fade
  fade: [0.4, 0, 0.2, 1] as const,
};

export const DURATION = {
  instant: 0.15,
  fast: 0.4,
  normal: 0.8,
  slow: 1.4,
  cinematic: 2.2,
  atmospheric: 3.5,
};
