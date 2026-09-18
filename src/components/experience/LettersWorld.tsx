import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { AnimatePresence } from 'motion/react';
import { TIMELINE_ENTRIES, BACKGROUND_COLLECTION } from '../../data/timeline.ts';
import { TimelineEntry, LandscapeBackground } from '../../types.ts';
import { useTimelineProgress } from '../../hooks/useTimelineProgress.ts';
import { useCinematicTransition } from '../../hooks/useCinematicTransition.ts';
import { useCalendarTheme } from '../../hooks/useCalendarTheme.ts';
import { LandscapeStage } from './LandscapeStage.tsx';
import { CinematicIntro } from './CinematicIntro.tsx';
import { Timeline } from './Timeline.tsx';
import { LetterModal } from './LetterModal.tsx';
import { AnniversaryLetterCard } from './AnniversaryLetterCard.tsx';
import { UniverseBackButton } from '../navigation/UniverseBackButton.tsx';
import { UniversePortalReturn } from '../navigation/UniversePortalReturn.tsx';
import { BackgroundSwitcher } from '../navigation/BackgroundSwitcher.tsx';
import { CalendarThemeIndicator } from '../navigation/CalendarThemeIndicator.tsx';
import { GlobalMusicPlayer } from '../audio/GlobalMusicPlayer.tsx';
import { LetterTransition } from '../transitions/LetterTransition.tsx';
import { ATING_UNIVERSE_URL, getSafeUniverseUrl, replaceParentUrl } from '../../utils/navigation.ts';

