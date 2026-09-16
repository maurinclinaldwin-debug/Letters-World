import { useState, useEffect, useRef, useCallback } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register GSAP ScrollTrigger
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface UseTimelineProgressOptions {
  enabled?: boolean;
  onProgressChange?: (progress: number) => void;
}

export function useTimelineProgress(options: UseTimelineProgressOptions = {}) {
  const { enabled = true, onProgressChange } = options;
  const [progress, setProgress] = useState(0);
  const lenisRef = useRef<Lenis | null>(null);
  const scrollTriggerRef = useRef<ScrollTrigger | null>(null);
  const onProgressChangeRef = useRef(onProgressChange);
  onProgressChangeRef.current = onProgressChange;

  useEffect(() => {
    if (!enabled) return;

    // 1. Initialize Lenis for buttery-smooth, responsive organic scrolling without drag lag
    const lenis = new Lenis({
      duration: 1.0,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.5,
    });

    lenisRef.current = lenis;

    // 2. Synchronize Lenis with GSAP ScrollTrigger
    lenis.on('scroll', () => {
      ScrollTrigger.update();
    });

    // Hook GSAP Ticker to Lenis for frame-locked smooth rendering
    const tickerCallback = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(tickerCallback);
    gsap.ticker.lagSmoothing(0);

    // 3. Create ScrollTrigger instance attached to timeline track
    const scrollTrack = document.getElementById('timeline-scroll-track') || document.body;

    let rafId: number | null = null;
    let lastProgress = -1;
    const st = ScrollTrigger.create({
      trigger: scrollTrack,
      start: 'top top',
      end: 'bottom bottom',
      scrub: true,
      onUpdate: (self) => {
        const p = Math.max(0, Math.min(1, self.progress));
        if (Math.abs(p - lastProgress) < 0.0004) return;
        lastProgress = p;

        if (rafId !== null) cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(() => {
          setProgress(p);
          if (onProgressChangeRef.current) {
            onProgressChangeRef.current(p);
          }
        });
      },
    });

    scrollTriggerRef.current = st;

    // Keyboard support for timeline navigation
    const handleKeyDown = (e: KeyboardEvent) => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (maxScroll <= 0) return;

      const step = window.innerHeight * 0.45;
      if (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === ' ') {
        e.preventDefault();
        lenis.scrollTo(window.scrollY + step, { duration: 1.2 });
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault();
        lenis.scrollTo(window.scrollY - step, { duration: 1.2 });
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      gsap.ticker.remove(tickerCallback);
      if (st) st.kill();
      lenis.destroy();
      lenisRef.current = null;
      scrollTriggerRef.current = null;
    };
  }, [enabled]);

  const scrollToProgress = useCallback((targetProgress: number, duration: number = 1.6) => {
    if (!lenisRef.current) return;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const targetY = targetProgress * maxScroll;
    lenisRef.current.scrollTo(targetY, { duration });
  }, []);

  return {
    progress,
    scrollTo: scrollToProgress,
    scrollToProgress,
    lenis: lenisRef.current,
    scrollTrigger: scrollTriggerRef.current,
  };
}

