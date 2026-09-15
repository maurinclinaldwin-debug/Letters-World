import { useState, useCallback } from 'react';
import { ExperienceState } from '../types.ts';

export function useExperienceState(initialState: ExperienceState = 'INTRO') {
  const [state, setState] = useState<ExperienceState>(initialState);

  const setIntro = useCallback(() => setState('INTRO'), []);
  const setExploring = useCallback(() => setState('EXPLORING'), []);
  const setLetterFocused = useCallback(() => setState('LETTER_FOCUSED'), []);
  const setFutureDestination = useCallback(() => setState('FUTURE_DESTINATION'), []);
  const setOpeningLetter = useCallback(() => setState('OPENING_LETTER'), []);

  return {
    state,
    setState,
    setIntro,
    setExploring,
    setLetterFocused,
    setFutureDestination,
    setOpeningLetter,
    isIntro: state === 'INTRO',
    isExploring: state === 'EXPLORING',
    isLetterFocused: state === 'LETTER_FOCUSED',
    isFutureDestination: state === 'FUTURE_DESTINATION',
    isOpeningLetter: state === 'OPENING_LETTER',
  };
}
