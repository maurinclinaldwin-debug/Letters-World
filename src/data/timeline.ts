/**
 * Letters World — Data-Driven Timeline
 *
 * Each entry represents a point along the chronological journey through the landscape.
 * Actual letter content is NOT stored here — Letters World acts purely as the
 * cinematic landscape timeline and gateway to individual destinations.
 */

import { TimelineEntry, LandscapeBackground, MusicTrack } from '../types.ts';

export const TIMELINE_ENTRIES: TimelineEntry[] = [
  {
    id: 'august-22-2026',
    date: 'August 22, 2026',
    displayYear: '2026',
    monthDay: 'August 22',
    title: '11th Monthsary',
    subtitle: 'A letter written from two perspectives.',
    description: 'Discovered among the alpine wildflowers on the lower meadow slope.',
    status: 'available',
    url: 'https://secret-letter-daw.vercel.app/',
    landscape: 'sunset',
    progress: 0.38,
    pathPercent: {
      x: 38,
      y: 62,
    },
    terrainFeature: 'Wildflower Meadow Slope',
    badge: 'Discovered',
    letterContent: {
      summary: 'An intimate keepsake penned on our 11th monthsary, chronicling our shared path through two distinct viewpoints.',
      perspectives: [
        {
          label: 'Perspective I',
          author: 'Her Perspective',
          title: 'Quiet Constellations',
          quote: 'Every road we walk together feels quieter, safer, and infinitely more alive.',
          paragraphs: [
            'Eleven months ago, love felt like a quiet horizon I could only gaze at from afar. Today, it lives in every morning whisper, every laugh shared over ordinary moments, and the unhurried way your hand always finds mine without needing words.',
            'Thank you for being my anchor when the seasons shift and the mountain winds grow cold. You have taught me what patience truly looks like, what unwavering devotion feels like, and how gentle life becomes when shared with the one your soul was seeking.',
            'As we walk through these wildflowers toward our first full year, I keep every memory we have gathered tucked close against my heart. There is nowhere else in this universe I would rather be.'
          ],
          signoff: 'With all my heart, always and endlessly.'
        },
        {
          label: 'Perspective II',
          author: 'His Perspective',
          title: 'The Road We Chose',
          quote: 'There has never been a single second where I doubted the warmth in your eyes.',
          paragraphs: [
            'Looking back at these eleven months, I can trace every bend in the road where we chose each other. From rainy forest trails to high ridges under the stars, your presence has turned every ordinary path into sacred ground.',
            'You give courage to my quietest thoughts and grace to every step forward. With you, even the steepest ascents feel effortless, because every sunset looks richer through your eyes.',
            'Eleven months down, a lifetime yet to unfold. Thank you for choosing me, for believing in us, and for making this journey the greatest adventure of my life.'
          ],
          signoff: 'Yours in this universe, and every one beyond.'
        }
      ],
      reflection: 'Written on August 22, 2026 at the Wildflower Meadow trailhead.'
    }
  },
  {
    id: 'august-22-2027',
    date: 'August 22, 2027',
    displayYear: '2027',
    monthDay: 'August 22',
    title: 'One Year Anniversary',
    subtitle: 'A destination still ahead.',
    description: 'Along the high ridge trail toward the dawn horizon.',
    status: 'upcoming',
    url: null,
    landscape: 'dawn',
    progress: 0.88,
    pathPercent: {
      x: 74,
      y: 28,
    },
    terrainFeature: 'High Ridge Crest',
    badge: 'Upcoming',
    upcomingMessage: "This part of the road hasn't been written yet. It will open on August 22, 2027 as our first full year unfolds.",
    letterContent: {
      summary: 'A sealed time capsule letter resting at the crest of the mountain ridge, awaiting our one-year milestone.',
      body: [
        'To Our Future Selves at the High Ridge Crest:',
        'When you finally open this parchment on August 22, 2027, 365 days of shared sunrises, quiet conversations, and shared dreams will have passed.',
        'Remember the promise made on the lower trails: to always choose kindness, to laugh through the unexpected rainstorms, and to keep walking side by side no matter how steep the climb.',
        'The road ahead is waiting for our footprints.'
      ],
      sealNote: 'Sealed until August 22, 2027. Time capsule protected by the starlight trail.'
    }
  },
];

