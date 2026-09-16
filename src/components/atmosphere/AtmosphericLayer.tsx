import React from 'react';
import { CalendarThemeConfig } from '../../types.ts';
import { AmbientParticles } from './AmbientParticles.tsx';
import { DynamicWeatherLayer } from './DynamicWeatherLayer.tsx';

interface AtmosphericLayerProps {
  progress: number;
  theme?: CalendarThemeConfig;
}

export const AtmosphericLayer: React.FC<AtmosphericLayerProps> = React.memo(({ progress, theme }) => {
  // As progress goes from 0.0 to 1.0, lighting evolves from warm sunset peach toward cool dawn cream
  const dawnFactor = Math.max(0, Math.min(1, (progress - 0.5) / 0.4));
  const isNight = theme?.phase === 'midnight' || theme?.phase === 'dusk';
  const isGolden = theme?.phase === 'golden_hour';
  const isAugust22 = theme?.isAugust22;

  return (
    <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden" aria-hidden="true">
      {/* 1. Cinematic peripheral lens vignette with deep soft falloff */}
      <div
        className="absolute inset-0 bg-radial-[circle_at_center,transparent_45%,rgba(14,16,22,0.68)_100%]"
      />

      {/* 2. Real-Time Calendar Theme Sky Gradient & Atmospheric Tint */}
      {theme && (
        <div
          className="absolute inset-0 transition-opacity duration-1000 ease-out pointer-events-none"
          style={{
            background: theme.skyGradient,
            opacity: 0.88,
          }}
        />
      )}

      {/* 3. Volumetric Crepuscular Sunbeams */}
      {!isNight && (
        <div
          className="absolute -top-32 -left-20 w-[140%] h-[120%] pointer-events-none animate-sunbeam-shimmer mix-blend-screen will-change-transform opacity-40"
          style={{
            transform: 'translate3d(calc(var(--pan-sky-x, 0px) * -0.6), calc(var(--pan-sky-y, 0px) * -0.6), 0)',
            background: isGolden
              ? 'repeating-linear-gradient(108deg, rgba(253, 186, 116, 0.09) 0px, transparent 40px, rgba(254, 215, 170, 0.12) 80px, transparent 130px)'
              : 'repeating-linear-gradient(112deg, rgba(255, 247, 237, 0.07) 0px, transparent 45px, rgba(254, 243, 199, 0.10) 90px, transparent 150px)',
            maskImage: 'radial-gradient(ellipse at 30% 15%, black 20%, transparent 75%)',
            WebkitMaskImage: 'radial-gradient(ellipse at 30% 15%, black 20%, transparent 75%)',
          }}
        />
      )}

      {/* 4. Photonic Celestial Bloom */}
      {!isNight && (
        <div
          className="absolute -top-24 right-1/4 w-[520px] h-[520px] pointer-events-none mix-blend-screen opacity-70 will-change-transform"
          style={{
            transform: 'translate3d(var(--pan-sky-x, 0px), var(--pan-sky-y, 0px), 0)',
            background: isGolden
              ? 'radial-gradient(circle, rgba(254, 215, 170, 0.22) 0%, rgba(253, 186, 116, 0.08) 45%, transparent 70%)'
              : 'radial-gradient(circle, rgba(255, 247, 237, 0.18) 0%, rgba(254, 243, 199, 0.06) 45%, transparent 70%)',
            filter: 'blur(20px)',
          }}
        />
      )}

      {/* 5. Celestial Starlight Halo & August 22 Milestone Resonance */}
      {(isNight || isAugust22) && (
        <div
          className="absolute top-0 inset-x-0 h-[60vh] pointer-events-none animate-celestial-breathe mix-blend-screen will-change-transform"
          style={{
            background: isAugust22
              ? 'radial-gradient(circle at 50% 18%, rgba(253, 224, 71, 0.14) 0%, rgba(223, 156, 83, 0.08) 40%, transparent 75%)'
              : 'radial-gradient(circle at 65% 20%, rgba(129, 140, 248, 0.10) 0%, rgba(192, 132, 252, 0.05) 45%, transparent 70%)',
          }}
        />
      )}

      {/* 6. Dynamic golden hour / dawn rim highlight */}
      <div
        className="absolute inset-0 transition-opacity duration-1000 pointer-events-none"
        style={{
          background: dawnFactor > 0.5
            ? 'radial-gradient(ellipse at 80% 25%, rgba(255, 235, 215, 0.14) 0%, transparent 62%)'
            : 'radial-gradient(ellipse at 75% 35%, rgba(255, 205, 160, 0.18) 0%, transparent 60%)',
          opacity: 0.85,
        }}
      />

      {/* 7. Horizon Depth Mist & Cloud Banks */}
      <div
        className="absolute inset-x-0 bottom-24 h-56 pointer-events-none overflow-hidden opacity-35 mix-blend-screen will-change-transform"
        style={{
          transform: 'translate3d(var(--pan-far-x, 0px), var(--pan-far-y, 0px), 0)',
        }}
      >
        {/* Mist layer 1 */}
        <div
          className="absolute inset-0 w-[130%] h-full -left-[15%] animate-ambient-drift will-change-transform"
          style={{
            background: 'radial-gradient(ellipse at 50% 60%, rgba(240, 235, 225, 0.22) 0%, rgba(240, 235, 225, 0.08) 45%, transparent 75%)',
            filter: 'blur(12px)',
            transform: 'translate3d(0, 0, 0)',
          }}
        />
        {/* Mist layer 2 (counter-drifting) */}
        <div
          className="absolute inset-0 w-[130%] h-full -left-[10%] animate-ambient-drift-reverse opacity-60 will-change-transform"
          style={{
            background: isGolden
              ? 'radial-gradient(ellipse at 60% 70%, rgba(253, 186, 116, 0.20) 0%, transparent 65%)'
              : 'radial-gradient(ellipse at 40% 70%, rgba(215, 225, 240, 0.18) 0%, transparent 65%)',
            filter: 'blur(16px)',
            transform: 'translate3d(0, 0, 0)',
          }}
        />
      </div>

      {/* 8. Dynamic Weather Layer (Ethereal Fog Wisps & Drifting Leaves Transitioned by Progress & Time) */}
      <DynamicWeatherLayer progress={progress} theme={theme} />

      {/* 9. Canvas-Driven Multi-Depth Real-time Ambient Particles */}
      {theme && <AmbientParticles theme={theme} progress={progress} />}

      {/* 9. Subtle terrain shadow base */}
      <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-[#0e1015]/80 via-[#0e1015]/35 to-transparent pointer-events-none" />

      {/* 10. Tangible film grain */}
      <div className="absolute inset-0 opacity-15 film-grain pointer-events-none" />
    </div>
  );
});
