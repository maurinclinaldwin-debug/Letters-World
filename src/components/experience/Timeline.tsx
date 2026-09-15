import React from 'react';
import { Compass } from 'lucide-react';
import { TimelineEntry } from '../../types.ts';
import { TimelineMarker } from './TimelineMarker.tsx';

interface TimelineProps {
  entries: TimelineEntry[];
  progress: number;
  focusedEntryId: string | null;
  onSelectEntry: (entry: TimelineEntry) => void;
}

// Intermediate stepping points etched into the mountain road
const TRAIL_WAYPOINTS = [
  { p: 0.12, label: 'Trailhead Gate', isMajor: false },
  { p: 0.24, label: 'Alpine Stream', isMajor: false },
  { p: 0.38, label: 'Wildflower Meadow', isMajor: true },
  { p: 0.52, label: 'Timberline Clearing', isMajor: false },
  { p: 0.68, label: 'Mountain Pass', isMajor: false },
  { p: 0.88, label: 'High Ridge Crest', isMajor: true },
  { p: 0.98, label: 'Dawn Horizon', isMajor: false },
];

/**
 * Pure mathematical evaluator for the cubic bezier trail:
 * M 180 680 C 260 620, 320 560, 420 480 C 520 400, 680 340, 840 240 C 960 160, 1080 120, 1180 90
 * Eliminates all DOM path measurement and re-render cycles.
 */
function getBezierPoint(
  p0: [number, number],
  p1: [number, number],
  p2: [number, number],
  p3: [number, number],
  t: number
) {
  const oneMinusT = 1 - t;
  const c0 = oneMinusT * oneMinusT * oneMinusT;
  const c1 = 3 * oneMinusT * oneMinusT * t;
  const c2 = 3 * oneMinusT * t * t;
  const c3 = t * t * t;
  const x = c0 * p0[0] + c1 * p1[0] + c2 * p2[0] + c3 * p3[0];
  const y = c0 * p0[1] + c1 * p1[1] + c2 * p2[1] + c3 * p3[1];

  // Derivative for tangent heading angle
  const dx =
    3 * oneMinusT * oneMinusT * (p1[0] - p0[0]) +
    6 * oneMinusT * t * (p2[0] - p1[0]) +
    3 * t * t * (p3[0] - p2[0]);
  const dy =
    3 * oneMinusT * oneMinusT * (p1[1] - p0[1]) +
    6 * oneMinusT * t * (p2[1] - p1[1]) +
    3 * t * t * (p3[1] - p2[1]);
  const angle = Math.atan2(dy, dx) * (180 / Math.PI);

  return { x, y, angle };
}

function getTrailPoint(progress: number) {
  const p = Math.max(0, Math.min(1, progress));
  if (p <= 0.35) {
    const t = p / 0.35;
    return getBezierPoint([180, 680], [260, 620], [320, 560], [420, 480], t);
  } else if (p <= 0.75) {
    const t = (p - 0.35) / 0.4;
    return getBezierPoint([420, 480], [520, 400], [680, 340], [840, 240], t);
  } else {
    const t = (p - 0.75) / 0.25;
    return getBezierPoint([840, 240], [960, 160], [1080, 120], [1180, 90], t);
  }
}

// Pre-computed static coordinates for the waypoints
const STATIC_WAYPOINTS = TRAIL_WAYPOINTS.map((wp) => {
  const pt = getTrailPoint(wp.p);
  return {
    ...wp,
    x: (pt.x / 1200) * 100,
    y: (pt.y / 800) * 100,
  };
});

const TRAIL_PATH_LENGTH = 1360;
const PATH_D = "M 180 680 C 260 620, 320 560, 420 480 C 520 400, 680 340, 840 240 C 960 160, 1080 120, 1180 90";