export const LettersWorld: React.FC = () => {
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);
  const [modalEntry, setModalEntry] = useState<TimelineEntry | null>(null);
  const [isLetterModalOpen, setIsLetterModalOpen] = useState(false);

  // Real-time Calendar Theme Engine
  const {
    theme,
    isLiveSync,
    setOverridePhase,
    setOverrideAugust22,
    resetToLiveCalendar,
  } = useCalendarTheme();

  // Background collection initialized with a random start scene
  const [backgroundList, setBackgroundList] = useState<LandscapeBackground[]>(() => {
    const initialIndex = Math.floor(Math.random() * BACKGROUND_COLLECTION.length);
    const reordered = [...BACKGROUND_COLLECTION];
    if (initialIndex !== 0) {
      const [selected] = reordered.splice(initialIndex, 1);
      reordered.unshift(selected);
    }
    return reordered;
  });

  // Timeline entries
  const entries = useMemo(() => TIMELINE_ENTRIES, []);
  const august2026 = entries.find((e) => e.id === 'august-22-2026') || entries[0];

  // Scroll Progress (0.0 to 1.0) synchronized with GSAP ScrollTrigger & Lenis
  const { progress, scrollToProgress } = useTimelineProgress();
  const progressRef = useRef(progress);
  progressRef.current = progress;

  // Active scene calculation from scroll progress: every scroll changes the landscape
  const numBg = backgroundList.length;
  const scaledProgress = Math.max(0, Math.min(numBg - 1, progress * (numBg - 1)));
  const activeBgIndex = Math.round(scaledProgress);
  const currentBackground = backgroundList[activeBgIndex] || backgroundList[0];

  // Manual background selection & shuffle: maps the chosen scene into the current scroll position
  const handleSelectBackground = useCallback((newBg: LandscapeBackground) => {
    setBackgroundList((prev) => {
      const list = [...prev];
      const currentProg = progressRef.current;
      const currentIndex = Math.min(list.length - 1, Math.round(currentProg * (list.length - 1)));
      const existingIdx = list.findIndex((b) => b.id === newBg.id);
      if (existingIdx !== -1 && existingIdx !== currentIndex) {
        const temp = list[currentIndex];
        list[currentIndex] = list[existingIdx];
        list[existingIdx] = temp;
      }
      return list;
    });
  }, []);

  const handleRandomizeBackground = useCallback(() => {
    setBackgroundList((prev) => {
      const currentProg = progressRef.current;
      const currentIndex = Math.min(prev.length - 1, Math.round(currentProg * (prev.length - 1)));
      const currentId = prev[currentIndex]?.id;
      const available = BACKGROUND_COLLECTION.filter((b) => b.id !== currentId);
      const randomPick = available[Math.floor(Math.random() * available.length)];
      if (!randomPick) return prev;
      const list = [...prev];
      const existingIdx = list.findIndex((b) => b.id === randomPick.id);
      if (existingIdx !== -1 && existingIdx !== currentIndex) {
        const temp = list[currentIndex];
        list[currentIndex] = list[existingIdx];
        list[existingIdx] = temp;
      }
      return list;
    });
  }, []);

  // Cinematic Departure Transition
  const { isTransitioning, transitionPhase, transitionTarget, startTransition } = useCinematicTransition();

  // Handle clicking a roadmap circle: smoothly opens the letter modal
  const handleSelectEntry = useCallback(
    (entry: TimelineEntry) => {
      setSelectedEntryId(entry.id);
      setModalEntry(entry);
      setIsLetterModalOpen(true);
    },
    []
  );

  const handleCloseModal = useCallback(() => {
    setIsLetterModalOpen(false);
  }, []);

  // Handle external destination navigation through modal
  const handleModalNavigateToUrl = useCallback(
    (url: string, title: string) => {
      setIsLetterModalOpen(false);
      startTransition(
        url,
        title,
        'Crossing to Destination...'
      );
    },
    [startTransition]
  );

  // Handle returning to Ating Universe through parent with smooth cinematic transition
  const handleReturnToUniverse = useCallback(() => {
    const safeUrl = getSafeUniverseUrl(ATING_UNIVERSE_URL);
    // Replace parent URL immediately during the user interaction
    replaceParentUrl(safeUrl);
    startTransition(
      safeUrl,
      'Ating Universe',
      'Returning to Cosmos • https://ating-universe.vercel.app/'
    );
  }, [startTransition]);

  // Handle "Scroll to wander" prompt click: scrolls to the 11th monthsary circle on the path
  const handleScrollToWander = useCallback(() => {
    scrollToProgress(0.38, 2.0);
  }, [scrollToProgress]);

  // Active anniversary letter based on scroll journey progression
  const [dismissedCardId, setDismissedCardId] = useState<string | null>(null);

  // Auto reset dismissed card when scrolling out of its waypoint zone
  useEffect(() => {
    if (progress < 0.2 || (progress > 0.58 && progress < 0.68) || progress > 0.99) {
      setDismissedCardId(null);
    }
  }, [progress]);

  const activeAnniversaryEntry = useMemo(() => {
    if (isLetterModalOpen || isTransitioning) return null;

    const augustEntry = entries.find((e) => e.id === 'august-22-2026') || entries[0];
    const septEntry = entries.find((e) => e.id === '1st-year-anniversary') || entries[1];

    if (progress >= 0.24 && progress <= 0.54) {
      if (dismissedCardId === augustEntry.id) return null;
      return augustEntry;
    }
    if (progress >= 0.72 && progress <= 0.98) {
      if (dismissedCardId === septEntry.id) return null;
      return septEntry;
    }
    return null;
  }, [progress, entries, isLetterModalOpen, isTransitioning, dismissedCardId]);

  return (
    <div id="letters-world-root" className="relative w-full min-h-screen text-[#e8e4df]">
      {/* 1. Persistent Fixed Viewport Stage (2.5D Film Frame with backgrounds changing on every scroll) */}
      <LandscapeStage
        progress={progress}
        isLetterFocused={isLetterModalOpen}
        isOpeningLetter={isTransitioning}
        backgrounds={backgroundList}
        theme={theme}
      >
        {/* Glassy Top Header: Universe Navigation, Calendar Theme Engine, Scene Switcher & Global Music Player */}
        <header
          id="letters-world-header"
          className="fixed top-0 inset-x-0 z-30 flex items-center justify-between px-3 py-3 sm:px-8 sm:py-6 pointer-events-none gap-2"
        >
          <UniverseBackButton onNavigate={handleReturnToUniverse} />

          <div className="flex items-center gap-1.5 sm:gap-2 pointer-events-auto">
            {/* Real-time Calendar Sync Theme Engine Indicator */}
            <CalendarThemeIndicator
              theme={theme}
              isLiveSync={isLiveSync}
              onSelectPhase={setOverridePhase}
              onToggleAugust22={setOverrideAugust22}
              onResetLive={resetToLiveCalendar}
            />

            {/* Photographic Background Switcher */}
            <BackgroundSwitcher
              currentBackground={currentBackground}
              onSelectBackground={handleSelectBackground}
              onRandomizeBackground={handleRandomizeBackground}
            />

            {/* Centralized Ambient Music Player with Seamless Crossfading */}
            <GlobalMusicPlayer />
          </div>
        </header>

        {/* Dedicated Floating Cosmic Portal Return to Ating Universe */}
        <UniversePortalReturn
          onNavigate={handleReturnToUniverse}
          isTransitioning={isTransitioning}
        />

        {/* Cinematic Intro Sequence with Frosted Glass Panel */}
        <CinematicIntro
          progress={progress}
          onExplorePromptClick={handleScrollToWander}
          backgroundName={currentBackground.name}
        />

        {/* Embedded Landscape Circle Roadmap Trail with dynamic scroll reveal */}
        <Timeline
          entries={entries}
          progress={progress}
          focusedEntryId={selectedEntryId}
          onSelectEntry={handleSelectEntry}
          onReturnToUniverse={handleReturnToUniverse}
        />

        {/* Scroll-based Cinematic Anniversary Letter Cards floating in the lower stage */}
        <div className="fixed bottom-4 sm:bottom-8 inset-x-3 sm:inset-x-6 z-25 pointer-events-none flex justify-center">
          <AnimatePresence mode="wait">
            {activeAnniversaryEntry && (
              <AnniversaryLetterCard
                key={activeAnniversaryEntry.id}
                entry={activeAnniversaryEntry}
                themeIsMilestone22={theme.isAugust22 || theme.isMilestone22}
                onOpenLetter={handleSelectEntry}
                onNavigateToUrl={handleModalNavigateToUrl}
                onScrollToOtherLetter={(targetProg) => {
                  setDismissedCardId(null);
                  scrollToProgress(targetProg, 1.8);
                }}
                onDismiss={() => setDismissedCardId(activeAnniversaryEntry.id)}
                allEntries={entries}
              />
            )}
          </AnimatePresence>
        </div>

        {/* Interactive Letter Modal: Opens upon clicking any circle on the roadmap */}
        <LetterModal
          key={modalEntry?.id || 'none'}
          entry={modalEntry}
          isOpen={isLetterModalOpen}
          onClose={handleCloseModal}
          onNavigateToUrl={handleModalNavigateToUrl}
          onReturnToUniverse={handleReturnToUniverse}
        />

        {/* Glassy Portal Departure Transition */}
        <LetterTransition
          phase={transitionPhase}
          destinationTitle={transitionTarget?.title || august2026.title}
          destinationSubtitle={transitionTarget?.subtitle}
          destinationUrl={transitionTarget?.url}
        />
      </LandscapeStage>

      {/* 2. Natural Vertical Scroll Track bound directly to ScrollTrigger & Lenis */}
      <div
        id="timeline-scroll-track"
        className="relative w-full pointer-events-none"
        style={{ height: '360vh' }}
        aria-hidden="true"
      />
    </div>
  );
};
