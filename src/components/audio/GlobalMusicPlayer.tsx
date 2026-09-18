import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, SkipForward, Play, Pause, Music, Disc, Sparkles } from 'lucide-react';
import { useMusic } from '../../context/MusicContext.tsx';

export const GlobalMusicPlayer: React.FC = () => {
  const {
    currentTrack,
    currentTrackIndex,
    isPlaying,
    isMuted,
    isCrossfading,
    hasInteracted,
    playlist,
    togglePlay,
    toggleMute,
    playNextRandomTrack,
    selectTrack,
  } = useMusic();

  const [isExpanded, setIsExpanded] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Close on click or touch outside
  useEffect(() => {
    if (!isExpanded) return;
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsExpanded(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isExpanded]);

  return (
    <div id="global-music-container" ref={containerRef} className="relative pointer-events-auto">
      {/* Glassy Translucent Music Pill */}
      <div className="flex items-center gap-0.5 sm:gap-1.5 p-0.5 sm:p-1 rounded-full backdrop-blur-xl bg-black/25 sm:bg-white/[0.035] border border-white/[0.12] shadow-[0_8px_24px_0_rgba(0,0,0,0.22)] ring-1 ring-white/[0.06] transition-all duration-300">
        {/* Play/Pause Button */}
        <button
          id="music-play-pause-btn"
          onClick={togglePlay}
          className="relative flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/10 hover:bg-white/20 text-[#f7f2ea] transition-all duration-200 focus:outline-none focus:ring-1 focus:ring-white/40 shrink-0"
          aria-label={isPlaying ? 'Pause ambient music' : 'Play ambient music'}
          title={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? (
            <Pause className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-current" />
          ) : (
            <Play className="w-3 h-3 sm:w-3.5 sm:h-3.5 ml-0.5 fill-current" />
          )}
        </button>

        {/* Track Title & Animated Soundwave Bars */}
        <button
          id="music-details-toggle-btn"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1.5 sm:gap-2.5 px-1.5 sm:px-2.5 py-1 text-left focus:outline-none group"
          title="Click to view playlist"
        >
          {/* Animated sound wave bars */}
          <div className="flex items-end gap-[2px] h-3.5 w-3.5 shrink-0" aria-hidden="true">
            <span
              className={`w-[2px] sm:w-[2.5px] bg-[#df9c53] rounded-full transition-all duration-300 ${
                isPlaying ? 'h-3.5 animate-pulse' : 'h-1.5 opacity-50'
              }`}
            />
            <span
              className={`w-[2px] sm:w-[2.5px] bg-[#f5cb98] rounded-full transition-all duration-300 delay-75 ${
                isPlaying ? 'h-2.5 animate-pulse' : 'h-2 opacity-50'
              }`}
            />
            <span
              className={`w-[2px] sm:w-[2.5px] bg-[#df9c53] rounded-full transition-all duration-300 delay-150 ${
                isPlaying ? 'h-3 animate-pulse' : 'h-1 opacity-50'
              }`}
            />
          </div>

          <div className="hidden sm:flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-sans tracking-[0.15em] text-[#f7f2ea] font-medium leading-none max-w-[120px] truncate">
                {currentTrack.title}
              </span>
              {isCrossfading && (
                <span className="inline-flex items-center gap-0.5 px-1 py-0.2 rounded text-[8px] font-sans tracking-widest uppercase bg-[#df9c53]/25 text-[#f5cb98] border border-[#df9c53]/40 animate-pulse">
                  <Sparkles className="w-2 h-2" />
                  Fade
                </span>
              )}
            </div>
            <span className="text-[9px] font-sans tracking-[0.2em] text-[#baa9bc] uppercase leading-none mt-1">
              {isCrossfading ? 'Crossfading' : isPlaying ? 'Playing' : 'Paused'}
            </span>
          </div>
        </button>

        {/* Random Next Track button with crossfade (hidden on small mobile to preserve header breathability) */}
        <button
          id="music-shuffle-next-btn"
          onClick={playNextRandomTrack}
          className="hidden md:flex items-center justify-center w-7 h-7 rounded-full text-[#baa9bc] hover:text-[#f7f2ea] hover:bg-white/[0.08] transition-all duration-200 focus:outline-none shrink-0"
          aria-label="Crossfade to next random soundtrack"
          title="Crossfade Next Random Soundtrack"
        >
          <SkipForward className="w-3.5 h-3.5" />
        </button>

        {/* Mute/Unmute button */}
        <button
          id="music-mute-toggle-btn"
          onClick={toggleMute}
          className="flex items-center justify-center w-7 h-7 sm:w-7 sm:h-7 rounded-full text-[#baa9bc] hover:text-[#f7f2ea] hover:bg-white/[0.08] transition-all duration-200 focus:outline-none shrink-0"
          aria-label={isMuted ? 'Unmute music' : 'Mute music'}
          title={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? (
            <VolumeX className="w-3.5 h-3.5 text-rose-300" />
          ) : (
            <Volume2 className="w-3.5 h-3.5" />
          )}
        </button>
      </div>

      {/* Expandable Glassy Playlist Modal / Dropdown */}
      {isExpanded && (
        <div
          id="music-playlist-dropdown"
          className="absolute right-0 top-11 sm:top-12 w-[calc(100vw-20px)] max-w-xs sm:w-64 p-3 rounded-2xl backdrop-blur-2xl bg-[#0f1218]/90 sm:bg-[#0f1218]/70 border border-white/[0.12] shadow-[0_16px_48px_0_rgba(0,0,0,0.35)] ring-1 ring-white/[0.06] z-50 max-h-[75vh] overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200"
        >
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/[0.08]">
            <div className="flex items-center gap-1.5 text-xs text-[#f7f2ea] font-serif italic">
              <Disc className={`w-3.5 h-3.5 text-[#df9c53] ${isPlaying ? 'animate-spin' : ''}`} />
              <span>Soundtrack Playlist</span>
            </div>
            <span className="text-[10px] text-[#baa9bc] font-sans tracking-widest uppercase">
              {playlist.length} Tracks
            </span>
          </div>

          <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
            {playlist.map((track, idx) => {
              const isSelected = idx === currentTrackIndex;
              return (
                <button
                  key={track.id}
                  onClick={() => selectTrack(idx)}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-left text-xs transition-all duration-200 ${
                    isSelected
                      ? 'bg-white/[0.08] text-[#f7f2ea] font-medium border border-white/[0.12]'
                      : 'text-[#d9cfc5] hover:bg-white/[0.06] hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <Music className={`w-3 h-3 shrink-0 ${isSelected ? 'text-[#df9c53]' : 'text-[#baa9bc]'}`} />
                    <span className="truncate">{track.title}</span>
                  </div>
                  {isSelected && isPlaying && (
                    <span className="text-[9px] text-[#df9c53] uppercase font-mono tracking-widest shrink-0 ml-2">
                      {isCrossfading ? 'Crossfade' : 'Live'}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="mt-3 pt-2 border-t border-white/[0.08] text-center">
            <p className="text-[10px] text-[#baa9bc] tracking-wider font-sans">
              Centralized audio with seamless crossfading
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
