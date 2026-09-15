import { CalendarThemeConfig, CalendarSeason, TimeOfDayPhase } from '../types.ts';

/**
 * Real-time Calendar Theme Engine
 * Synchronizes visual atmosphere, particle behaviors, ambient tints,
 * and anniversary resonance according to the actual calendar time and date.
 */

export function calculateCalendarTheme(currentDate: Date = new Date()): CalendarThemeConfig {
  const month = currentDate.getMonth(); // 0-indexed (0 = Jan, 7 = Aug, 8 = Sep)
  const dayOfMonth = currentDate.getDate();
  const hours = currentDate.getHours();
  const minutes = currentDate.getMinutes();

  // 1. Season Determination
  let season: CalendarSeason = 'summer';
  let seasonLabel = 'Summer';
  if (month >= 2 && month <= 4) {
    season = 'spring';
    seasonLabel = 'Spring Meadow';
  } else if (month >= 5 && month <= 7) {
    season = 'summer';
    seasonLabel = 'Summer Bloom';
  } else if (month >= 8 && month <= 10) {
    season = 'autumn';
    seasonLabel = 'Autumn Mountain';
  } else {
    season = 'winter';
    seasonLabel = 'Winter Highlands';
  }

  // 2. Time of Day Phase Determination
  let phase: TimeOfDayPhase = 'day';
  let phaseLabel = 'Mountain Daylight';
  if (hours >= 5 && hours < 8) {
    phase = 'dawn';
    phaseLabel = 'Alpine Dawn';
  } else if (hours >= 8 && hours < 17) {
    phase = 'day';
    phaseLabel = 'Luminous Daylight';
  } else if (hours >= 17 && hours < 20) {
    phase = 'golden_hour';
    phaseLabel = 'Golden Hour';
  } else if (hours >= 20 && hours < 22) {
    phase = 'dusk';
    phaseLabel = 'Twilight Dusk';
  } else {
    phase = 'midnight';
    phaseLabel = 'Midnight Starlight';
  }

  // 3. Anniversary & Milestone Sync (August 22)
  const isAugust22 = month === 7 && dayOfMonth === 22;
  const isAnniversaryMonth = month === 7;

  // 4. Atmosphere Tokens & Particle Styling
  let skyGradient = 'radial-gradient(ellipse at 70% 30%, rgba(223, 156, 83, 0.12) 0%, transparent 70%)';
  let accentColor = '#df9c53';
  let ambientGlow = 'rgba(223, 156, 83, 0.2)';
  let particleColors = ['#f5cb98', '#df9c53', '#ffffff', '#e8c59f'];
  let particleStyle: CalendarThemeConfig['particleStyle'] = 'golden_embers';
  let tagline = 'Real-time landscape sync';

  if (isAugust22) {
    tagline = 'August 22 • Milestone Convergence Resonance';
    accentColor = '#fcd34d';
    ambientGlow = 'rgba(252, 211, 77, 0.35)';
    skyGradient = 'radial-gradient(ellipse at 50% 25%, rgba(253, 224, 71, 0.22) 0%, rgba(245, 158, 11, 0.12) 45%, transparent 70%)';
    particleColors = ['#fde047', '#f59e0b', '#ffffff', '#fed7aa', '#fef08a'];
    particleStyle = 'stardust';
  } else if (phase === 'dawn') {
    skyGradient = 'radial-gradient(ellipse at 75% 30%, rgba(255, 200, 160, 0.18) 0%, rgba(200, 160, 220, 0.1) 40%, transparent 70%)';
    accentColor = '#e5aa6d';
    ambientGlow = 'rgba(229, 170, 109, 0.25)';
    particleColors = ['#ffffff', '#ffd9b3', '#d8b4e2', '#ffe0cc'];
    particleStyle = 'mist';
    tagline = `Morning First Light • ${seasonLabel}`;
  } else if (phase === 'golden_hour') {
    skyGradient = 'radial-gradient(ellipse at 65% 35%, rgba(245, 158, 11, 0.22) 0%, rgba(225, 29, 72, 0.1) 50%, transparent 70%)';
    accentColor = '#df9c53';
    ambientGlow = 'rgba(223, 156, 83, 0.3)';
    particleColors = ['#f59e0b', '#fbbf24', '#f97316', '#ffedd5'];
    particleStyle = 'golden_embers';
    tagline = `Warm Sunset Glow • ${seasonLabel}`;
  } else if (phase === 'dusk') {
    skyGradient = 'radial-gradient(ellipse at 70% 30%, rgba(168, 85, 247, 0.18) 0%, rgba(236, 72, 153, 0.1) 45%, transparent 70%)';
    accentColor = '#c084fc';
    ambientGlow = 'rgba(192, 132, 252, 0.25)';
    particleColors = ['#c084fc', '#e879f9', '#f0abfc', '#ffffff'];
    particleStyle = 'fireflies';
    tagline = `Twilight Atmosphere • ${seasonLabel}`;
  } else if (phase === 'midnight') {
    skyGradient = 'radial-gradient(ellipse at 50% 20%, rgba(99, 102, 241, 0.16) 0%, rgba(59, 130, 246, 0.08) 50%, transparent 70%)';
    accentColor = '#818cf8';
    ambientGlow = 'rgba(129, 140, 248, 0.25)';
    particleColors = ['#ffffff', '#c7d2fe', '#818cf8', '#a5b4fc'];
    particleStyle = 'stardust';
    tagline = `Quiet Night Sky • ${seasonLabel}`;
  } else {
    // Day
    skyGradient = 'radial-gradient(ellipse at 60% 25%, rgba(254, 240, 138, 0.15) 0%, rgba(223, 156, 83, 0.08) 45%, transparent 70%)';
    accentColor = '#df9c53';
    ambientGlow = 'rgba(223, 156, 83, 0.2)';
    particleColors = ['#ffffff', '#fef08a', '#fed7aa', '#fde68a'];
    particleStyle = 'pollen';
    tagline = `Crisp Daylight • ${seasonLabel}`;
  }

  // Formatting strings
  const formattedTime = currentDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const formattedDate = currentDate.toLocaleDateString([], {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return {
    season,
    seasonLabel,
    phase,
    phaseLabel,
    formattedTime,
    formattedDate,
    isAugust22,
    isAnniversaryMonth,
    skyGradient,
    accentColor,
    ambientGlow,
    particleColors,
    particleStyle,
    tagline,
  };
}
