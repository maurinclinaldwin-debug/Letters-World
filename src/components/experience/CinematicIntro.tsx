import React, { useEffect, useState } from 'react';

interface CinematicIntroProps {
  progress: number;
  onExplorePromptClick?: () => void;
  backgroundName?: string;
}

export const CinematicIntro: React.FC<CinematicIntroProps> = ({
  progress,
  onExplorePromptClick,
  backgroundName,
}) => {
  const [stage, setStage] = useState<'black' | 'sky' | 'mountains' | 'meadow' | 'title' | 'ready'>('black');

  useEffect(() => {
    // Choreographed entrance sequence
    const tSky = setTimeout(() => setStage('sky'), 350);
    const tMountains = setTimeout(() => setStage('mountains'), 850);
    const tMeadow = setTimeout(() => setStage('meadow'), 1400);
    const tTitle = setTimeout(() => setStage('title'), 1900);
    const tReady = setTimeout(() => setStage('ready'), 2500);

    return () => {
      clearTimeout(tSky);
      clearTimeout(tMountains);
      clearTimeout(tMeadow);
      clearTimeout(tTitle);
      clearTimeout(tReady);
    };
  }, []);

  // As user scrolls away from prologue (progress > 0.16), fade out the title seamlessly
  const scrollFade = Math.max(0, 1 - progress / 0.16);

  // Black overlay curtain fading out progressively
  const blackOpacity =
    stage === 'black'
      ? 1.0
      : stage === 'sky'
      ? 0.75
      : stage === 'mountains'
      ? 0.4
      : stage === 'meadow'
      ? 0.15
      : 0;

  if (scrollFade <= 0.01 && stage === 'ready') return null;

  return (
    <>
      {/* 1. Black emergence veil */}
      <div
        id="intro-black-curtain"
        className="fixed inset-0 z-30 pointer-events-none transition-opacity duration-[1400ms] ease-out bg-[#0a0b10]"
        style={{ opacity: blackOpacity }}
        aria-hidden="true"
      />

      {/* 2. Prologue Typography with Glassy Translucent Vibes */}
      <div
        id="intro-prologue-overlay"
        className="fixed inset-0 z-20 pointer-events-none flex flex-col justify-between items-center px-4 pt-16 pb-6 sm:px-12 sm:pt-24 sm:pb-12 transition-all duration-700 ease-out"
        style={{
          opacity: stage === 'title' || stage === 'ready' ? scrollFade : 0,
          transform: `translateY(${progress * -40}px)`,
        }}
      >
        <div className="w-full shrink-0 h-2 sm:h-8" />

        {/* Hero Words in Frosted Glass Container with lowered opacity */}
        <div
          id="hero-glass-words-panel"
          className="relative max-w-xl w-full mx-auto my-auto text-center px-5 py-6 sm:px-12 sm:py-12 rounded-2xl sm:rounded-3xl backdrop-blur-2xl bg-black/25 sm:bg-white/[0.035] border border-white/[0.12] shadow-[0_16px_48px_0_rgba(0,0,0,0.25)] ring-1 ring-white/[0.06] transition-all duration-1000"
          style={{
            opacity: stage === 'title' || stage === 'ready' ? 1 : 0,
            transform: stage === 'title' || stage === 'ready' ? 'translateY(0) scale(1)' : 'translateY(16px) scale(0.97)',
          }}
        >
          {/* Subtle Glass Specular Highlights */}
          <div className="absolute top-0 inset-x-8 sm:inset-x-12 h-[1px] bg-gradient-to-r from-transparent via-white/35 to-transparent pointer-events-none" />

          <p
            id="intro-universe-label"
            className="font-sans text-[9px] sm:text-xs tracking-[0.3em] sm:tracking-[0.35em] text-[#df9c53] uppercase font-semibold transition-all duration-1000 delay-100"
          >
            Ating Universe
          </p>

          <h1
            id="intro-letters-title"
            className="font-serif text-4xl xs:text-5xl sm:text-7xl lg:text-8xl tracking-[0.12em] sm:tracking-[0.16em] text-[#f7f2ea] font-light leading-none my-2.5 sm:my-3 drop-shadow-[0_4px_24px_rgba(0,0,0,0.5)] transition-all duration-1000 delay-200"
          >
            LETTERS
          </h1>

          <p
            id="intro-subheading"
            className="font-serif italic text-xs sm:text-xl text-[#d9cfc5] tracking-wide font-normal max-w-md mx-auto transition-all duration-1000 delay-400 px-2"
          >
            Words we left along the way.
          </p>

          {backgroundName && (
            <div className="mt-3.5 sm:mt-4 pt-2.5 sm:pt-3 border-t border-white/[0.08] flex items-center justify-center gap-2 text-[9px] sm:text-[10px] font-sans tracking-[0.2em] text-[#baa9bc] uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-[#df9c53]/70" />
              <span className="truncate max-w-[200px]">{backgroundName}</span>
            </div>
          )}
        </div>

        {/* Scroll Instruction prompt in Frosted Glass Pill */}
        <div className="pointer-events-auto mt-2 sm:mt-4 shrink-0">
          <button
            id="scroll-to-wander-prompt"
            onClick={onExplorePromptClick}
            className="group min-h-[44px] flex items-center gap-2.5 sm:gap-3 px-5 py-2.5 sm:px-6 sm:py-3 rounded-full backdrop-blur-xl bg-black/25 sm:bg-white/[0.035] border border-white/[0.12] hover:border-white/[0.24] shadow-[0_8px_24px_0_rgba(0,0,0,0.2)] ring-1 ring-white/[0.06] text-[#baa9bc] hover:text-[#f7f2ea] transition-all duration-400 focus:outline-none"
            style={{
              opacity: stage === 'ready' ? 0.9 : 0,
              transform: stage === 'ready' ? 'translateY(0)' : 'translateY(10px)',
            }}
          >
            <span className="font-sans text-[10px] sm:text-[11px] tracking-[0.25em] sm:tracking-[0.3em] uppercase font-medium">
              Scroll to wander
            </span>
            <div className="w-1.5 h-1.5 rounded-full bg-[#df9c53] group-hover:scale-125 transition-transform" />
          </button>
        </div>
      </div>
    </>
  );
};
