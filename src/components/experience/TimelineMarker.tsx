import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, Lock } from 'lucide-react';
import { TimelineEntry } from '../../types.ts';

interface TimelineMarkerProps {
  entry: TimelineEntry;
  isActive: boolean;
  isFocused: boolean;
  revealProgress?: number; // 0 to 1 scroll-synchronized proximity
  onClick: (entry: TimelineEntry) => void;
}

export const TimelineMarker: React.FC<TimelineMarkerProps> = ({
  entry,
  isActive,
  isFocused,
  revealProgress = 1,
  onClick,
}) => {
  const isAvailable = entry.status === 'available';
  const [clicked, setClicked] = useState(false);

  // Cinematic scroll animations: progressive scale, opacity, and bloom
  const scale = 0.75 + 0.35 * revealProgress;
  const opacity = Math.min(1, Math.max(0.15, revealProgress));
  const isProminent = revealProgress > 0.35 || isActive || isFocused;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setClicked(true);
    onClick(entry);
    setTimeout(() => setClicked(false), 900);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{
        opacity,
        y: (1 - Math.min(1, revealProgress)) * 16,
      }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="absolute pointer-events-auto select-none will-change-transform"
      style={{
        left: `${entry.pathPercent.x}%`,
        top: `${entry.pathPercent.y}%`,
        transform: `translate(-50%, -50%) scale(${scale})`,
        zIndex: isProminent ? 25 : 10,
      }}
    >
      <button
        id={`timeline-marker-${entry.id}`}
        onClick={handleClick}
        className="group relative flex flex-col items-center justify-center p-3 focus:outline-none cursor-pointer"
        aria-label={`${entry.title} — ${entry.date}. Click to open letter.`}
        title={`Click to read: ${entry.date}`}
      >
        {/* Click ripple shockwave */}
        {clicked && (
          <span
            className="absolute rounded-full border-2 border-[#f5cb98] bg-[#df9c53]/40 animate-ping pointer-events-none"
            style={{ width: '84px', height: '84px', animationDuration: '0.8s' }}
          />
        )}

        {/* Ambient Halo behind the circle */}
        <span
          className={`absolute rounded-full transition-all duration-700 pointer-events-none ${
            isAvailable
              ? 'bg-[#df9c53]/25 group-hover:bg-[#df9c53]/50 blur-xl'
              : 'bg-white/15 group-hover:bg-white/35 blur-xl'
          } ${
            isProminent ? 'w-24 h-24 sm:w-28 sm:h-28 opacity-90' : 'w-16 h-16 opacity-30'
          }`}
        />

        {/* Outer Rotating Starlight Orbital Ring */}
        <span
          className={`absolute rounded-full border transition-all duration-700 pointer-events-none ${
            isAvailable
              ? 'border-[#df9c53]/45 group-hover:border-[#df9c53] shadow-[0_0_24px_rgba(223,156,83,0.4)]'
              : 'border-white/25 group-hover:border-white/60 shadow-[0_0_20px_rgba(255,255,255,0.2)]'
          } ${
            isProminent
              ? 'w-16 h-16 sm:w-18 sm:h-18 scale-100 opacity-100'
              : 'w-12 h-12 sm:w-14 sm:h-14 scale-90 opacity-60'
          }`}
          style={{
            borderStyle: 'dashed',
            borderWidth: '1.5px',
            animation: isProminent ? 'spin 16s linear infinite' : 'none',
          }}
        />

        {/* Main Interactive Roadmap Circle Node */}
        <div
          className={`relative flex flex-col items-center justify-center rounded-full border backdrop-blur-xl transition-all duration-300 shadow-[0_8px_32px_rgba(0,0,0,0.6)] ${
            isAvailable
              ? isProminent
                ? 'w-13 h-13 sm:w-15 sm:h-15 bg-[#171b24]/90 border-[#df9c53] ring-2 ring-[#df9c53]/50 group-hover:scale-110 group-hover:shadow-[0_0_32px_rgba(223,156,83,0.8)]'
                : 'w-11 h-11 sm:w-13 sm:h-13 bg-black/60 border-[#df9c53]/60 group-hover:border-[#df9c53]'
              : isProminent
              ? 'w-13 h-13 sm:w-15 sm:h-15 bg-[#141720]/90 border-white/40 ring-1 ring-white/30 group-hover:scale-110 group-hover:border-white/80'
              : 'w-11 h-11 sm:w-13 sm:h-13 bg-black/60 border-white/25 group-hover:border-white/50'
          }`}
        >
          {/* Inner Center Icon */}
          {isAvailable ? (
            <div className="flex flex-col items-center justify-center">
              <Mail className="w-5 h-5 text-[#f5cb98] group-hover:scale-110 group-hover:-rotate-3 transition-transform" />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center">
              <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-[#baa9bc] group-hover:scale-110 transition-transform" />
            </div>
          )}

          {/* Active Pulsing Core Beacon */}
          {isProminent && (
            <span
              className={`absolute -top-1 -right-1 w-3 h-3 rounded-full flex items-center justify-center ${
                isAvailable ? 'bg-[#df9c53]' : 'bg-[#baa9bc]'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
            </span>
          )}
        </div>

        {/* Scroll-animated Card Badge on the Road */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{
            opacity: isProminent ? 1 : Math.max(0.2, revealProgress),
            y: isProminent ? 0 : (1 - Math.min(1, revealProgress)) * 12,
          }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className={`mt-2 pointer-events-none transition-all duration-300 flex flex-col items-center ${
            entry.pathPercent.x > 70
              ? 'sm:-translate-x-8'
              : entry.pathPercent.x < 30
              ? 'sm:translate-x-8'
              : ''
          }`}
        >
          <div
            className={`px-3 py-1.5 rounded-xl backdrop-blur-xl border transition-all duration-300 flex flex-col items-center text-center shadow-[0_8px_24px_rgba(0,0,0,0.5)] ${
              isAvailable
                ? isProminent
                  ? 'bg-[#141822]/90 border-[#df9c53]/60 shadow-[0_0_20px_rgba(223,156,83,0.3)]'
                  : 'bg-black/60 border-white/[0.12]'
                : 'bg-black/60 border-white/[0.10]'
            }`}
          >
            <p
              className={`font-sans text-[10.5px] sm:text-xs tracking-[0.2em] uppercase font-semibold transition-all duration-300 whitespace-nowrap ${
                isAvailable ? 'text-[#f5cb98]' : 'text-[#baa9bc]'
              }`}
            >
              {entry.title}
            </p>
            <div className="flex items-center gap-1.5 mt-0.5 whitespace-nowrap">
              <span className="font-sans text-[9px] sm:text-[9.5px] tracking-[0.14em] uppercase text-[#baa9bc]">
                {entry.date}
              </span>
              {isProminent && (
                <span className="text-[8.5px] font-sans tracking-widest text-[#df9c53] uppercase border-l border-white/20 pl-1.5">
                  Read
                </span>
              )}
            </div>
          </div>
        </motion.div>
      </button>
    </motion.div>
  );
};
