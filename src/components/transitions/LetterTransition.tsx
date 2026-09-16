import React from 'react';
import { Sparkles } from 'lucide-react';

interface LetterTransitionProps {
  phase: 'idle' | 'wind' | 'portal' | 'blur' | 'navigate';
  destinationTitle?: string;
  destinationSubtitle?: string;
}

export const LetterTransition: React.FC<LetterTransitionProps> = ({
  phase,
  destinationTitle = 'Destination',
  destinationSubtitle,
}) => {
  if (phase === 'idle') return null;

  const isUniverse = destinationTitle.toLowerCase().includes('universe');

  return (
    <div
      id="cinematic-portal-transition"
      className="fixed inset-0 z-50 pointer-events-none transition-all duration-1000 flex flex-col items-center justify-center overflow-hidden"
      style={{
        backdropFilter:
          phase === 'blur' || phase === 'navigate'
            ? 'blur(20px) saturate(1.4)'
            : phase === 'portal'
            ? 'blur(10px) saturate(1.2)'
            : 'blur(3px)',
        backgroundColor:
          phase === 'navigate'
            ? 'rgba(8, 10, 14, 0.96)'
            : phase === 'blur'
            ? 'rgba(10, 12, 18, 0.80)'
            : 'rgba(12, 14, 20, 0.35)',
      }}
      aria-hidden="true"
    >
      {/* Background Volumetric Radiance */}
      <div
        className={`absolute inset-0 bg-radial from-[rgba(223,156,83,0.18)] via-[rgba(16,18,24,0.4)] to-transparent transition-opacity duration-1000 ${
          phase === 'portal' || phase === 'blur' || phase === 'navigate' ? 'opacity-100 scale-125' : 'opacity-0 scale-75'
        }`}
      />

      {/* Expanding Glassy Rings & Harmonic Aperture */}
      <div className="relative flex items-center justify-center pointer-events-none scale-75 xs:scale-90 sm:scale-100">
        {/* Ring 1: Inner Glass Pulse */}
        <div
          className={`rounded-full border border-white/40 backdrop-blur-md transition-all duration-1000 ease-out ${
            phase === 'portal' || phase === 'blur' || phase === 'navigate'
              ? 'w-64 h-64 sm:w-96 sm:h-96 scale-125 opacity-70 bg-white/[0.04] shadow-[0_0_90px_rgba(223,156,83,0.35)]'
              : 'w-24 h-24 scale-50 opacity-0'
          }`}
        />

        {/* Ring 2: Outer Specular Celestial Ripple */}
        <div
          className={`absolute rounded-full border border-[#df9c53]/50 transition-all duration-1000 delay-150 ease-out ${
            phase === 'portal' || phase === 'blur' || phase === 'navigate'
              ? 'w-[320px] h-[320px] sm:w-[560px] sm:h-[560px] scale-110 opacity-60 shadow-[0_0_120px_rgba(245,203,152,0.2)]'
              : 'w-32 h-32 scale-50 opacity-0'
          }`}
        />

        {/* Ring 3: Deep Orbital Starlight Field */}
        <div
          className={`absolute rounded-full border border-white/15 transition-all duration-1000 delay-300 ease-out ${
            phase === 'portal' || phase === 'blur' || phase === 'navigate'
              ? 'w-[440px] h-[440px] sm:w-[800px] sm:h-[800px] scale-105 opacity-40'
              : 'w-48 h-48 scale-50 opacity-0'
          }`}
        />

        {/* Shimmering Center Light Prism */}
        <div
          className={`absolute w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-radial from-[#fff4e0] via-[#df9c53]/50 to-transparent blur-xl transition-all duration-700 ${
            phase === 'portal' || phase === 'blur' ? 'scale-150 opacity-95' : 'scale-50 opacity-0'
          }`}
        />
      </div>

      {/* Floating Glassy Transition Card */}
      <div
        className={`relative z-10 px-5 sm:px-8 py-5 sm:py-6 mt-6 sm:mt-8 rounded-2xl sm:rounded-3xl backdrop-blur-2xl bg-black/50 sm:bg-[#0f1218]/60 border border-white/[0.14] shadow-[0_24px_64px_0_rgba(0,0,0,0.45)] ring-1 ring-white/[0.08] text-center max-w-[calc(100vw-32px)] sm:max-w-sm w-full mx-4 transition-all duration-700 ${
          phase === 'blur' || phase === 'navigate'
            ? 'opacity-100 translate-y-0 scale-100'
            : phase === 'portal'
            ? 'opacity-90 translate-y-2 scale-95'
            : 'opacity-0 translate-y-6 scale-90'
        }`}
      >
        <div className="flex items-center justify-center gap-1.5 mb-1.5 sm:mb-2 text-[#e5aa6d]">
          <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" style={{ animationDuration: '6s' }} />
          <span className="font-sans text-[9px] sm:text-[10px] tracking-[0.22em] sm:tracking-[0.25em] uppercase font-semibold text-[#baa9bc]">
            {isUniverse ? 'Dimensional Portal Engaged' : 'Atmospheric Crossing'}
          </span>
        </div>

        <h3 className="font-serif italic text-xl sm:text-2xl text-[#f7f2ea] tracking-wide mb-1 truncate px-2">
          {destinationTitle}
        </h3>

        {isUniverse && (
          <div className="my-2 flex flex-col items-center gap-1.5">
            <p className="font-mono text-[9.5px] text-[#baa9bc] tracking-wider">
              https://ating-universe.vercel.app/
            </p>
            <a
              href="https://ating-universe.vercel.app/"
              target="_parent"
              className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#df9c53]/20 hover:bg-[#df9c53]/35 text-[#fff4e0] text-[9.5px] font-sans tracking-widest uppercase border border-[#df9c53]/40 transition-colors"
            >
              Click if not redirected
            </a>
          </div>
        )}

        <div className="flex items-center justify-center gap-2 mt-2 sm:mt-2.5 pt-2 sm:pt-2.5 border-t border-white/[0.08]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#df9c53] animate-ping" />
          <p className="font-sans text-[9px] sm:text-[10px] uppercase tracking-[0.2em] sm:tracking-[0.22em] text-[#df9c53] font-medium">
            {destinationSubtitle || (isUniverse ? 'Replacing parent window...' : 'Crossing to Destination...')}
          </p>
        </div>
      </div>
    </div>
  );
};

