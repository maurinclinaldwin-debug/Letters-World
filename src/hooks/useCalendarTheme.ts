import { useState, useEffect, useCallback } from 'react';
import { calculateCalendarTheme } from '../engine/calendarThemeEngine.ts';
import { CalendarThemeConfig, TimeOfDayPhase } from '../types.ts';

export function useCalendarTheme() {
  const [overridePhase, setOverridePhase] = useState<TimeOfDayPhase | null>(null);
  const [overrideAugust22, setOverrideAugust22] = useState<boolean>(false);
  const [theme, setTheme] = useState<CalendarThemeConfig>(() => calculateCalendarTheme());

  const computeCurrentTheme = useCallback(() => {
    let now = new Date();
    if (overrideAugust22) {
      // Simulate the 22nd of the current month (Milestone Starlight)
      now = new Date(now.getFullYear(), now.getMonth(), 22, now.getHours(), now.getMinutes());
    }

    if (overridePhase) {
      // Assign simulated hours for the phase
      let hour = 12;
      if (overridePhase === 'dawn') hour = 6;
      else if (overridePhase === 'day') hour = 13;
      else if (overridePhase === 'golden_hour') hour = 18;
      else if (overridePhase === 'dusk') hour = 20;
      else if (overridePhase === 'midnight') hour = 23;

      now = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hour, 30);
    }

    setTheme(calculateCalendarTheme(now));
  }, [overridePhase, overrideAugust22]);

  useEffect(() => {
    if (overridePhase !== null || overrideAugust22) {
      computeCurrentTheme();
    }

    // Recheck every 30 seconds for live calendar sync
    const interval = setInterval(computeCurrentTheme, 30000);
    return () => clearInterval(interval);
  }, [computeCurrentTheme, overridePhase, overrideAugust22]);

  const resetToLiveCalendar = useCallback(() => {
    setOverridePhase(null);
    setOverrideAugust22(false);
  }, []);

  return {
    theme,
    isLiveSync: overridePhase === null && !overrideAugust22,
    overridePhase,
    setOverridePhase,
    overrideAugust22,
    setOverrideAugust22,
    resetToLiveCalendar,
  };
}
