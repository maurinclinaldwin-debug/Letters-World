import React from 'react';
import { TimelineEntry } from '../../types.ts';
import { TimelineMarker } from './TimelineMarker.tsx';
import { getTrailPoint, TRAIL_PATH_LENGTH, PATH_D } from '../../utils/trailPath.ts';
import { useLightPhysics } from '../../hooks/useLightPhysics.ts';

interface TimelineProps {
  entries: TimelineEntry[];
  progress: number;
  focusedEntryId: string | null;
  onSelectEntry: (entry: TimelineEntry) => void;
  onReturnToUniverse?: () => void;
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

// Pre-computed static coordinates for the waypoints using arc-length math
const STATIC_WAYPOINTS = TRAIL_WAYPOINTS.map((wp) => {
  const pt = getTrailPoint(wp.p);
  return {
    ...wp,
    x: pt.x,
    y: pt.y,
  };
});

export const Timeline: React.FC<TimelineProps> = ({
  entries,
  progress,
  focusedEntryId,
  onSelectEntry,
  onReturnToUniverse,
}) => {
  // Smooth physical light simulation with spring inertia, frame-capped at 60 FPS
  const light = useLightPhysics(progress);

  // Fade in timeline subtly as user scrolls past prologue (progress > 0.05)
  const timelineOpacity = Math.max(0, Math.min(1, (progress - 0.05) / 0.12));

  // Check if light is close to either milestone
  const near2026 = Math.abs(light.progress - 0.38) < 0.08;
  const near2027 = Math.abs(light.progress - 0.88) < 0.08;
  const isNearMilestone = near2026 || near2027;
  const pt2026 = getTrailPoint(0.38);
  const pt2027 = getTrailPoint(0.88);

  if (timelineOpacity <= 0.01) return null;

  return (
    <div
      id="embedded-landscape-timeline"
      className="absolute inset-0 pointer-events-none transition-opacity duration-700 select-none will-change-transform"
      style={{
        opacity: timelineOpacity,
        transform: 'translate3d(var(--pan-mid-x, 0px), var(--pan-mid-y, 0px), 0)',
      }}
    >
      {/* 1. Organic Landscape Trail SVG with Circle Light Follower strictly on the line */}
      <svg
        viewBox="0 0 1200 800"
        preserveAspectRatio="none"
        className="w-full h-full absolute inset-0 overflow-visible pointer-events-none"
        aria-hidden="true"
      >
        <defs>
          {/* Illuminated trail linear gradient */}
          <linearGradient id="trailGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#df9c53" stopOpacity="0.6" />
            <stop offset="38%" stopColor="#f5cb98" stopOpacity="0.75" />
            <stop offset="75%" stopColor="#fff2dc" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.8" />
          </linearGradient>

          {/* Forward lighting beam radial gradient cast ahead on the line */}
          <radialGradient id="forwardBeamGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fff2dc" stopOpacity="0.5" />
            <stop offset="50%" stopColor="#df9c53" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#df9c53" stopOpacity="0" />
          </radialGradient>

          {/* Kinetic light aura radial gradient */}
          <radialGradient id="scoutGlowGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
            <stop offset="30%" stopColor="#f5cb98" stopOpacity="0.6" />
            <stop offset="70%" stopColor="#df9c53" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#df9c53" stopOpacity="0" />
          </radialGradient>

          {/* Directional comet tail gradient */}
          <linearGradient id="cometTailGrad" x1="100%" y1="0%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
            <stop offset="35%" stopColor="#f5cb98" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#df9c53" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Ambient faintly etched track on the terrain */}
        <path
          d={PATH_D}
          fill="none"
          stroke="rgba(255, 235, 215, 0.12)"
          strokeWidth="2.5"
          strokeDasharray="4 8"
        />

        {/* Glowing under-trail (synchronized with smooth light physics) */}
        <path
          d={PATH_D}
          fill="none"
          stroke="#df9c53"
          strokeWidth={5 + light.speed * 4}
          strokeOpacity={0.25 + light.speed * 0.22}
          strokeDasharray={TRAIL_PATH_LENGTH}
          strokeDashoffset={light.strokeOffset}
          strokeLinecap="round"
        />

        {/* Lit trail advancing smoothly with physical light */}
        <path
          d={PATH_D}
          fill="none"
          stroke="url(#trailGrad)"
          strokeWidth="2.5"
          strokeDasharray={TRAIL_PATH_LENGTH}
          strokeDashoffset={light.strokeOffset}
          strokeLinecap="round"
        />

        {/* Waymark Stepping Dots directly rendered in SVG on the line */}
        {STATIC_WAYPOINTS.map((wm, idx) => {
          const isPassed = light.progress >= wm.p - 0.02;
          return (
            <g key={idx} className="transition-opacity duration-500">
              {isPassed && wm.isMajor && (
                <circle
                  cx={wm.x}
                  cy={wm.y}
                  r="6"
                  fill="none"
                  stroke="#df9c53"
                  strokeWidth="1"
                  strokeOpacity="0.6"
                />
              )}
              <circle
                cx={wm.x}
                cy={wm.y}
                r={isPassed ? (wm.isMajor ? 3.5 : 2.5) : 1.8}
                fill={isPassed ? '#f5cb98' : 'rgba(255,255,255,0.25)'}
                className="transition-all duration-500"
              />
            </g>
          );
        })}

        {/* Dynamic Light Resonance Connection to Waypoint when traveler arrives */}
        {near2026 && (
          <circle
            cx={pt2026.x}
            cy={pt2026.y}
            r="32"
            fill="none"
            stroke="#df9c53"
            strokeWidth="1.5"
            strokeDasharray="3 3"
            className="animate-spin"
            style={{ animationDuration: '10s', transformOrigin: `${pt2026.x}px ${pt2026.y}px` }}
          />
        )}
        {near2027 && (
          <circle
            cx={pt2027.x}
            cy={pt2027.y}
            r="32"
            fill="none"
            stroke="#f5cb98"
            strokeWidth="1.5"
            strokeDasharray="3 3"
            className="animate-spin"
            style={{ animationDuration: '10s', transformOrigin: `${pt2027.x}px ${pt2027.y}px` }}
          />
        )}

        {/* Forward road illumination pool strictly centered on the line */}
        {light.progress > 0.04 && (
          <ellipse
            cx={light.point.x}
            cy={light.point.y}
            rx={28 + light.speed * 24}
            ry={18 + light.speed * 14}
            fill="url(#forwardBeamGrad)"
            opacity={0.65 + light.speed * 0.35}
            transform={`rotate(${light.point.angle} ${light.point.x} ${light.point.y})`}
          />
        )}

        {/* THE CIRCLE LIGHT: Strictly following along the line */}
        {light.progress > 0.04 && (
          <g
            id="traveler-circle-light"
            transform={`translate(${light.point.x}, ${light.point.y})`}
            className="will-change-transform"
          >
            {/* 1. Photonic Comet Tail pointing strictly backward along road tangent */}
            {light.tailLength > 1.5 && (
              <line
                x1={0}
                y1={0}
                x2={-light.tailLength}
                y2={0}
                stroke="url(#cometTailGrad)"
                strokeWidth={3.5 + light.speed * 2}
                strokeLinecap="round"
                transform={`rotate(${
                  light.velocity >= 0 ? light.point.angle : light.point.angle + 180
                })`}
                opacity={light.tailOpacity}
              />
            )}

            {/* 2. Concentric Kinetic Radial Glow Aura */}
            <circle
              r={light.glowRadius}
              fill="url(#scoutGlowGrad)"
              opacity={Math.min(0.85, light.intensity * 0.65)}
            />

            {/* 3. Milestone Resonance Pulse Ring */}
            {isNearMilestone && (
              <circle
                r={20}
                fill="none"
                stroke="#df9c53"
                strokeWidth="1.5"
                strokeOpacity="0.8"
                className="animate-ping"
              />
            )}

            {/* 4. Outer Ring of the Circle Light */}
            <circle
              r={isNearMilestone ? 8 : 6.5}
              fill={isNearMilestone ? 'rgba(223,156,83,0.45)' : 'rgba(14,16,22,0.65)'}
              stroke={isNearMilestone ? '#df9c53' : '#f5cb98'}
              strokeWidth={isNearMilestone ? 2 : 1.5}
            />

            {/* 5. Center Core Luminous Dot */}
            <circle
              r={isNearMilestone ? 4 : 3}
              fill="#ffffff"
            />

            {/* 6. Anamorphic Transverse Flare Ray */}
            <line
              x1={-(12 + light.speed * 24)}
              y1={0}
              x2={12 + light.speed * 24}
              y2={0}
              stroke="rgba(255,255,255,0.85)"
              strokeWidth={1.5}
              transform={`rotate(${light.point.angle + 90})`}
              opacity={0.35 + light.speed * 0.65}
            />

            {/* 7. Subtle Desktop Coordinate Tag directly on the traveler beacon */}
            {!isNearMilestone && light.progress > 0.1 && light.progress < 0.95 && (
              <g transform="translate(14, 3)" className="hidden md:block opacity-75">
                <rect
                  x="0"
                  y="-10"
                  width="86"
                  height="16"
                  rx="8"
                  fill="rgba(10, 12, 16, 0.65)"
                  stroke="rgba(255, 255, 255, 0.15)"
                  strokeWidth="0.75"
                />
                <text
                  x="43"
                  y="1"
                  textAnchor="middle"
                  fill="#e5aa6d"
                  fontSize="7.5"
                  fontFamily="sans-serif"
                  letterSpacing="0.1em"
                  className="uppercase font-semibold"
                >
                  Line • {Math.round(light.progress * 100)}%
                </text>
              </g>
            )}
          </g>
        )}
      </svg>

      {/* 2. Embedded Timeline Waypoint Markers (Letters) */}
      {entries.map((entry) => {
        const dist = Math.abs(light.progress - entry.progress);
        const revealProgress = Math.max(0, Math.min(1, 1 - dist / 0.22));
        const isActive = dist < 0.16;
        const isFocused = focusedEntryId === entry.id;

        const markerPt = getTrailPoint(entry.progress);
        const markerEntry: TimelineEntry = {
          ...entry,
          pathPercent: {
            x: (markerPt.x / 1200) * 100,
            y: (markerPt.y / 800) * 100,
          },
        };

        return (
          <TimelineMarker
            key={entry.id}
            entry={markerEntry}
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
