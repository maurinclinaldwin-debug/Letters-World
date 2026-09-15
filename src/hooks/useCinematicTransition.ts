import { useState, useCallback, useRef } from 'react';
import { windAudio } from '../utils/audio.ts';
import { redirectThroughParent } from '../utils/navigation.ts';

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

    // 1. Ambient breeze boost & atmospheric sound
    windAudio.boostForDeparture();

    // 2. Glassy celestial portal & light rings shimmer outwards
    const t1 = window.setTimeout(() => {
      setTransitionPhase('portal');
    }, 400);

    // 3. Motion blur, atmospheric bloom & stars dissolve
    const t2 = window.setTimeout(() => {
      setTransitionPhase('blur');
    }, 1500);

    // 4. Smooth parent redirection
    const t3 = window.setTimeout(() => {
      setTransitionPhase('navigate');
      if (options.onComplete) {
        options.onComplete();
      }
      redirectThroughParent(destinationUrl);
    }, 2200);

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

