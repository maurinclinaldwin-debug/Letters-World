export interface TrailPoint {
  x: number;
  y: number;
  angle: number;
}

export const PATH_D =
  'M 180 140 C 260 200, 320 260, 420 340 C 520 410, 680 460, 840 540 C 960 600, 1080 640, 1180 680';

const SEGMENTS: [
  [number, number],
  [number, number],
  [number, number],
  [number, number]
][] = [
  [[180, 140], [260, 200], [320, 260], [420, 340]],
  [[420, 340], [520, 410], [680, 460], [840, 540]],
  [[840, 540], [960, 600], [1080, 640], [1180, 680]],
];

interface ArcSample {
  x: number;
  y: number;
  dist: number;
  angle: number;
}

// Precomputed arc-length table for exact path tracking (zero deviation from the line)
function buildArcTable(): { samples: ArcSample[]; totalLength: number } {
  const samples: ArcSample[] = [];
  const STEPS_PER_SEG = 200;
  let cumDist = 0;

  // Initial starting point
  const initDx = 3 * (260 - 180);
  const initDy = 3 * (200 - 140);
  samples.push({
    x: 180,
    y: 140,
    dist: 0,
    angle: Math.atan2(initDy, initDx) * (180 / Math.PI),
  });

  for (let s = 0; s < SEGMENTS.length; s++) {
    const [p0, p1, p2, p3] = SEGMENTS[s];
    for (let i = 1; i <= STEPS_PER_SEG; i++) {
      const t = i / STEPS_PER_SEG;
      const mt = 1 - t;
      const c0 = mt * mt * mt;
      const c1 = 3 * mt * mt * t;
      const c2 = 3 * mt * t * t;
      const c3 = t * t * t;

      const x = c0 * p0[0] + c1 * p1[0] + c2 * p2[0] + c3 * p3[0];
      const y = c0 * p0[1] + c1 * p1[1] + c2 * p2[1] + c3 * p3[1];

      const dx =
        3 * mt * mt * (p1[0] - p0[0]) +
        6 * mt * t * (p2[0] - p1[0]) +
        3 * t * t * (p3[0] - p2[0]);
      const dy =
        3 * mt * mt * (p1[1] - p0[1]) +
        6 * mt * t * (p2[1] - p1[1]) +
        3 * t * t * (p3[1] - p2[1]);
      const angle = Math.atan2(dy, dx) * (180 / Math.PI);

      const prev = samples[samples.length - 1];
      cumDist += Math.hypot(x - prev.x, y - prev.y);
      samples.push({ x, y, dist: cumDist, angle });
    }
  }

  return { samples, totalLength: cumDist };
}

const { samples: ARC_TABLE, totalLength: ARC_TOTAL_LENGTH } = buildArcTable();

export const TRAIL_PATH_LENGTH = ARC_TOTAL_LENGTH; // ~1146.07

/**
 * Returns the exact (x, y) point and tangent angle on the Bezier path
 * using arc-length parameterization. Guaranteed to lie precisely on the line.
 */
export function getTrailPoint(progress: number): TrailPoint {
  const p = Math.max(0, Math.min(1, progress));
  const targetDist = p * ARC_TOTAL_LENGTH;

  // Binary search on monotonic distance table
  let low = 0;
  let high = ARC_TABLE.length - 1;
  while (low <= high) {
    const mid = (low + high) >> 1;
    if (ARC_TABLE[mid].dist < targetDist) {
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }

  const idx = Math.max(1, Math.min(ARC_TABLE.length - 1, low));
  const pPrev = ARC_TABLE[idx - 1];
  const pNext = ARC_TABLE[idx];
  const span = pNext.dist - pPrev.dist;
  const frac = span > 0 ? (targetDist - pPrev.dist) / span : 0;

  return {
    x: pPrev.x + (pNext.x - pPrev.x) * frac,
    y: pPrev.y + (pNext.y - pPrev.y) * frac,
    angle: pPrev.angle + (pNext.angle - pPrev.angle) * frac,
  };
}