export const Timeline: React.FC<TimelineProps> = ({
  entries,
  progress,
  focusedEntryId,
  onSelectEntry,
}) => {
  // Fade in timeline subtly as user scrolls past prologue (progress > 0.05)
  const timelineOpacity = Math.max(0, Math.min(1, (progress - 0.05) / 0.12));

  // Compute traveler coordinates deterministically without state or effects
  const travelerPos = getTrailPoint(progress);
  const travelerPercentX = (travelerPos.x / 1200) * 100;
  const travelerPercentY = (travelerPos.y / 800) * 100;

  // Trail stroke offset: reveals progressively as traveler wanders
  const strokeOffset = Math.max(0, TRAIL_PATH_LENGTH * (1 - Math.min(1, progress * 1.05)));

  // Check if traveler is close to either milestone
  const near2026 = Math.abs(progress - 0.38) < 0.08;
  const near2027 = Math.abs(progress - 0.88) < 0.08;
  const isNearMilestone = near2026 || near2027;

  if (timelineOpacity <= 0.01) return null;

  return (
    <div
      id="embedded-landscape-timeline"
      className="absolute inset-0 pointer-events-none transition-opacity duration-700 select-none"
      style={{ opacity: timelineOpacity }}
    >
      {/* 1. Organic Landscape Trail SVG (embedded into terrain) */}
      <svg
        viewBox="0 0 1200 800"
        preserveAspectRatio="none"
        className="w-full h-full absolute inset-0 overflow-visible"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="trailGrad" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#df9c53" stopOpacity="0.6" />
            <stop offset="38%" stopColor="#f5cb98" stopOpacity="0.75" />
            <stop offset="75%" stopColor="#fff2dc" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.8" />
          </linearGradient>

          <filter id="trailGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <filter id="travelerAura" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Ambient faintly etched track on the terrain */}
        <path
          d={PATH_D}
          fill="none"
          stroke="rgba(255, 235, 215, 0.12)"
          strokeWidth="2.5"
          strokeDasharray="4 8"
        />

        {/* Lit trail advancing with user's journey */}
        <path
          d={PATH_D}
          fill="none"
          stroke="url(#trailGrad)"
          strokeWidth="2.5"
          strokeDasharray={TRAIL_PATH_LENGTH}
          strokeDashoffset={strokeOffset}
          filter="url(#trailGlow)"
          className="transition-[stroke-dashoffset] duration-150 ease-out"
        />

        {/* Dynamic Light Resonance Connection to Waypoint when traveler arrives */}
        {near2026 && (
          <circle
            cx="456"
            cy="496"
            r="32"
            fill="none"
            stroke="#df9c53"
            strokeWidth="1.5"
            strokeDasharray="3 3"
            className="animate-spin"
            style={{ animationDuration: '10s', transformOrigin: '456px 496px' }}
          />
        )}
        {near2027 && (
          <circle
            cx="888"
            cy="224"
            r="32"
            fill="none"
            stroke="#f5cb98"
            strokeWidth="1.5"
            strokeDasharray="3 3"
            className="animate-spin"
            style={{ animationDuration: '10s', transformOrigin: '888px 224px' }}
          />
        )}
      </svg>

      {/* 2. Intermediate Waymark Stepping Dots along the Trail */}
      {STATIC_WAYPOINTS.map((wm, idx) => {
        const isPassed = progress >= wm.p - 0.02;
        return (
          <div
            key={idx}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-all duration-500"
            style={{
              left: `${wm.x}%`,
              top: `${wm.y}%`,
            }}
          >
            <span
              className={`block rounded-full transition-all duration-700 ${
                isPassed
                  ? wm.isMajor
                    ? 'w-2 h-2 bg-[#df9c53] shadow-[0_0_8px_#df9c53] ring-2 ring-[#f5cb98]/40'
                    : 'w-1.5 h-1.5 bg-[#f5cb98]/80 shadow-[0_0_6px_#f5cb98]'
                  : 'w-1 h-1 bg-white/20'
              }`}
            />
          </div>
        );
      })}

      {/* 3. The Celestial Traveler Scout / Beacon along the Trail */}
      {progress > 0.04 && (
        <div
          id="traveler-celestial-scout"
          className="absolute transform -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-all duration-100 ease-out z-10"
          style={{
            left: `${travelerPercentX}%`,
            top: `${travelerPercentY}%`,
          }}
        >
          {/* Pulsing Light Halo */}
          <span
            className={`absolute rounded-full transition-all duration-300 transform -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2 ${
              isNearMilestone
                ? 'w-16 h-16 bg-[#df9c53]/40 blur-md animate-pulse'
                : 'w-10 h-10 bg-[#f5cb98]/25 blur-sm'
            }`}
          />

          {/* Outer Breathing Ring */}
          <span
            className={`relative flex items-center justify-center rounded-full border transition-all duration-300 ${
              isNearMilestone
                ? 'w-6 h-6 border-[#df9c53] bg-[#df9c53]/30 shadow-[0_0_16px_rgba(223,156,83,0.8)]'
                : 'w-5 h-5 border-[#f5cb98]/70 bg-black/40 shadow-[0_0_10px_rgba(245,203,152,0.5)]'
            }`}
          >
            {/* Compass directional needle aligned with road tangent */}
            <Compass
              className="w-3 h-3 text-[#fff4e0] transition-transform duration-200"
              style={{ transform: `rotate(${travelerPos.angle}deg)` }}
            />
          </span>

          {/* Ethereal "Wanderer" coordinate chip (subtle, visible on desktop) */}
          {!isNearMilestone && progress > 0.1 && progress < 0.95 && (
            <div className="hidden md:flex absolute left-6 top-1/2 -translate-y-1/2 whitespace-nowrap opacity-75 animate-in fade-in duration-300">
              <span className="px-2 py-0.5 rounded-full backdrop-blur-md bg-black/40 border border-white/10 text-[8px] font-sans tracking-[0.2em] uppercase text-[#e5aa6d]">
                Wandering • {Math.round(progress * 100)}%
              </span>
            </div>
          )}
        </div>
      )}

      {/* 4. Embedded Timeline Waypoint Markers */}
      {entries.map((entry) => {
        const dist = Math.abs(progress - entry.progress);
        const revealProgress = Math.max(0, Math.min(1, 1 - dist / 0.22));
        const isActive = dist < 0.16;
        const isFocused = focusedEntryId === entry.id;

        return (
          <TimelineMarker
            key={entry.id}
            entry={entry}
            isActive={isActive}
            isFocused={isFocused}
            revealProgress={revealProgress}
            onClick={onSelectEntry}
          />
        );
      })}
    </div>
  );
};
