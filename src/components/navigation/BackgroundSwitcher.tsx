import React, { useState, useEffect, useRef } from 'react';
import { Image as ImageIcon, Shuffle, Check } from 'lucide-react';
import { LandscapeBackground } from '../../types.ts';
import { BACKGROUND_COLLECTION } from '../../data/timeline.ts';

interface BackgroundSwitcherProps {
  currentBackground: LandscapeBackground;
  onSelectBackground: (bg: LandscapeBackground) => void;
  onRandomizeBackground: () => void;
}

export const BackgroundSwitcher: React.FC<BackgroundSwitcherProps> = ({
  currentBackground,
  onSelectBackground,
  onRandomizeBackground,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Close on outside click or touch
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div id="landscape-background-switcher" ref={containerRef} className="relative pointer-events-auto">
      {/* Glassy Translucent Trigger Pill with lowered opacity */}
      <div className="flex items-center gap-1 p-0.5 sm:p-1 rounded-full backdrop-blur-xl bg-black/25 sm:bg-white/[0.035] border border-white/[0.12] shadow-[0_8px_24px_0_rgba(0,0,0,0.22)] ring-1 ring-white/[0.06] transition-all duration-300">
        <button
          id="bg-switcher-menu-btn"
          onClick={() => setIsOpen(!isOpen)}
          className="min-h-[36px] sm:min-h-[40px] flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 text-left text-[10px] sm:text-[11px] font-sans tracking-[0.15em] text-[#f7f2ea] hover:text-white transition-colors focus:outline-none"
          title="Change photographic scene"
        >
          <ImageIcon className="w-3.5 h-3.5 text-[#df9c53] shrink-0" />
          <span className="hidden md:inline font-medium max-w-[120px] truncate">
            {currentBackground.name}
          </span>
          <span className="md:hidden font-medium">Scene</span>
        </button>

        {/* Shuffle button to pick another background randomly */}
        <button
          id="bg-shuffle-btn"
          onClick={(e) => {
            e.stopPropagation();
            onRandomizeBackground();
          }}
          className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full text-[#baa9bc] hover:text-[#f7f2ea] hover:bg-white/[0.08] transition-all duration-200 focus:outline-none shrink-0"
          aria-label="Randomize background image"
          title="Randomize photographic background"
        >
          <Shuffle className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
        </button>
      </div>

      {/* Glass Dropdown for Background Selection */}
      {isOpen && (
        <div
          id="background-selection-dropdown"
          className="absolute right-0 top-11 sm:top-12 w-[calc(100vw-20px)] max-w-xs sm:w-64 p-3 rounded-2xl backdrop-blur-2xl bg-[#0f1218]/90 sm:bg-[#0f1218]/70 border border-white/[0.12] shadow-[0_16px_48px_0_rgba(0,0,0,0.35)] ring-1 ring-white/[0.06] z-50 max-h-[75vh] overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200"
        >
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/[0.08]">
            <span className="text-xs text-[#f7f2ea] font-serif italic">
              Photographic Scenes
            </span>
            <button
              onClick={() => {
                onRandomizeBackground();
                setIsOpen(false);
              }}
              className="flex items-center gap-1 text-[10px] text-[#df9c53] hover:text-[#f5cb98] uppercase tracking-wider font-sans"
            >
              <Shuffle className="w-2.5 h-2.5" />
              <span>Random</span>
            </button>
          </div>

          <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
            {BACKGROUND_COLLECTION.map((bg) => {
              const isSelected = bg.id === currentBackground.id;
              return (
                <button
                  key={bg.id}
                  onClick={() => {
                    onSelectBackground(bg);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center gap-2.5 p-1.5 rounded-xl text-left transition-all duration-200 ${
                    isSelected
                      ? 'bg-white/[0.08] border border-white/[0.12] text-[#f7f2ea]'
                      : 'text-[#baa9bc] hover:bg-white/[0.06] hover:text-[#f7f2ea]'
                  }`}
                >
                  <img
                    src={bg.url}
                    alt={bg.name}
                    referrerPolicy="no-referrer"
                    className="w-10 h-8 rounded-lg object-cover border border-white/10 shrink-0"
                  />
                  <div className="truncate flex-1 min-w-0">
                    <p className="text-xs font-medium text-white truncate">{bg.name}</p>
                    <p className="text-[10px] text-[#baa9bc] truncate">{bg.era}</p>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-[#df9c53] shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
