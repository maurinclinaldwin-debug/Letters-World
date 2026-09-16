import React from 'react';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { ATING_UNIVERSE_URL, getSafeUniverseUrl, replaceParentUrl } from '../../utils/navigation.ts';

interface UniverseBackButtonProps {
  onNavigate?: () => void;
}

export const UniverseBackButton: React.FC<UniverseBackButtonProps> = ({ onNavigate }) => {
  const safeUniverseUrl = getSafeUniverseUrl(ATING_UNIVERSE_URL);

  const handleClick = () => {
    // Immediately replace parent URL with current user activation gesture
    replaceParentUrl(safeUniverseUrl);
    if (onNavigate) {
      onNavigate();
    }
  };

  return (
    <a
      id="ating-universe-back-link"
      href={safeUniverseUrl}
      target="_parent"
      rel="noreferrer"
      onClick={handleClick}
      aria-label="Return to Ating Universe"
      className="group min-h-[38px] sm:min-h-[42px] flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1.5 rounded-full backdrop-blur-xl bg-black/35 sm:bg-white/[0.04] hover:bg-white/[0.09] border border-white/[0.12] hover:border-[#df9c53]/50 shadow-[0_8px_24px_0_rgba(0,0,0,0.22)] ring-1 ring-white/[0.06] text-[#f7f2ea] text-[10px] sm:text-xs font-sans tracking-[0.18em] uppercase transition-all duration-300 pointer-events-auto"
    >
      <ArrowLeft className="w-3.5 h-3.5 text-[#df9c53] group-hover:-translate-x-1 transition-transform duration-300 shrink-0" />
      <span className="font-medium inline sm:hidden">Universe</span>
      <span className="font-medium hidden sm:inline">Portal Return</span>
      <Sparkles className="w-2.5 h-2.5 text-[#df9c53]/70 opacity-50 group-hover:opacity-100 transition-opacity hidden xs:block" />
    </a>
  );
};

