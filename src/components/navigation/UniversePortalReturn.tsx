import React, { useState } from 'react';
import { Compass, Sparkles, MoveUpRight } from 'lucide-react';
import { ATING_UNIVERSE_URL, getSafeUniverseUrl, replaceParentUrl } from '../../utils/navigation.ts';

interface UniversePortalReturnProps {
  onNavigate?: () => void;
  isTransitioning?: boolean;
}

export const UniversePortalReturn: React.FC<UniversePortalReturnProps> = ({
  onNavigate,
  isTransitioning = false,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const safeUniverseUrl = getSafeUniverseUrl(ATING_UNIVERSE_URL);

  const handleClick = () => {
    if (onNavigate) {
      onNavigate();
    }
    // Synchronously invoke parent replacement during the active user gesture
    replaceParentUrl(safeUniverseUrl);
  };

  return (
    <div
      id="dedicated-ating-portal-dock"
      className="fixed bottom-5 left-4 sm:left-8 z-30 pointer-events-auto"
    >
      <a
        id="universe-portal-return-link"
        href={safeUniverseUrl}
        target="_parent"
        rel="noreferrer"
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        aria-label="Return to Ating Universe"
        className="group relative flex items-center gap-3 px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-2xl backdrop-blur-2xl bg-black/55 sm:bg-[#0c0f16]/75 hover:bg-[#121622]/90 border border-white/[0.14] hover:border-[#df9c53]/60 shadow-[0_12px_36px_rgba(0,0,0,0.55)] hover:shadow-[0_0_32px_rgba(223,156,83,0.35)] ring-1 ring-white/[0.08] transition-all duration-300 select-none overflow-hidden cursor-pointer"
      >
        {/* Ambient Portal Light Sweep */}
        <div
          className={`absolute inset-0 bg-gradient-to-r from-transparent via-[#df9c53]/15 to-transparent transition-transform duration-1000 pointer-events-none ${
            isHovered ? 'translate-x-full' : '-translate-x-full'
          }`}
        />

        {/* Dynamic Celestial Portal Orb */}
        <div className="relative flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 shrink-0">
          {/* Outer rotating stargate ring */}
          <div
            className={`absolute inset-0 rounded-full border border-dashed border-[#df9c53]/60 transition-all duration-700 ${
              isHovered ? 'animate-spin border-[#f5cb98] scale-110' : 'opacity-70 animate-spin'
            }`}
            style={{ animationDuration: isHovered ? '4s' : '12s' }}
          />

          {/* Inner counter-rotating ring */}
          <div
            className="absolute inset-1 rounded-full border border-white/30 animate-spin"
            style={{ animationDuration: '8s', animationDirection: 'reverse' }}
          />

          {/* Core Portal Eye Glow */}
          <div
            className={`w-4 h-4 rounded-full bg-radial from-[#ffffff] via-[#df9c53] to-transparent transition-all duration-300 ${
              isHovered ? 'scale-125 shadow-[0_0_16px_#f5cb98]' : 'scale-90 opacity-85'
            }`}
          />

          <Compass className="w-3.5 h-3.5 text-[#0e1015] absolute z-10 opacity-90 transition-transform duration-300 group-hover:rotate-45" />
        </div>

        {/* Portal Typography & Target Domain Info */}
        <div className="flex flex-col text-left pr-1">
          <div className="flex items-center gap-1.5">
            <span className="font-sans text-[11px] sm:text-xs font-medium tracking-[0.16em] uppercase text-[#f7f2ea] group-hover:text-[#fff4e0] transition-colors">
              Return to Universe
            </span>
            <Sparkles className="w-3 h-3 text-[#df9c53] opacity-60 group-hover:opacity-100 transition-opacity" />
          </div>
          <div className="flex items-center gap-1 text-[9px] sm:text-[9.5px] font-sans text-[#baa9bc] tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-mono text-[8.5px] sm:text-[9px] text-[#e5aa6d]/90">
              ating-universe.vercel.app
            </span>
            <MoveUpRight className="w-2.5 h-2.5 text-[#baa9bc] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </div>
        </div>
      </a>
    </div>
  );
};
