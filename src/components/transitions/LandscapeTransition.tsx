import React from 'react';
import { LandscapeBackground } from '../../types.ts';

interface LandscapeTransitionProps {
  progress: number;
  mouseOffset?: { x: number; y: number };
  isFocused?: boolean;
  isOpeningLetter?: boolean;
  backgrounds: LandscapeBackground[];
}

export const LandscapeTransition: React.FC<LandscapeTransitionProps> = ({
  progress,
  isFocused = false,
  isOpeningLetter = false,
  backgrounds,
}) => {
  // Subtle camera push-in as timeline travels forward
  const baseScale = 1.04 + progress * 0.08;
  const focusScale = isFocused ? 1.07 : isOpeningLetter ? 1.15 : baseScale;

  // Focus blur effect
  const blurFilter = isFocused
    ? 'blur(3px) brightness(0.92)'
    : isOpeningLetter
    ? 'blur(8px) brightness(1.15)'
    : 'none';

  // Calculate continuous photographic transition across all backgrounds on scroll
  const num = backgrounds.length;
  const scaled = Math.max(0, Math.min(num - 1, progress * (num - 1)));
  const indexA = Math.floor(scaled);
  const indexB = Math.min(num - 1, indexA + 1);
  const fraction = scaled - indexA;
  // Smooth optical cosine easing for seamless photographic dissolving
  const easeFraction = 0.5 - 0.5 * Math.cos(fraction * Math.PI);

  return (
    <div
      id="landscape-stage-viewport"
      className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none"
    >
      {/* Stacked Photographic Background Layers */}
      {backgrounds.map((bg, index) => {
        let opacity = 0;
        if (index === indexA) {
          opacity = indexA === indexB ? 1 : 1 - easeFraction;
        } else if (index === indexB) {
          opacity = easeFraction;
        }

        // Only render active or dissolving layers to maintain 60fps performance
        const isVisible = opacity > 0.005;

        return (
          <div
            key={bg.id}
            id={`landscape-bg-layer-${bg.id}`}
            className="absolute inset-0 will-change-transform"
            style={{
              opacity: isVisible ? opacity : 0,
              visibility: isVisible ? 'visible' : 'hidden',
              transform: `scale(${focusScale}) translate3d(var(--pan-x, 0px), var(--pan-y, 0px), 0)`,
              filter: blurFilter,
              transition: 'opacity 80ms linear',
            }}
          >
            <img
              src={bg.url}
              alt={bg.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center"
            />
          </div>
        );
      })}

      {/* Atmospheric Overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0b0d12]/75 via-[#0b0d12]/20 to-[#141620]/30 mix-blend-multiply pointer-events-none" />
      <div className="absolute inset-0 bg-radial-[circle_at_center,transparent_45%,rgba(10,12,16,0.55)_100%] pointer-events-none" />

      {/* Dynamic environmental glow shifting warmth across scroll progress */}
      <div
        className="absolute inset-0 transition-opacity duration-700 pointer-events-none"
        style={{
          background:
            progress > 0.6
              ? 'radial-gradient(ellipse at 75% 30%, rgba(255, 235, 215, 0.10) 0%, transparent 65%)'
              : progress > 0.3
              ? 'radial-gradient(ellipse at 70% 38%, rgba(255, 210, 165, 0.12) 0%, transparent 60%)'
              : 'radial-gradient(ellipse at 50% 25%, rgba(180, 215, 220, 0.10) 0%, transparent 65%)',
          opacity: 0.85,
        }}
      />

      {/* Subtle organic film grain texture for tangible cinematic realism */}
      <div className="absolute inset-0 opacity-15 film-grain pointer-events-none" />
    </div>
  );
};
