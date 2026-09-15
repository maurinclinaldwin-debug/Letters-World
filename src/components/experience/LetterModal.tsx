import React, { useState, useEffect } from 'react';
import { X, Sparkles, Lock, BookOpen, ExternalLink, Heart, Feather } from 'lucide-react';
import { TimelineEntry } from '../../types.ts';

interface LetterModalProps {
  entry: TimelineEntry | null;
  isOpen: boolean;
  onClose: () => void;
  onNavigateToUrl?: (url: string, title: string) => void;
}

export const LetterModal: React.FC<LetterModalProps> = ({
  entry,
  isOpen,
  onClose,
  onNavigateToUrl,
}) => {
  const [activePerspectiveIndex, setActivePerspectiveIndex] = useState(0);

  // Handle ESC key to dismiss
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !entry) return null;

  const content = entry.letterContent;
  const isUpcoming = entry.status === 'upcoming';
  const perspectives = content?.perspectives || [];
  const activePerspective = perspectives[activePerspectiveIndex] || null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="letter-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 select-text animate-in fade-in duration-300"
    >
      {/* Dark Ambient Backdrop with Frosted Glass Blur */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/75 backdrop-blur-xl transition-opacity duration-300"
      />

      {/* Atmospheric Starlight Glow Behind Modal */}
      <div className="absolute w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-[#df9c53]/15 via-[#baa9bc]/10 to-transparent blur-3xl pointer-events-none" />

      {/* Main Letter Parchment / Glass Reader */}
      <div
        className="relative z-10 w-full max-w-2xl max-h-[88vh] flex flex-col rounded-3xl backdrop-blur-2xl bg-[#12151d]/90 border border-white/[0.16] shadow-[0_24px_72px_rgba(0,0,0,0.6)] ring-1 ring-white/[0.08] overflow-hidden transition-all duration-300"
      >
        {/* Top Gold Specular Accent */}
        <div className="absolute top-0 inset-x-8 h-[1px] bg-gradient-to-r from-transparent via-[#f5cb98]/80 to-transparent pointer-events-none" />

        {/* Header Section */}
        <div className="flex items-center justify-between px-6 sm:px-8 pt-6 sm:pt-7 pb-4 border-b border-white/[0.08] shrink-0">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#df9c53] animate-pulse" />
              <span className="font-sans text-[10px] tracking-[0.25em] uppercase font-semibold text-[#e5aa6d]">
                {entry.date}
              </span>
              <span className="w-1 h-1 rounded-full bg-white/20" />
              <span className="font-sans text-[10px] tracking-[0.2em] uppercase text-[#baa9bc]">
                {entry.terrainFeature}
              </span>
            </div>
            <h2
              id="letter-modal-title"
              className="font-serif text-2xl sm:text-3xl text-[#f7f2ea] tracking-wide font-normal"
            >
              {entry.title}
            </h2>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="flex items-center justify-center w-9 h-9 rounded-full bg-white/[0.06] hover:bg-white/[0.14] border border-white/[0.10] text-[#baa9bc] hover:text-[#f7f2ea] transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#df9c53]"
            aria-label="Close letter"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Perspective Switcher Tabs (for dual-perspective letters) */}
        {perspectives.length > 1 && (
          <div className="flex items-center gap-2 px-6 sm:px-8 py-3 bg-white/[0.02] border-b border-white/[0.06] shrink-0">
            {perspectives.map((p, idx) => {
              const isSelected = idx === activePerspectiveIndex;
              return (
                <button
                  key={idx}
                  onClick={() => setActivePerspectiveIndex(idx)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-sans tracking-[0.16em] uppercase transition-all duration-300 cursor-pointer focus:outline-none ${
                    isSelected
                      ? 'bg-[#df9c53]/25 border border-[#df9c53] text-[#fff4e0] shadow-[0_0_16px_rgba(223,156,83,0.3)] font-semibold'
                      : 'bg-white/[0.04] border border-white/[0.08] text-[#baa9bc] hover:text-[#f7f2ea] hover:bg-white/[0.08]'
                  }`}
                >
                  <Feather className={`w-3 h-3 ${isSelected ? 'text-[#df9c53]' : 'opacity-60'}`} />
                  <span>{p.author}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Scrollable Letter Content Body */}
        <div className="flex-1 overflow-y-auto px-6 sm:px-10 py-6 sm:py-8 space-y-6 text-[#ded6cd] overscroll-contain">
          {isUpcoming ? (
            /* Upcoming / Locked Letter Presentation */
            <div className="space-y-6 py-4">
              <div className="flex flex-col items-center justify-center text-center p-6 rounded-2xl bg-black/40 border border-[#df9c53]/30 backdrop-blur-md space-y-3">
                <div className="w-12 h-12 rounded-full bg-[#df9c53]/15 border border-[#df9c53]/40 flex items-center justify-center text-[#df9c53]">
                  <Lock className="w-5 h-5" />
                </div>
                <h3 className="font-serif italic text-xl text-[#f7f2ea]">
                  A Letter Resting at the Dawn Horizon
                </h3>
                <p className="font-sans text-xs tracking-widest uppercase text-[#e5aa6d]">
                  {content?.sealNote || 'Sealed until August 22, 2027'}
                </p>
              </div>

              {/* Time capsule excerpt */}
              {content?.body && (
                <div className="space-y-4 px-2 sm:px-4 font-serif text-sm sm:text-base leading-relaxed text-[#ded6cd]/90">
                  {content.body.map((para, i) => (
                    <p key={i} className={i === 0 ? 'italic text-[#f5cb98]' : ''}>
                      {para}
                    </p>
                  ))}
                </div>
              )}

              <div className="pt-2 text-center">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 text-[10px] font-sans tracking-[0.2em] uppercase text-[#baa9bc]">
                  <Sparkles className="w-3 h-3 text-[#df9c53]" />
                  Awaiting our 1st Anniversary
                </span>
              </div>
            </div>
          ) : activePerspective ? (
            /* Dual Perspective Letter Content */
            <div className="space-y-6">
              {/* Perspective Sub-Header */}
              <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
                <div className="space-y-0.5">
                  <span className="font-sans text-[10px] tracking-[0.2em] uppercase text-[#baa9bc]">
                    {activePerspective.label}
                  </span>
                  <h3 className="font-serif italic text-xl text-[#f5cb98]">
                    {activePerspective.title}
                  </h3>
                </div>
                <Heart className="w-4 h-4 text-[#df9c53]/70 fill-[#df9c53]/20" />
              </div>

              {/* Quote Highlight */}
              {activePerspective.quote && (
                <blockquote className="p-4 rounded-2xl bg-white/[0.03] border-l-2 border-[#df9c53] font-serif italic text-sm sm:text-base text-[#f7f2ea] leading-relaxed">
                  "{activePerspective.quote}"
                </blockquote>
              )}

              {/* Paragraphs */}
              <div className="space-y-4 font-serif text-sm sm:text-base leading-relaxed tracking-wide text-[#e8e2d9]">
                {activePerspective.paragraphs.map((paragraph, pIdx) => (
                  <p key={pIdx} className="first-letter:text-2xl first-letter:font-normal first-letter:text-[#f5cb98]">
                    {paragraph}
                  </p>
                ))}
              </div>

              {/* Signoff */}
              {activePerspective.signoff && (
                <div className="pt-4 text-right">
                  <p className="font-serif italic text-sm text-[#baa9bc]">
                    {activePerspective.signoff}
                  </p>
                </div>
              )}
            </div>
          ) : (
            /* Fallback summary display */
            <div className="space-y-4 font-serif text-base">
              <p>{content?.summary || entry.subtitle}</p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 sm:px-8 py-4 sm:py-5 border-t border-white/[0.08] bg-black/40 shrink-0">
          <div className="text-[11px] font-sans text-[#baa9bc] tracking-wider text-center sm:text-left">
            {isUpcoming
              ? 'Return on August 22, 2027 to unlock'
              : 'Discovered in Ating Universe • Letters World'}
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* External Destination Button if available */}
            {entry.url && onNavigateToUrl && (
              <button
                onClick={() => onNavigateToUrl(entry.url!, entry.title)}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-[#df9c53]/20 hover:bg-[#df9c53]/35 border border-[#df9c53]/60 hover:border-[#df9c53] text-[#fff4e0] text-xs font-sans tracking-[0.2em] uppercase transition-all duration-300 cursor-pointer shadow-[0_0_16px_rgba(223,156,83,0.3)]"
              >
                <BookOpen className="w-3.5 h-3.5 text-[#df9c53]" />
                <span>Visit Live Letter</span>
                <ExternalLink className="w-3 h-3 text-[#df9c53]" />
              </button>
            )}

            <button
              onClick={onClose}
              className="flex-1 sm:flex-none inline-flex items-center justify-center px-5 py-2.5 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.12] text-[#f7f2ea] text-xs font-sans tracking-[0.2em] uppercase transition-all duration-200 cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
