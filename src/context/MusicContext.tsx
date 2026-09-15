import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { MUSIC_PLAYLIST } from '../data/timeline.ts';
import { MusicTrack } from '../types.ts';

interface MusicChannelState {
  track: MusicTrack | null;
  volume: number; // 0 to 100
  isPlaying: boolean;
  iframeId: string;
}

interface MusicContextType {
  currentTrack: MusicTrack;
  currentTrackIndex: number;
  isPlaying: boolean;
  isMuted: boolean;
  isCrossfading: boolean;
  hasInteracted: boolean;
  playlist: MusicTrack[];
  togglePlay: () => void;
  toggleMute: () => void;
  playNextRandomTrack: () => void;
  selectTrack: (index: number) => void;
  channelA: MusicChannelState;
  channelB: MusicChannelState;
  activeChannel: 'A' | 'B';
  triggerFirstInteraction: () => void;
}

const MusicContext = createContext<MusicContextType | null>(null);

export const MusicProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Select initial random track from the provided YouTube links
  const [initialIndex] = useState<number>(() => Math.floor(Math.random() * MUSIC_PLAYLIST.length));
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(initialIndex);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isCrossfading, setIsCrossfading] = useState(false);

  // Active channel: 'A' or 'B'
  const [activeChannel, setActiveChannel] = useState<'A' | 'B'>('A');

  // Channel A and B states
  const [channelA, setChannelA] = useState<MusicChannelState>({
    track: MUSIC_PLAYLIST[initialIndex],
    volume: 100,
    isPlaying: false,
    iframeId: 'yt-channel-a',
  });

  const [channelB, setChannelB] = useState<MusicChannelState>({
    track: null,
    volume: 0,
    isPlaying: false,
    iframeId: 'yt-channel-b',
  });

  // Crossfade animation reference
  const crossfadeTimerRef = useRef<number | null>(null);
  const iframeRefs = useRef<{ [key: string]: HTMLIFrameElement | null }>({});

  // Helper to send postMessage command to YouTube iframe
  const sendCommand = useCallback((channel: 'A' | 'B', func: string, args: unknown[] = []) => {
    const iframeId = channel === 'A' ? 'yt-channel-a' : 'yt-channel-b';
    const iframe = iframeRefs.current[iframeId];
    if (iframe && iframe.contentWindow) {
      iframe.contentWindow.postMessage(
        JSON.stringify({ event: 'command', func, args }),
        '*'
      );
    }
  }, []);

  // Update volume on channel
  const setChannelVolume = useCallback((channel: 'A' | 'B', vol: number) => {
    sendCommand(channel, 'setVolume', [Math.round(vol)]);
    if (channel === 'A') {
      setChannelA((prev) => ({ ...prev, volume: vol }));
    } else {
      setChannelB((prev) => ({ ...prev, volume: vol }));
    }
  }, [sendCommand]);

  // Execute smooth crossfade between channels
  const executeCrossfade = useCallback((nextTrack: MusicTrack, nextIndex: number) => {
    if (crossfadeTimerRef.current) {
      clearInterval(crossfadeTimerRef.current);
      crossfadeTimerRef.current = null;
    }

    setIsCrossfading(true);
    setCurrentTrackIndex(nextIndex);

    const outgoingChannel = activeChannel;
    const incomingChannel = outgoingChannel === 'A' ? 'B' : 'A';

    // Prepare incoming channel
    if (incomingChannel === 'A') {
      setChannelA({
        track: nextTrack,
        volume: 0,
        isPlaying: true,
        iframeId: 'yt-channel-a',
      });
    } else {
      setChannelB({
        track: nextTrack,
        volume: 0,
        isPlaying: true,
        iframeId: 'yt-channel-b',
      });
    }

    setActiveChannel(incomingChannel);
    setIsPlaying(true);

    // Give iframe 300ms to mount and connect, then begin crossfading
    setTimeout(() => {
      sendCommand(incomingChannel, 'unMute');
      sendCommand(incomingChannel, 'setVolume', [0]);
      sendCommand(incomingChannel, 'playVideo');

      const steps = 25;
      const durationMs = 2400; // 2.4s smooth crossfade
      const stepInterval = durationMs / steps;
      let currentStep = 0;

      crossfadeTimerRef.current = window.setInterval(() => {
        currentStep++;
        const progress = currentStep / steps; // 0 to 1

        const incomingVol = Math.round(progress * 100);
        const outgoingVol = Math.round((1 - progress) * 100);

        setChannelVolume(incomingChannel, incomingVol);
        setChannelVolume(outgoingChannel, outgoingVol);

        if (currentStep >= steps) {
          if (crossfadeTimerRef.current) {
            clearInterval(crossfadeTimerRef.current);
            crossfadeTimerRef.current = null;
          }
          // Pause and silence outgoing channel
          sendCommand(outgoingChannel, 'pauseVideo');
          sendCommand(outgoingChannel, 'setVolume', [0]);
          setIsCrossfading(false);
        }
      }, stepInterval);
    }, 300);
  }, [activeChannel, sendCommand, setChannelVolume]);

  // First interaction trigger
  const triggerFirstInteraction = useCallback(() => {
    if (hasInteracted) return;
    setHasInteracted(true);
    setIsPlaying(true);

    // Start active channel smoothly fading in from 0 to 100
    setChannelVolume(activeChannel, 0);
    sendCommand(activeChannel, 'unMute');
    sendCommand(activeChannel, 'playVideo');

    let step = 0;
    const steps = 15;
    const timer = window.setInterval(() => {
      step++;
      const vol = Math.round((step / steps) * 100);
      setChannelVolume(activeChannel, vol);
      if (step >= steps) {
        clearInterval(timer);
      }
    }, 100);
  }, [hasInteracted, activeChannel, sendCommand, setChannelVolume]);

  // Listen for initial user interaction (click, scroll, touch, keydown)
  useEffect(() => {
    if (hasInteracted) return;

    const onUserInteraction = () => {
      triggerFirstInteraction();
    };

    window.addEventListener('click', onUserInteraction, { once: true, passive: true });
    window.addEventListener('touchstart', onUserInteraction, { once: true, passive: true });
    window.addEventListener('scroll', onUserInteraction, { once: true, passive: true });
    window.addEventListener('keydown', onUserInteraction, { once: true, passive: true });

    return () => {
      window.removeEventListener('click', onUserInteraction);
      window.removeEventListener('touchstart', onUserInteraction);
      window.removeEventListener('scroll', onUserInteraction);
      window.removeEventListener('keydown', onUserInteraction);
    };
  }, [hasInteracted, triggerFirstInteraction]);

  // Toggle play/pause
  const togglePlay = useCallback(() => {
    if (!hasInteracted) {
      triggerFirstInteraction();
      return;
    }

    if (isPlaying) {
      sendCommand(activeChannel, 'pauseVideo');
      setIsPlaying(false);
    } else {
      sendCommand(activeChannel, 'playVideo');
      setIsPlaying(true);
    }
  }, [hasInteracted, isPlaying, triggerFirstInteraction, sendCommand, activeChannel]);

  // Toggle mute
  const toggleMute = useCallback(() => {
    if (isMuted) {
      sendCommand('A', 'unMute');
      sendCommand('B', 'unMute');
      setIsMuted(false);
    } else {
      sendCommand('A', 'mute');
      sendCommand('B', 'mute');
      setIsMuted(true);
    }
  }, [isMuted, sendCommand]);

  // Play next random track with crossfade
  const playNextRandomTrack = useCallback(() => {
    if (!hasInteracted) {
      triggerFirstInteraction();
      return;
    }

    let nextIdx = Math.floor(Math.random() * MUSIC_PLAYLIST.length);
    if (MUSIC_PLAYLIST.length > 1 && nextIdx === currentTrackIndex) {
      nextIdx = (nextIdx + 1) % MUSIC_PLAYLIST.length;
    }

    const nextTrack = MUSIC_PLAYLIST[nextIdx];
    executeCrossfade(nextTrack, nextIdx);
  }, [hasInteracted, currentTrackIndex, triggerFirstInteraction, executeCrossfade]);

  // Select track by index with crossfade
  const selectTrack = useCallback((index: number) => {
    if (!hasInteracted) {
      triggerFirstInteraction();
    }
    if (index === currentTrackIndex && isPlaying) return;

    const nextTrack = MUSIC_PLAYLIST[index];
    executeCrossfade(nextTrack, index);
  }, [hasInteracted, currentTrackIndex, isPlaying, triggerFirstInteraction, executeCrossfade]);

  const currentTrack = MUSIC_PLAYLIST[currentTrackIndex] || MUSIC_PLAYLIST[0];

  return (
    <MusicContext.Provider
      value={{
        currentTrack,
        currentTrackIndex,
        isPlaying,
        isMuted,
        isCrossfading,
        hasInteracted,
        playlist: MUSIC_PLAYLIST,
        togglePlay,
        toggleMute,
        playNextRandomTrack,
        selectTrack,
        channelA,
        channelB,
        activeChannel,
        triggerFirstInteraction,
      }}
    >
      {/* Centralized Dual-Channel YouTube Audio Players for Seamless Crossfading */}
      <div className="sr-only opacity-0 pointer-events-none w-0 h-0 overflow-hidden" aria-hidden="true">
        {channelA.track && (
          <iframe
            ref={(el) => {
              iframeRefs.current['yt-channel-a'] = el;
            }}
            id="yt-channel-a"
            key={`channel-a-${channelA.track.id}`}
            width="200"
            height="200"
            src={`${channelA.track.embedUrl}?enablejsapi=1&autoplay=${
              hasInteracted && activeChannel === 'A' ? '1' : '0'
            }&loop=1&playlist=${channelA.track.id}&controls=0&fs=0&modestbranding=1&rel=0&iv_load_policy=3`}
            title="Letters World Soundtrack Channel A"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            referrerPolicy="strict-origin-when-cross-origin"
            tabIndex={-1}
          />
        )}
        {channelB.track && (
          <iframe
            ref={(el) => {
              iframeRefs.current['yt-channel-b'] = el;
            }}
            id="yt-channel-b"
            key={`channel-b-${channelB.track.id}`}
            width="200"
            height="200"
            src={`${channelB.track.embedUrl}?enablejsapi=1&autoplay=${
              hasInteracted && activeChannel === 'B' ? '1' : '0'
            }&loop=1&playlist=${channelB.track.id}&controls=0&fs=0&modestbranding=1&rel=0&iv_load_policy=3`}
            title="Letters World Soundtrack Channel B"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            referrerPolicy="strict-origin-when-cross-origin"
            tabIndex={-1}
          />
        )}
      </div>

      {children}
    </MusicContext.Provider>
  );
};

export const useMusic = () => {
  const context = useContext(MusicContext);
  if (!context) {
    throw new Error('useMusic must be used within a MusicProvider');
  }
  return context;
};
