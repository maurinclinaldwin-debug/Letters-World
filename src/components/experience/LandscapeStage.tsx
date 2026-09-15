import React, { useEffect, useRef } from 'react';
import { LandscapeTransition } from '../transitions/LandscapeTransition.tsx';
import { AtmosphericLayer } from '../atmosphere/AtmosphericLayer.tsx';
import { LandscapeBackground, CalendarThemeConfig } from '../../types.ts';

interface LandscapeStageProps {
  progress: number;
  isLetterFocused?: boolean;
  isFocused?: boolean;
  isOpeningLetter?: boolean;
  backgrounds: LandscapeBackground[];
  theme?: CalendarThemeConfig;
  children?: React.ReactNode;
}

export const LandscapeStage: React.FC<LandscapeStageProps> = ({
  progress,
  isLetterFocused = false,
  isFocused = false,
  isOpeningLetter = false,
  backgrounds,
  theme,
  children,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Subtle hardware-accelerated natural camera parallax without React re-renders
  useEffect(() => {
    let animId: number;
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let isMoving = false;

    const onMouseMove = (e: MouseEvent) => {
      targetX = (e.clientX / window.innerWidth - 0.5) * 2;
      targetY = (e.clientY / window.innerHeight - 0.5) * 2;
      isMoving = true;
    };

    const updateParallax = () => {
      if (isMoving || Math.abs(targetX - currentX) > 0.001 || Math.abs(targetY - currentY) > 0.001) {
        currentX += (targetX - currentX) * 0.04;
        currentY += (targetY - currentY) * 0.04;
        if (containerRef.current) {
          const panX = (currentX * -18).toFixed(2);
          const panY = (currentY * -12).toFixed(2);
          containerRef.current.style.setProperty('--pan-x', `${panX}px`);
          containerRef.current.style.setProperty('--pan-y', `${panY}px`);
        }
        if (Math.abs(targetX - currentX) < 0.001 && Math.abs(targetY - currentY) < 0.001) {
          isMoving = false;
        }
      }
      animId = requestAnimationFrame(updateParallax);
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    animId = requestAnimationFrame(updateParallax);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      cancelAnimationFrame(animId);
    };
  }, []);

  const activeFocus = isLetterFocused || isFocused;

  return (
    <div
      id="landscape-stage-container"
      ref={containerRef}
      className="fixed inset-0 overflow-hidden select-none"
      style={{
        // Default CSS variables for parallax offset
        ['--pan-x' as string]: '0px',
        ['--pan-y' as string]: '0px',
      }}
    >
      {/* 2.5D Photographic Environments changing on every scroll */}
      <LandscapeTransition
        progress={progress}
        isFocused={activeFocus}
        isOpeningLetter={isOpeningLetter}
        backgrounds={backgrounds}
      />

      {/* Environmental Floating Particles & Atmospheric Motes with Real-time Calendar Sync */}
      <AtmosphericLayer progress={progress} theme={theme} />

      {/* Interactive Overlay Layers */}
      {children}
    </div>
  );
};
