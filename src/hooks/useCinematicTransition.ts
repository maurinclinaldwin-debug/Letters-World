import { useState, useCallback, useRef } from 'react';
import { windAudio } from '../utils/audio.ts';
import { replaceParentUrl } from '../utils/navigation.ts';

interface CinematicTransitionOptions {
  onStart?: () => void;
  onTransitionStart?: () => void;
  onComplete?: () => void;
}

interface TransitionTarget {
  url: string;
  title: string;
  subtitle?: string;
}

export function useCinematicTransition(options: CinematicTransitionOptions = {}) {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionPhase, setTransitionPhase] = useState<'idle' | 'wind' | 'portal' | 'blur' | 'navigate'>('idle');
  const [transitionTarget, setTransitionTarget] = useState<TransitionTarget | null>(null);
  const timeoutIdsRef = useRef<number[]>([]);

  const startTransition = useCallback((
    destinationUrl: string | null,
    title: string = 'Destination',
    subtitle?: string
  ) => {
    if (isTransitioning || !destinationUrl) return;

    setIsTransitioning(true);
    setTransitionPhase('wind');
    setTransitionTarget({ url: destinationUrl, title, subtitle });

    if (options.onTransitionStart) {
      options.onTransitionStart();
    } else if (options.onStart) {
      options.onStart();
    }

    // 1. Ambient breeze boost & celestial harmonic chime
    windAudio.boostForDeparture();

    // 2. Immediately trigger parent replacement while user gesture token is active
    replaceParentUrl(destinationUrl);

    // 3. Expand glassy celestial portal & light rings
    const t1 = window.setTimeout(() => {
      setTransitionPhase('portal');
      replaceParentUrl(destinationUrl);
    }, 300);

    // 3. Motion blur, atmospheric bloom & stars dissolve
    const t2 = window.setTimeout(() => {
      setTransitionPhase('blur');
    }, 850);

    // 4. Smooth parent window replacement assertion
    const t3 = window.setTimeout(() => {
      setTransitionPhase('navigate');
      if (options.onComplete) {
        options.onComplete();
      }
      replaceParentUrl(destinationUrl);
    }, 1200);

    timeoutIdsRef.current = [t1, t2, t3];
  }, [isTransitioning, options]);

  const cancelTransition = useCallback(() => {
    timeoutIdsRef.current.forEach(clearTimeout);
    timeoutIdsRef.current = [];
    setIsTransitioning(false);
    setTransitionPhase('idle');
    setTransitionTarget(null);
  }, []);

  return {
    isTransitioning,
    transitionPhase,
    transitionTarget,
    startTransition,
    startLetterTransition: startTransition,
    cancelTransition,
  };
}

