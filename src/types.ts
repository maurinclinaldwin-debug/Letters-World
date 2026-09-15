/**
 * Letters World — Data Types & State Definitions
 */

export type ExperienceState =
  | 'INTRO'
  | 'EXPLORING'
  | 'LETTER_FOCUSED'
  | 'FUTURE_DESTINATION'
  | 'OPENING_LETTER';

export type LetterStatus = 'available' | 'upcoming';

export interface LetterPerspective {
  label: string;
  author: string;
  title: string;
  paragraphs: string[];
  quote?: string;
  signoff?: string;
}

export interface LetterContentData {
  summary: string;
  perspectives?: LetterPerspective[];
  body?: string[];
  reflection?: string;
  sealNote?: string;
}

export interface TimelineEntry {
  id: string;
  date: string;
  displayYear: string;
  monthDay: string;
  title: string;
  subtitle: string;
  description?: string;
  status: LetterStatus;
  url: string | null;
  landscape: 'sunset' | 'dawn';
  /** Timeline progress mark along the road (0.0 to 1.0) */
  progress: number;
  /** Relative path coordinate on landscape map */
  pathPercent: {
    x: number; // 0% - 100%
    y: number; // 0% - 100%
  };
  terrainFeature: string;
  badge?: string;
  upcomingMessage?: string;
  letterContent?: LetterContentData;
}

export interface AtmosphereSettings {
  windSpeed: number;
  particleCount: number;
  hazeOpacity: number;
  vignetteStrength: number;
}

export interface LandscapeBackground {
  id: string;
  name: string;
  subtitle: string;
  url: string;
  era: string;
  ambientTone: string;
}

export interface MusicTrack {
  id: string;
  title: string;
  artist: string;
  embedUrl: string;
}

export type CalendarSeason = 'spring' | 'summer' | 'autumn' | 'winter';
export type TimeOfDayPhase = 'dawn' | 'day' | 'golden_hour' | 'dusk' | 'midnight';

export interface CalendarThemeConfig {
  season: CalendarSeason;
  seasonLabel: string;
  phase: TimeOfDayPhase;
  phaseLabel: string;
  formattedTime: string;
  formattedDate: string;
  isAugust22: boolean;
  isAnniversaryMonth: boolean;
  skyGradient: string;
  accentColor: string;
  ambientGlow: string;
  particleColors: string[];
  particleStyle: 'fireflies' | 'pollen' | 'stardust' | 'mist' | 'golden_embers';
  tagline: string;
}

