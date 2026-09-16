import React, { useState, useEffect, useRef } from 'react';
import { Calendar, Sun, Moon, Sparkles, RefreshCw, Check, Clock } from 'lucide-react';
import { CalendarThemeConfig, TimeOfDayPhase } from '../../types.ts';

interface CalendarThemeIndicatorProps {
  theme: CalendarThemeConfig;
  isLiveSync: boolean;
  onSelectPhase: (phase: TimeOfDayPhase | null) => void;
  onToggleAugust22: (enable: boolean) => void;
  onResetLive: () => void;
}

export const CalendarThemeIndicator: React.FC<CalendarThemeIndicatorProps> = ({
  theme,
  isLiveSync,
  onSelectPhase,
  onToggleAugust22,
  onResetLive,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Close dropdown on outside click or tap
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

  const getPhaseIcon = () => {
    if (theme.isAugust22) return <Sparkles className="w-3.5 h-3.5 text-[#fde047] animate-pulse" />;
    if (theme.phase === 'dawn') return <Sun className="w-3.5 h-3.5 text-[#f5cb98]" />;
    if (theme.phase === 'day') return <Sun className="w-3.5 h-3.5 text-[#fde047]" />;
    if (theme.phase === 'golden_hour') return <Sun className="w-3.5 h-3.5 text-[#f97316]" />;
    if (theme.phase === 'dusk') return <Moon className="w-3.5 h-3.5 text-[#c084fc]" />;
    return <Moon className="w-3.5 h-3.5 text-[#818cf8]" />;
  };

  return (
    <div id="calendar-theme-engine-widget" ref={containerRef} className="relative pointer-events-auto">
      {/* Frosted Glass Pill Trigger */}
      <button
        id="calendar-theme-trigger-btn"
        onClick={() => setIsOpen(!isOpen)}
        className="min-h-[38px] sm:min-h-[42px] flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-full backdrop-blur-xl bg-black/25 sm:bg-white/[0.035] hover:bg-white/[0.08] border border-white/[0.12] hover:border-white/[0.22] shadow-[0_8px_24px_0_rgba(0,0,0,0.22)] ring-1 ring-white/[0.06] text-[#f7f2ea] text-[10px] sm:text-xs font-sans tracking-[0.15em] transition-all duration-300 focus:outline-none"
        title="Real-Time Calendar Theme Engine"
        aria-label="Calendar Theme Engine Settings"
      >
        <span className="flex items-center justify-center">{getPhaseIcon()}</span>

        <span className="hidden md:inline font-medium capitalize">
          {theme.phaseLabel}
        </span>

        <span className="text-[#baa9bc] hidden lg:inline text-[10px] tracking-widest uppercase">
          • {theme.formattedTime}
        </span>

        {/* Live sync pulse indicator */}
        <span
          className={`w-1.5 h-1.5 rounded-full ${
            theme.isAugust22
              ? 'bg-[#fde047] animate-ping'
              : isLiveSync
              ? 'bg-emerald-400/80 shadow-[0_0_6px_rgba(52,211,153,0.6)]'
              : 'bg-[#df9c53]'
          }`}
          title={isLiveSync ? 'Live Calendar Sync Active' : 'Manual Atmosphere Preview'}
        />
      </button>

      {/* Glassy Theme Engine Dropdown */}
      {isOpen && (
        <div
          id="calendar-theme-dropdown"
          className="absolute right-0 top-11 sm:top-12 w-[calc(100vw-20px)] max-w-xs sm:w-72 p-3 sm:p-3.5 rounded-2xl backdrop-blur-2xl bg-[#0f1218]/90 sm:bg-[#0f1218]/70 border border-white/[0.12] shadow-[0_16px_48px_0_rgba(0,0,0,0.4)] ring-1 ring-white/[0.06] z-50 max-h-[80vh] overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200"
        >
          {/* Header info */}
          <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-white/[0.08]">
            <div className="flex items-center gap-1.5 text-xs text-[#f7f2ea] font-serif italic">
              <Clock className="w-3.5 h-3.5 text-[#df9c53]" />
              <span>Calendar Theme Engine</span>
            </div>
            <button
              onClick={() => {
                onResetLive();
              }}
              className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-sans tracking-widest uppercase transition-all ${
                isLiveSync
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-white/10 text-[#baa9bc] hover:text-white'
              }`}
              title="Reset to real-time calendar and clock"
            >
              <RefreshCw className="w-2.5 h-2.5" />
              <span>{isLiveSync ? 'Live Sync' : 'Re-sync'}</span>
            </button>
          </div>

          {/* Current Live Calendar Status Card */}
          <div className="p-2.5 rounded-xl bg-white/[0.035] border border-white/[0.08] mb-3 text-[11px] space-y-1">
            <div className="flex items-center justify-between text-[#baa9bc]">
              <span className="font-sans uppercase tracking-widest text-[9px]">Calendar Date</span>
              <span className="text-[#f7f2ea] font-medium">{theme.formattedDate}</span>
            </div>
            <div className="flex items-center justify-between text-[#baa9bc]">
              <span className="font-sans uppercase tracking-widest text-[9px]">Active Season</span>
              <span className="text-[#f7f2ea]">{theme.seasonLabel}</span>
            </div>
            <div className="flex items-center justify-between text-[#baa9bc]">
              <span className="font-sans uppercase tracking-widest text-[9px]">Atmospheric Motes</span>
              <span className="text-[#e5aa6d] capitalize font-mono text-[10px]">
                {theme.particleStyle.replace('_', ' ')}
              </span>
            </div>
            <div className="flex items-center justify-between text-[#baa9bc] pt-0.5 border-t border-white/[0.04]">
              <span className="font-sans uppercase tracking-widest text-[9px]">Dynamic Weather</span>
              <span className="text-[#f7f2ea] text-[10px] font-mono truncate max-w-[140px]" title="Wisps of fog & drifting leaves transitioning by altitude & time">
                {theme.isAugust22
                  ? 'Stardust Mist & Gold Leaves'
                  : theme.phase === 'dawn'
                  ? 'Valley Fog & Dew Petals'
                  : theme.phase === 'golden_hour'
                  ? 'Golden Haze & Amber Leaves'
                  : theme.phase === 'dusk'
                  ? 'Twilight Mist & Soft Leaves'
                  : theme.phase === 'midnight'
                  ? 'Night Mist & Silver Leaves'
                  : 'Sunlit Haze & Forest Leaves'}
              </span>
            </div>
          </div>

          {/* Celestial Phase Preview Options */}
          <div className="space-y-1">
            <p className="text-[9px] uppercase tracking-widest text-[#baa9bc] font-sans px-1 pb-1">
              Celestial Phases
            </p>

            <button
              onClick={() => {
                onSelectPhase('dawn');
                onToggleAugust22(false);
              }}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-left text-xs transition-all ${
                theme.phase === 'dawn' && !theme.isAugust22
                  ? 'bg-white/[0.08] text-[#f7f2ea] border border-white/[0.12]'
                  : 'text-[#d9cfc5] hover:bg-white/[0.06] hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2">
                <Sun className="w-3.5 h-3.5 text-[#f5cb98]" />
                <span>Alpine Dawn (5 AM - 8 AM)</span>
              </div>
              {theme.phase === 'dawn' && !theme.isAugust22 && <Check className="w-3 h-3 text-[#df9c53]" />}
            </button>

            <button
              onClick={() => {
                onSelectPhase('day');
                onToggleAugust22(false);
              }}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-left text-xs transition-all ${
                theme.phase === 'day' && !theme.isAugust22
                  ? 'bg-white/[0.08] text-[#f7f2ea] border border-white/[0.12]'
                  : 'text-[#d9cfc5] hover:bg-white/[0.06] hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2">
                <Sun className="w-3.5 h-3.5 text-[#fde047]" />
                <span>Mountain Daylight (8 AM - 5 PM)</span>
              </div>
              {theme.phase === 'day' && !theme.isAugust22 && <Check className="w-3 h-3 text-[#df9c53]" />}
            </button>

            <button
              onClick={() => {
                onSelectPhase('golden_hour');
                onToggleAugust22(false);
              }}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-left text-xs transition-all ${
                theme.phase === 'golden_hour' && !theme.isAugust22
                  ? 'bg-white/[0.08] text-[#f7f2ea] border border-white/[0.12]'
                  : 'text-[#d9cfc5] hover:bg-white/[0.06] hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2">
                <Sun className="w-3.5 h-3.5 text-[#f97316]" />
                <span>Golden Hour (5 PM - 8 PM)</span>
              </div>
              {theme.phase === 'golden_hour' && !theme.isAugust22 && <Check className="w-3 h-3 text-[#df9c53]" />}
            </button>

            <button
              onClick={() => {
                onSelectPhase('dusk');
                onToggleAugust22(false);
              }}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-left text-xs transition-all ${
                theme.phase === 'dusk' && !theme.isAugust22
                  ? 'bg-white/[0.08] text-[#f7f2ea] border border-white/[0.12]'
                  : 'text-[#d9cfc5] hover:bg-white/[0.06] hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2">
                <Moon className="w-3.5 h-3.5 text-[#c084fc]" />
                <span>Twilight Dusk (8 PM - 10 PM)</span>
              </div>
              {theme.phase === 'dusk' && !theme.isAugust22 && <Check className="w-3 h-3 text-[#df9c53]" />}
            </button>

            <button
              onClick={() => {
                onSelectPhase('midnight');
                onToggleAugust22(false);
              }}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-left text-xs transition-all ${
                theme.phase === 'midnight' && !theme.isAugust22
                  ? 'bg-white/[0.08] text-[#f7f2ea] border border-white/[0.12]'
                  : 'text-[#d9cfc5] hover:bg-white/[0.06] hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2">
                <Moon className="w-3.5 h-3.5 text-[#818cf8]" />
                <span>Midnight Starlight (10 PM - 5 AM)</span>
              </div>
              {theme.phase === 'midnight' && !theme.isAugust22 && <Check className="w-3 h-3 text-[#df9c53]" />}
            </button>

            {/* Special August 22 Milestone Resonance */}
            <button
              onClick={() => {
                onToggleAugust22(true);
              }}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-left text-xs transition-all mt-1 ${
                theme.isAugust22
                  ? 'bg-[#df9c53]/25 text-[#fde047] border border-[#fde047]/40 font-medium'
                  : 'text-[#f5cb98] hover:bg-white/[0.06]'
              }`}
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-[#fde047]" />
                <span>August 22 • Milestone Starlight</span>
              </div>
              {theme.isAugust22 && <Check className="w-3 h-3 text-[#fde047]" />}
            </button>
          </div>

          <div className="mt-3 pt-2 border-t border-white/[0.08] text-center">
            <p className="text-[9px] text-[#baa9bc] tracking-wider font-sans">
              Synced with your device's calendar & clock
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
