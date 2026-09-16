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

  // Subtle hardware-accelerated natural camera parallax across multi-depth mountain planes
  useEffect(() => {
    let animId: number;
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let isMoving = false;

    const onPointerMove = (e: PointerEvent | MouseEvent) => {
      targetX = (e.clientX / window.innerWidth - 0.5) * 2;
      targetY = (e.clientY / window.innerHeight - 0.5) * 2;
      isMoving = true;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches && e.touches[0]) {
        const touch = e.touches[0];
        targetX = (touch.clientX / window.innerWidth - 0.5) * 2;
        targetY = (touch.clientY / window.innerHeight - 0.5) * 2;
        isMoving = true;
      }
    };

    let lastTime = 0;
    const FRAME_INTERVAL = 1000 / 60; // 16.6ms cap for buttery 60fps

    const updateParallax = (now: number) => {
      animId = requestAnimationFrame(updateParallax);

      const elapsed = now - lastTime;
      if (elapsed < FRAME_INTERVAL) return;
      lastTime = now - (elapsed % FRAME_INTERVAL);

      // Subtle atmospheric idle drift simulating mountain wind on steady camera
      const idleWaveX = Math.sin(now * 0.0007) * 0.06;
      const idleWaveY = Math.cos(now * 0.0005) * 0.04;
      const effectiveTargetX = targetX + idleWaveX;
      const effectiveTargetY = targetY + idleWaveY;

      if (isMoving || Math.abs(effectiveTargetX - currentX) > 0.0005 || Math.abs(effectiveTargetY - currentY) > 0.0005) {
        currentX += (effectiveTargetX - currentX) * 0.05;
        currentY += (effectiveTargetY - currentY) * 0.05;

        if (containerRef.current) {
          // Multi-depth camera parallax offsets
          const panSkyX = (currentX * -6).toFixed(2);
          const panSkyY = (currentY * -4).toFixed(2);

          const panFarX = (currentX * -14).toFixed(2);
          const panFarY = (currentY * -9).toFixed(2);

          const panMidX = (currentX * -26).toFixed(2);
          const panMidY = (currentY * -16).toFixed(2);

          const panNearX = (currentX * -44).toFixed(2);
          const panNearY = (currentY * -24).toFixed(2);

          const panRotX = (currentY * 1.5).toFixed(2);
          const panRotY = (currentX * -2.0).toFixed(2);

          const mouseNormX = (((currentX + 1) / 2) * 100).toFixed(1);
          const mouseNormY = (((currentY + 1) / 2) * 100).toFixed(1);

          const el = containerRef.current;
          el.style.setProperty('--pan-sky-x', `${panSkyX}px`);
          el.style.setProperty('--pan-sky-y', `${panSkyY}px`);

          el.style.setProperty('--pan-far-x', `${panFarX}px`);
          el.style.setProperty('--pan-far-y', `${panFarY}px`);

          el.style.setProperty('--pan-mid-x', `${panMidX}px`);
          el.style.setProperty('--pan-mid-y', `${panMidY}px`);

          el.style.setProperty('--pan-near-x', `${panNearX}px`);
          el.style.setProperty('--pan-near-y', `${panNearY}px`);

          el.style.setProperty('--pan-rot-x', `${panRotX}deg`);
          el.style.setProperty('--pan-rot-y', `${panRotY}deg`);

          el.style.setProperty('--mouse-norm-x', `${mouseNormX}%`);
          el.style.setProperty('--mouse-norm-y', `${mouseNormY}%`);

          // Backward compatibility
          el.style.setProperty('--pan-x', `${panMidX}px`);
          el.style.setProperty('--pan-y', `${panMidY}px`);
        }

        if (Math.abs(effectiveTargetX - currentX) < 0.0005 && Math.abs(effectiveTargetY - currentY) < 0.0005) {
          isMoving = false;
        }
      }
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    animId = requestAnimationFrame(updateParallax);

    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('touchmove', onTouchMove);
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
        // Default CSS variables for multi-depth parallax offsets
        ['--pan-sky-x' as string]: '0px',
        ['--pan-sky-y' as string]: '0px',
        ['--pan-far-x' as string]: '0px',
        ['--pan-far-y' as string]: '0px',
        ['--pan-mid-x' as string]: '0px',
        ['--pan-mid-y' as string]: '0px',
        ['--pan-near-x' as string]: '0px',
        ['--pan-near-y' as string]: '0px',
        ['--pan-rot-x' as string]: '0deg',
        ['--pan-rot-y' as string]: '0deg',
        ['--mouse-norm-x' as string]: '50%',
        ['--mouse-norm-y' as string]: '50%',
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

