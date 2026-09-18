import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { MUSIC_PLAYLIST } from '../data/timeline.ts';
import { MusicTrack } from '../types.ts';
import { unlockMobileAudioHardware } from '../utils/audio.ts';

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

// Get safe origin without 'null' or sandbox glitches
const getSafeOrigin = (): string => {
  try {
    if (typeof window !== 'undefined' && window.location && window.location.origin && window.location.origin !== 'null') {
      return window.location.origin;
    }
  } catch {
    // ignore
  }
  return '';
};

// Construct YouTube embed URL with optimal flags for reliable live autoplay & API control
const buildYouTubeEmbedUrl = (trackId: string): string => {
  const origin = getSafeOrigin();
  const originParam = origin ? `&origin=${encodeURIComponent(origin)}&widget_referrer=${encodeURIComponent(origin)}` : '';
  return `https://www.youtube.com/embed/${trackId}?enablejsapi=1&autoplay=1&mute=1&playsinline=1&controls=0&disablekb=1&fs=0&modestbranding=1&rel=0&iv_load_policy=3&loop=1&playlist=${trackId}${originParam}`;
};

export const MusicProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Select initial random track from the provided YouTube playlist
  const [initialIndex] = useState<number>(() => Math.floor(Math.random() * MUSIC_PLAYLIST.length));
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(initialIndex);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true); // default to true for autoplay intent
  const [isMuted, setIsMuted] = useState(false);
  const [isCrossfading, setIsCrossfading] = useState(false);

  // Active channel: 'A' or 'B'
  const [activeChannel, setActiveChannel] = useState<'A' | 'B'>('A');

  // Channel A and B states (pre-warmed with initial tracks for smooth switching)
  const nextTrackIndex = (initialIndex + 1) % MUSIC_PLAYLIST.length;
  const [channelA, setChannelA] = useState<MusicChannelState>({
    track: MUSIC_PLAYLIST[initialIndex],
    volume: 100,
    isPlaying: true,
    iframeId: 'yt-channel-a',
  });

  const [channelB, setChannelB] = useState<MusicChannelState>({
    track: MUSIC_PLAYLIST[nextTrackIndex],
    volume: 0,
    isPlaying: false,
    iframeId: 'yt-channel-b',
  });

  // Crossfade animation reference
  const crossfadeTimerRef = useRef<number | null>(null);
  const iframeRefs = useRef<{ [key: string]: HTMLIFrameElement | null }>({});
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ytPlayersRef = useRef<{ [key: string]: any }>({});

  // Helper to send postMessage command to YouTube iframe & invoke native YT.Player if ready
  const sendCommand = useCallback((channel: 'A' | 'B', func: string, args: unknown = '') => {
    const iframeId = channel === 'A' ? 'yt-channel-a' : 'yt-channel-b';

    // 1. If window.YT.Player is initialized, invoke native method directly
    const player = ytPlayersRef.current[channel];
    if (player && typeof player[func] === 'function') {
      try {
        if (Array.isArray(args)) {
          player[func](...args);
        } else if (args !== '' && args !== undefined) {
          player[func](args);
        } else {
          player[func]();
        }
      } catch {
        // fallback to postMessage
      }
    }

    // 2. Direct postMessage to the iframe contentWindow
    const iframe = iframeRefs.current[iframeId];
    if (iframe && iframe.contentWindow) {
      try {
        iframe.contentWindow.postMessage(
          JSON.stringify({
            event: 'command',
            func,
            args: args !== undefined ? args : '',
          }),
          '*'
        );
      } catch {
        // ignore
      }
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

  // Execute smooth crossfade between channels without destroying iframes
  const executeCrossfade = useCallback((nextTrack: MusicTrack, nextIndex: number) => {
    if (crossfadeTimerRef.current) {
      clearInterval(crossfadeTimerRef.current);
      crossfadeTimerRef.current = null;
    }

    setIsCrossfading(true);
    setCurrentTrackIndex(nextIndex);

    const outgoingChannel = activeChannel;
    const incomingChannel = outgoingChannel === 'A' ? 'B' : 'A';

    // Prepare incoming channel track
    if (incomingChannel === 'A') {
      setChannelA((prev) => ({
        ...prev,
        track: nextTrack,
        volume: 0,
        isPlaying: true,
      }));
    } else {
      setChannelB((prev) => ({
        ...prev,
        track: nextTrack,
        volume: 0,
        isPlaying: true,
      }));
    }

    setActiveChannel(incomingChannel);
    setIsPlaying(true);

    // Call loadVideoById on the incoming channel player
    sendCommand(incomingChannel, 'loadVideoById', nextTrack.id);
    sendCommand(incomingChannel, 'unMute');
    sendCommand(incomingChannel, 'setVolume', [0]);
    sendCommand(incomingChannel, 'playVideo');

    // Smooth crossfade progression
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
  }, [activeChannel, sendCommand, setChannelVolume]);

  // First interaction trigger with mobile audio hardware priming & instant playback activation
  const triggerFirstInteraction = useCallback(() => {
    setHasInteracted(true);
    setIsPlaying(true);

    // 1. Prime Mobile Web Audio Hardware (resumes AudioContext)
    unlockMobileAudioHardware();

    // 2. Unmute and play current active channel
    sendCommand(activeChannel, 'unMute');
    sendCommand(activeChannel, 'setVolume', [100]);
    sendCommand(activeChannel, 'playVideo');

    // 3. Cascading retries to counter network/iframe buffering latencies
    const retryDelays = [100, 300, 600, 1200, 2000];
    retryDelays.forEach((delay) => {
      setTimeout(() => {
        sendCommand(activeChannel, 'unMute');
        sendCommand(activeChannel, 'setVolume', [100]);
        sendCommand(activeChannel, 'playVideo');
      }, delay);
    });
  }, [activeChannel, sendCommand]);

  // Attempt instant autoplay on mount with rapid retries
  useEffect(() => {
    const pings = [200, 600, 1200, 2000, 3200];
    const timers = pings.map((delay) =>
      setTimeout(() => {
        // Send listening handshake & attempt play
        const iframeA = iframeRefs.current['yt-channel-a'];
        if (iframeA?.contentWindow) {
          iframeA.contentWindow.postMessage(JSON.stringify({ event: 'listening' }), '*');
        }
        sendCommand('A', 'unMute');
        sendCommand('A', 'setVolume', [100]);
        sendCommand('A', 'playVideo');
      }, delay)
    );

    return () => {
      timers.forEach(clearTimeout);
    };
  }, [sendCommand]);

  // Listen for initial user interaction across all mobile and desktop touch points to immediately unmute
  useEffect(() => {
    if (hasInteracted) return;

    const onUserInteraction = () => {
      triggerFirstInteraction();
    };

    const eventOptions = { passive: true };
    const events = [
      'touchstart',
      'touchend',
      'pointerdown',
      'pointerup',
      'click',
      'scroll',
      'wheel',
      'keydown',
      'mousemove',
    ];

    events.forEach((evt) => {
      window.addEventListener(evt, onUserInteraction, eventOptions);
      document.addEventListener(evt, onUserInteraction, eventOptions);
    });

    return () => {
      events.forEach((evt) => {
        window.removeEventListener(evt, onUserInteraction);
        document.removeEventListener(evt, onUserInteraction);
      });
    };
  }, [hasInteracted, triggerFirstInteraction]);

  // Initialize official YT.Player if window.YT is available
  useEffect(() => {
    const initYT = () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const YT = (window as any).YT;
      if (!YT || !YT.Player) return;

      try {
        if (!ytPlayersRef.current['A'] && iframeRefs.current['yt-channel-a']) {
          ytPlayersRef.current['A'] = new YT.Player('yt-channel-a', {
            events: {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              onReady: (e: any) => {
                e.target.unMute();
                e.target.setVolume(100);
                e.target.playVideo();
              },
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              onStateChange: (e: any) => {
                if (e.data === 1) {
                  setIsPlaying(true);
                  setHasInteracted(true);
                }
              },
            },
          });
        }

        if (!ytPlayersRef.current['B'] && iframeRefs.current['yt-channel-b']) {
          ytPlayersRef.current['B'] = new YT.Player('yt-channel-b', {
            events: {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              onReady: (e: any) => {
                e.target.mute();
                e.target.setVolume(0);
              },
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              onStateChange: (e: any) => {
                if (e.data === 1 && activeChannel === 'B') {
                  setIsPlaying(true);
                  setHasInteracted(true);
                }
              },
            },
          });
        }
      } catch {
        // ignore init error
      }
    };

    if (typeof window !== 'undefined') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((window as any).YT && (window as any).YT.Player) {
        initYT();
      } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const prevReady = (window as any).onYouTubeIframeAPIReady;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).onYouTubeIframeAPIReady = () => {
          if (typeof prevReady === 'function') prevReady();
          initYT();
        };
      }
    }
  }, [activeChannel]);

  // Listen for postMessage from YouTube iframe to detect playback status and handshake
  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      try {
        const data = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;
        if (!data) return;

        // When YouTube iframe confirms ready
        if (data.event === 'onReady' || data.event === 'initialDelivery') {
          sendCommand(activeChannel, 'unMute');
          sendCommand(activeChannel, 'setVolume', [100]);
          sendCommand(activeChannel, 'playVideo');
        }

        // When playback state changes (1 is playing)
        if (data.event === 'onStateChange' || data.info?.playerState !== undefined) {
          const state = data.info?.playerState ?? data.info;
          if (state === 1) {
            setIsPlaying(true);
            setHasInteracted(true);
          }
        }
      } catch {
        // ignore non-JSON messages
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [activeChannel, sendCommand]);

  // Toggle play/pause
  const togglePlay = useCallback(() => {
    unlockMobileAudioHardware();
    if (!hasInteracted) {
      triggerFirstInteraction();
      return;
    }

    if (isPlaying) {
      sendCommand(activeChannel, 'pauseVideo');
      setIsPlaying(false);
    } else {
      sendCommand(activeChannel, 'unMute');
      sendCommand(activeChannel, 'setVolume', [100]);
      sendCommand(activeChannel, 'playVideo');
      setIsPlaying(true);
    }
  }, [hasInteracted, isPlaying, triggerFirstInteraction, sendCommand, activeChannel]);

  // Toggle mute
  const toggleMute = useCallback(() => {
    unlockMobileAudioHardware();
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
    unlockMobileAudioHardware();
    if (!hasInteracted) {
      triggerFirstInteraction();
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
    unlockMobileAudioHardware();
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
      {/* 
        Centralized Dual-Channel YouTube Audio Host
        CRITICAL FOR LIVE SITES: Placed offscreen with explicit 320x240 dimensions.
        Never use 0x0 or sr-only/display:none, as browsers suspend media timers on zero-sized frames.
      */}
      <div
        id="ambient-youtube-host"
        style={{
          position: 'fixed',
          top: '-9999px',
          left: '-9999px',
          width: '320px',
          height: '240px',
          opacity: 0.001,
          pointerEvents: 'none',
          zIndex: -9999,
          overflow: 'hidden',
        }}
        aria-hidden="true"
      >
        <iframe
          ref={(el) => {
            iframeRefs.current['yt-channel-a'] = el;
          }}
          id="yt-channel-a"
          width="320"
          height="240"
          src={buildYouTubeEmbedUrl(channelA.track?.id || MUSIC_PLAYLIST[0].id)}
          title="Letters World Soundtrack Channel A"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          tabIndex={-1}
        />
        <iframe
          ref={(el) => {
            iframeRefs.current['yt-channel-b'] = el;
          }}
          id="yt-channel-b"
          width="320"
          height="240"
          src={buildYouTubeEmbedUrl(channelB.track?.id || MUSIC_PLAYLIST[1].id)}
          title="Letters World Soundtrack Channel B"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          tabIndex={-1}
        />
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