export const TIMELINE_PROLOGUE = {
  universe: 'ATING UNIVERSE',
  title: 'LETTERS',
  subtitle: 'Words we left along the way.',
  instruction: 'SCROLL TO WANDER',
};

/**
 * Curated 5 photographic backgrounds selected randomly on load.
 * Features the road in the forest rainy season, foggy misty pines,
 * mountain sunset, trail dawn, and alpine morning.
 */
export const BACKGROUND_COLLECTION: LandscapeBackground[] = [
  {
    id: 'rainy-forest-road',
    name: 'Rainy Forest Road',
    subtitle: 'Winding asphalt through foggy evergreen trees in rainy season',
    url: '/rainy_forest_road.jpg',
    era: 'Rainy Season Road',
    ambientTone: '#0d1816',
  },
  {
    id: 'foggy-misty-pines',
    name: 'Misty Pine Ridges',
    subtitle: 'Soft rain, rolling ethereal fog, and quiet pine ridges',
    url: '/foggy_misty_pines.jpg',
    era: 'Misty Pine Forest',
    ambientTone: '#12181d',
  },
  {
    id: 'mountain-sunset',
    name: 'Mountain Sunset',
    subtitle: 'Warm golden light bathing the lower meadow slopes',
    url: '/mountain_sunset.jpg',
    era: 'Golden Hour Meadow',
    ambientTone: '#1e141a',
  },
  {
    id: 'mountain-trail-dawn',
    name: 'Mountain Trail Dawn',
    subtitle: 'High rocky trail climbing toward the distant horizon',
    url: '/mountain_trail_dawn.jpg',
    era: 'Early Dawn Ascent',
    ambientTone: '#131920',
  },
  {
    id: 'mountain-dawn',
    name: 'Alpine Dawn Peaks',
    subtitle: 'Serene solitude of mountain crests awakening to first light',
    url: '/mountain_dawn.jpg',
    era: 'Alpine Horizon',
    ambientTone: '#151722',
  },
];

/**
 * YouTube audio tracks for global ambient music player.
 * Autoplays randomly upon first user interaction.
 */
export const MUSIC_PLAYLIST: MusicTrack[] = [
  {
    id: 'RsEoX0FbETI',
    title: 'Acoustic Memories',
    artist: 'Ating Universe Soundtrack',
    embedUrl: 'https://www.youtube.com/embed/RsEoX0FbETI',
  },
  {
    id: 't_Kd_G7p6ZQ',
    title: 'Rain & Whispers',
    artist: 'Ating Universe Soundtrack',
    embedUrl: 'https://www.youtube.com/embed/t_Kd_G7p6ZQ',
  },
  {
    id: 'JfOGLEjdzcs',
    title: 'Letters in the Wind',
    artist: 'Ating Universe Soundtrack',
    embedUrl: 'https://www.youtube.com/embed/JfOGLEjdzcs',
  },
  {
    id: 'y-bKNGHZe8A',
    title: 'Road to Forever',
    artist: 'Ating Universe Soundtrack',
    embedUrl: 'https://www.youtube.com/embed/y-bKNGHZe8A',
  },
  {
    id: 'Dd_TvIC9Rmc',
    title: 'Quiet Horizons',
    artist: 'Ating Universe Soundtrack',
    embedUrl: 'https://www.youtube.com/embed/Dd_TvIC9Rmc',
  },
];

export const LANDSCAPE_ASSETS = {
  sunset: '/mountain_sunset.jpg',
  dawn: '/mountain_trail_dawn.jpg',
};

