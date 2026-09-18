import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, MailOpen, ExternalLink, MapPin, Compass, ArrowRight, X } from 'lucide-react';
import { TimelineEntry } from '../../types.ts';

interface AnniversaryLetterCardProps {
  entry: TimelineEntry;
  themeIsMilestone22?: boolean;
  onOpenLetter: (entry: TimelineEntry) => void;
  onNavigateToUrl?: (url: string, title?: string) => void;
  onScrollToOtherLetter?: (targetProgress: number) => void;
  onDismiss?: () => void;
  allEntries?: TimelineEntry[];
}

export const AnniversaryLetterCard: React.FC<AnniversaryLetterCardProps> = ({
  entry,
  themeIsMilestone22 = false,
  onOpenLetter,
  onNavigateToUrl,
  onScrollToOtherLetter,
  onDismiss,
  allEntries = [],
}) => {
  const is11thMonthsary = entry.id === 'august-22-2026';
  const quote =
    entry.letterContent?.perspectives?.[0]?.quote ||
    (is11thMonthsary
      ? 'Every road we walk together feels quieter, safer, and infinitely more alive.'
      : 'One year down, a lifetime of mountain dawns still waiting for our footsteps.');

  const otherEntry = allEntries.find((e) => e.id !== entry.id);

  return (
    <motion.div
      id={`anniversary-card-${entry.id}`}
      initial={{ opacity: 0, y: 48, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 32, scale: 0.96 }}
      transition={{
        duration: 0.55,
        ease: [0.16, 1, 0.3, 1],
      }}
      className="relative w-full max-w-xl mx-auto rounded-2xl sm:rounded-3xl backdrop-blur-2xl bg-[#0c0f16]/85 sm:bg-[#0c0f16]/75 border border-white/[0.14] hover:border-[#df9c53]/60 shadow-[0_20px_60px_rgba(0,0,0,0.65)] ring-1 ring-white/[0.08] overflow-hidden transition-colors duration-300 pointer-events-auto select-none"
    >
      {/* 1. Subtle Specular Highlight */}
      <div className="absolute top-0 inset-x-8 sm:inset-x-12 h-[1px] bg-gradient-to-r from-transparent via-[#df9c53]/60 to-transparent pointer-events-none" />

      {/* 2. Ambient Starlight Glow behind card */}
      <div
        className="absolute -top-16 -right-16 w-44 h-44 rounded-full pointer-events-none blur-3xl opacity-35"
        style={{
          background: themeIsMilestone22
            ? 'radial-gradient(circle, #fde047 0%, #f59e0b 50%, transparent 80%)'
            : 'radial-gradient(circle, #df9c53 0%, #b45309 60%, transparent 80%)',
        }}
      />

      <div className="relative p-4 sm:p-6 flex flex-col gap-3.5">
        {/* Top Metadata Header */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#df9c53]/20 border border-[#df9c53]/40 text-[#f5cb98] text-[9.5px] sm:text-[10.5px] font-sans font-semibold tracking-[0.2em] uppercase">
              <Sparkles className="w-3 h-3 text-[#fde047]" />
              <span>Anniversary Letter</span>
            </span>

            {themeIsMilestone22 && (
              <span className="hidden xs:flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-400/20 border border-amber-400/50 text-[#fde047] text-[9px] font-sans tracking-widest uppercase animate-pulse">
                <span>22nd Starlight Resonance</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 text-[10px] sm:text-xs font-sans text-[#baa9bc] tracking-wider uppercase">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3 h-3 text-[#df9c53]" />
              <span className="truncate max-w-[140px] sm:max-w-none">{entry.terrainFeature}</span>
            </div>
            {onDismiss && (
              <button
                onClick={onDismiss}
                className="p-1 rounded-full text-[#baa9bc] hover:text-[#f7f2ea] hover:bg-white/[0.08] transition-colors cursor-pointer"
                title="Minimize card"
                aria-label="Minimize card"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Title & Subtitle */}
        <div>
          <div className="flex items-baseline justify-between gap-2">
            <h2
              id={`anniversary-letter-title-${entry.id}`}
              className="font-serif text-2xl sm:text-3xl lg:text-4xl text-[#f7f2ea] font-light tracking-wide drop-shadow-[0_2px_12px_rgba(0,0,0,0.5)]"
            >
              {entry.title}
            </h2>
            <span className="shrink-0 font-sans text-xs sm:text-sm text-[#df9c53] font-medium tracking-wider">
              {entry.date}
            </span>
          </div>

          <p className="mt-1 font-serif italic text-xs sm:text-sm text-[#d9cfc5] tracking-wide">
            {entry.subtitle}
          </p>
        </div>

        {/* Romantic Excerpt / Teaser in soft parchment card */}
        <div className="relative p-3 sm:p-3.5 rounded-xl bg-white/[0.035] border border-white/[0.08] text-xs sm:text-[13px] text-[#e8e4df] leading-relaxed font-serif">
          <p className="italic text-[#f5cb98]/90">
            &ldquo;{quote}&rdquo;
          </p>
          <p className="mt-1.5 text-[10px] font-sans text-[#baa9bc] tracking-wider uppercase">
            {entry.description}
          </p>
        </div>

        {/* Action Controls & Navigation */}
        <div className="pt-1 flex flex-wrap items-center justify-between gap-2.5">
          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-1 sm:flex-initial">
            <button
              id={`read-anniversary-letter-btn-${entry.id}`}
              onClick={() => onOpenLetter(entry)}
              className="group flex-1 sm:flex-initial min-h-[40px] flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-[#df9c53]/25 hover:bg-[#df9c53]/40 border border-[#df9c53]/70 hover:border-[#df9c53] text-[#fff4e0] text-xs font-sans tracking-[0.18em] uppercase font-semibold transition-all duration-300 shadow-[0_0_20px_rgba(223,156,83,0.3)] hover:shadow-[0_0_28px_rgba(223,156,83,0.5)] cursor-pointer"
            >
              <MailOpen className="w-3.5 h-3.5 text-[#f5cb98] group-hover:scale-110 transition-transform" />
              <span>Read Letter</span>
            </button>

            {entry.url && onNavigateToUrl && (
              <button
                id={`visit-live-letter-btn-${entry.id}`}
                onClick={() => onNavigateToUrl(entry.url, entry.title)}
                className="min-h-[40px] flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.14] hover:border-white/[0.28] text-[#e8e4df] hover:text-white text-xs font-sans tracking-[0.15em] uppercase transition-all duration-300 cursor-pointer"
                title="Visit Live Letter in Ating Universe"
              >
                <span>Live Portal</span>
                <ExternalLink className="w-3 h-3 text-[#baa9bc]" />
              </button>
            )}
          </div>

          {/* Quick Stepper to Other Anniversary Milestone */}
          {otherEntry && onScrollToOtherLetter && (
            <button
              onClick={() => onScrollToOtherLetter(otherEntry.progress)}
              className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-sans tracking-widest text-[#baa9bc] hover:text-[#f5cb98] uppercase transition-colors py-1 px-2 rounded-lg hover:bg-white/[0.05] cursor-pointer"
              title={`Scroll to ${otherEntry.title}`}
            >
              <Compass className="w-3 h-3 text-[#df9c53]" />
              <span>Wander to {otherEntry.monthDay}</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};
