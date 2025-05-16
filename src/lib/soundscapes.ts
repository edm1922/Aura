/**
 * Utility for managing ambient soundscapes based on personality traits
 */
import { ambientSounds, soundEffects, mapSoundToReliableSource } from './reliable-audio-sources';

// Types for personality traits
interface PersonalityTraits {
  openness?: number;
  conscientiousness?: number;
  extraversion?: number;
  agreeableness?: number;
  neuroticism?: number;
}

// Soundscape interface
export interface Soundscape {
  id: string;
  name: string;
  description: string;
  primaryTrait: string;
  secondaryTrait?: string;
  baseVolume: number;
  tracks: SoundTrack[];
}

// Sound track interface
export interface SoundTrack {
  id: string;
  name: string;
  file: string;
  volume: number; // 0-1
  loop: boolean;
  traitInfluence?: {
    trait: string;
    effect: 'volume' | 'pitch' | 'filter';
    min: number;
    max: number;
  };
}

// Base soundscapes for each trait
const traitSoundscapes: Record<string, Soundscape> = {
  openness: {
    id: 'openness-soundscape',
    name: 'Creative Exploration',
    description: 'An ambient soundscape with ethereal tones that inspire creativity and curiosity.',
    primaryTrait: 'openness',
    baseVolume: 0.5,
    tracks: [
      {
        id: 'openness-ambient',
        name: 'Ambient Pad',
        file: '/sounds/openness/ambient-pad.mp3',
        volume: 0.6,
        loop: true,
      },
      {
        id: 'openness-chimes',
        name: 'Wind Chimes',
        file: '/sounds/openness/chimes.mp3',
        volume: 0.4,
        loop: true,
        traitInfluence: {
          trait: 'openness',
          effect: 'volume',
          min: 0.2,
          max: 0.7,
        },
      },
      {
        id: 'openness-melody',
        name: 'Gentle Melody',
        file: '/sounds/openness/melody.mp3',
        volume: 0.3,
        loop: true,
      },
    ],
  },

  conscientiousness: {
    id: 'conscientiousness-soundscape',
    name: 'Focused Flow',
    description: 'A structured, rhythmic soundscape that enhances concentration and productivity.',
    primaryTrait: 'conscientiousness',
    baseVolume: 0.5,
    tracks: [
      {
        id: 'conscientiousness-rhythm',
        name: 'Steady Rhythm',
        file: '/sounds/conscientiousness/rhythm.mp3',
        volume: 0.5,
        loop: true,
      },
      {
        id: 'conscientiousness-focus',
        name: 'Focus Tones',
        file: '/sounds/conscientiousness/focus.mp3',
        volume: 0.4,
        loop: true,
        traitInfluence: {
          trait: 'conscientiousness',
          effect: 'volume',
          min: 0.3,
          max: 0.6,
        },
      },
      {
        id: 'conscientiousness-clarity',
        name: 'Clarity Bells',
        file: '/sounds/conscientiousness/clarity.mp3',
        volume: 0.3,
        loop: true,
      },
    ],
  },

  extraversion: {
    id: 'extraversion-soundscape',
    name: 'Social Energy',
    description: 'A vibrant, uplifting soundscape with energetic elements that reflect social dynamism.',
    primaryTrait: 'extraversion',
    baseVolume: 0.5,
    tracks: [
      {
        id: 'extraversion-energy',
        name: 'Energy Base',
        file: '/sounds/extraversion/energy.mp3',
        volume: 0.5,
        loop: true,
      },
      {
        id: 'extraversion-rhythm',
        name: 'Social Rhythm',
        file: '/sounds/extraversion/rhythm.mp3',
        volume: 0.4,
        loop: true,
        traitInfluence: {
          trait: 'extraversion',
          effect: 'volume',
          min: 0.2,
          max: 0.7,
        },
      },
      {
        id: 'extraversion-melody',
        name: 'Upbeat Melody',
        file: '/sounds/extraversion/melody.mp3',
        volume: 0.4,
        loop: true,
      },
    ],
  },

  agreeableness: {
    id: 'agreeableness-soundscape',
    name: 'Harmonious Balance',
    description: 'A warm, gentle soundscape with harmonious tones that promote peace and connection.',
    primaryTrait: 'agreeableness',
    baseVolume: 0.5,
    tracks: [
      {
        id: 'agreeableness-warmth',
        name: 'Warm Ambient',
        file: '/sounds/agreeableness/warmth.mp3',
        volume: 0.6,
        loop: true,
      },
      {
        id: 'agreeableness-harmony',
        name: 'Harmonic Tones',
        file: '/sounds/agreeableness/harmony.mp3',
        volume: 0.4,
        loop: true,
        traitInfluence: {
          trait: 'agreeableness',
          effect: 'volume',
          min: 0.3,
          max: 0.6,
        },
      },
      {
        id: 'agreeableness-nature',
        name: 'Nature Sounds',
        file: '/sounds/agreeableness/nature.mp3',
        volume: 0.3,
        loop: true,
      },
    ],
  },

  neuroticism: {
    id: 'neuroticism-soundscape',
    name: 'Emotional Depth',
    description: 'A complex, nuanced soundscape with calming elements that soothe emotional intensity.',
    primaryTrait: 'neuroticism',
    baseVolume: 0.4, // Slightly lower base volume for sensitivity
    tracks: [
      {
        id: 'neuroticism-calm',
        name: 'Calming Base',
        file: '/sounds/neuroticism/calm.mp3',
        volume: 0.6,
        loop: true,
      },
      {
        id: 'neuroticism-water',
        name: 'Water Sounds',
        file: '/sounds/neuroticism/water.mp3',
        volume: 0.5,
        loop: true,
      },
      {
        id: 'neuroticism-depth',
        name: 'Emotional Depth',
        file: '/sounds/neuroticism/depth.mp3',
        volume: 0.3,
        loop: true,
        traitInfluence: {
          trait: 'neuroticism',
          effect: 'volume',
          min: 0.1,
          max: 0.5, // Lower max for sensitivity
        },
      },
    ],
  },
};

// Balanced soundscape for when no trait is particularly dominant
const balancedSoundscape: Soundscape = {
  id: 'balanced-soundscape',
  name: 'Balanced Harmony',
  description: 'A balanced, harmonious soundscape that reflects a well-rounded personality.',
  primaryTrait: 'balanced',
  baseVolume: 0.5,
  tracks: [
    {
      id: 'balanced-ambient',
      name: 'Balanced Ambient',
      file: '/sounds/balanced/ambient.mp3',
      volume: 0.5,
      loop: true,
    },
    {
      id: 'balanced-melody',
      name: 'Gentle Melody',
      file: '/sounds/balanced/melody.mp3',
      volume: 0.4,
      loop: true,
    },
    {
      id: 'balanced-nature',
      name: 'Nature Elements',
      file: '/sounds/balanced/nature.mp3',
      volume: 0.3,
      loop: true,
    },
  ],
};

// Get dominant trait from personality profile
export function getDominantTrait(traits: PersonalityTraits): string | null {
  if (!traits || Object.keys(traits).length === 0) {
    return null;
  }

  const entries = Object.entries(traits);
  if (entries.length === 0) return null;

  // Sort traits by score (highest first)
  const sortedTraits = entries.sort((a, b) => b[1] - a[1]);

  // Check if the highest trait is significantly higher than the second (by at least 0.5)
  if (sortedTraits.length > 1 && sortedTraits[0][1] - sortedTraits[1][1] >= 0.5) {
    return sortedTraits[0][0];
  }

  // If no clear dominant trait, return null
  return null;
}

// Get secondary trait (second highest)
export function getSecondaryTrait(traits: PersonalityTraits): string | null {
  if (!traits || Object.keys(traits).length < 2) {
    return null;
  }

  const entries = Object.entries(traits);
  if (entries.length < 2) return null;

  // Sort traits by score (highest first)
  const sortedTraits = entries.sort((a, b) => b[1] - a[1]);

  // Return the name of the second highest trait
  return sortedTraits[1][0];
}

// Generate a soundscape based on personality traits
export function generateSoundscape(traits: PersonalityTraits): Soundscape {
  try {
    if (!traits || Object.keys(traits).length === 0) {
      console.log('No traits provided, using balanced soundscape');
      return balancedSoundscape;
    }

    const dominantTrait = getDominantTrait(traits);
    console.log('Dominant trait detected:', dominantTrait);

    // If there's a clear dominant trait, use its base soundscape
    if (dominantTrait && traits[dominantTrait as keyof PersonalityTraits] !== undefined &&
        traits[dominantTrait as keyof PersonalityTraits]! >= 3.5) {
      // Make sure the trait exists in our soundscapes
      if (traitSoundscapes[dominantTrait]) {
        console.log(`Using ${dominantTrait} soundscape`);

        // Create a copy to avoid modifying the original
        const soundscape = { ...traitSoundscapes[dominantTrait] };

        // Increase the base volume for better audibility
        soundscape.baseVolume = Math.min(soundscape.baseVolume * 1.5, 1.0);

        return soundscape;
      } else {
        console.warn(`Trait ${dominantTrait} not found in soundscapes, using balanced`);
      }
    }

    // If no clear dominant trait or trait not found, use the balanced soundscape
    console.log('Using balanced soundscape');

    // Create a copy to avoid modifying the original
    const soundscape = { ...balancedSoundscape };

    // Increase the base volume for better audibility
    soundscape.baseVolume = Math.min(soundscape.baseVolume * 1.5, 1.0);

    return soundscape;
  } catch (error) {
    console.error('Error generating soundscape:', error);
    return balancedSoundscape;
  }
}

// Themed soundscapes (independent of personality traits)
export const themedSoundscapes: Record<string, Soundscape> = {
  'mystic-forest': {
    id: 'mystic-forest',
    name: 'Mystic Forest',
    description: 'Immerse yourself in the enchanting sounds of a magical forest with gentle winds, distant birds, and mysterious chimes.',
    primaryTrait: 'themed',
    baseVolume: 0.8, // Higher base volume for better audibility
    tracks: [
      {
        id: 'forest-ambient',
        name: 'Forest Ambience',
        file: '/sounds/themes/mystic-forest/ambient.mp3',
        volume: 0.6,
        loop: true,
      },
      {
        id: 'forest-birds',
        name: 'Forest Birds',
        file: '/sounds/themes/mystic-forest/birds.mp3',
        volume: 0.4,
        loop: true,
      },
      {
        id: 'forest-chimes',
        name: 'Mystic Chimes',
        file: '/sounds/themes/mystic-forest/chimes.mp3',
        volume: 0.3,
        loop: true,
      },
    ],
  },

  'celestial-flow': {
    id: 'celestial-flow',
    name: 'Celestial Flow',
    description: 'Float among the stars with this ethereal soundscape featuring cosmic tones, gentle pulses, and harmonic resonances.',
    primaryTrait: 'themed',
    baseVolume: 0.8, // Higher base volume for better audibility
    tracks: [
      {
        id: 'celestial-ambient',
        name: 'Cosmic Ambient',
        file: '/sounds/themes/celestial-flow/ambient.mp3',
        volume: 0.6,
        loop: true,
      },
      {
        id: 'celestial-pulses',
        name: 'Stellar Pulses',
        file: '/sounds/themes/celestial-flow/pulses.mp3',
        volume: 0.4,
        loop: true,
      },
      {
        id: 'celestial-tones',
        name: 'Harmonic Tones',
        file: '/sounds/themes/celestial-flow/tones.mp3',
        volume: 0.3,
        loop: true,
      },
    ],
  },

  'ocean-dream': {
    id: 'ocean-dream',
    name: 'Ocean Dream',
    description: 'Drift away with the calming sounds of gentle waves, distant seagulls, and the peaceful rhythm of the ocean.',
    primaryTrait: 'themed',
    baseVolume: 0.8, // Higher base volume for better audibility
    tracks: [
      {
        id: 'ocean-waves',
        name: 'Ocean Waves',
        file: '/sounds/themes/ocean-dream/waves.mp3',
        volume: 0.6,
        loop: true,
      },
      {
        id: 'ocean-seagulls',
        name: 'Distant Seagulls',
        file: '/sounds/themes/ocean-dream/seagulls.mp3',
        volume: 0.3,
        loop: true,
      },
      {
        id: 'ocean-underwater',
        name: 'Underwater Tones',
        file: '/sounds/themes/ocean-dream/underwater.mp3',
        volume: 0.4,
        loop: true,
      },
    ],
  },

  'aurora-borealis': {
    id: 'aurora-borealis',
    name: 'Aurora Borealis',
    description: 'Experience the magical atmosphere of the Northern Lights with shimmering tones, gentle winds, and crystalline sounds.',
    primaryTrait: 'themed',
    baseVolume: 0.8, // Higher base volume for better audibility
    tracks: [
      {
        id: 'aurora-ambient',
        name: 'Arctic Ambient',
        file: '/sounds/themes/aurora-borealis/ambient.mp3',
        volume: 0.6,
        loop: true,
      },
      {
        id: 'aurora-shimmer',
        name: 'Light Shimmer',
        file: '/sounds/themes/aurora-borealis/shimmer.mp3',
        volume: 0.4,
        loop: true,
      },
      {
        id: 'aurora-crystals',
        name: 'Ice Crystals',
        file: '/sounds/themes/aurora-borealis/crystals.mp3',
        volume: 0.3,
        loop: true,
      },
    ],
  },
};

// Get placeholder sound files for development/demo
export function getPlaceholderSounds(): Record<string, string> {
  // These are guaranteed working audio URLs from Google's sound library
  const workingSounds = {
    // Ambient loops (longer sounds)
    ambientLoop1: 'https://actions.google.com/sounds/v1/ambiences/forest_ambience.ogg', // Forest ambience
    ambientLoop2: 'https://actions.google.com/sounds/v1/ambiences/mountain_wind.ogg', // Wind ambience
    ambientLoop3: 'https://actions.google.com/sounds/v1/water/waves_crashing_on_rock_beach.ogg', // Ocean waves
    ambientLoop4: 'https://actions.google.com/sounds/v1/weather/rain_on_roof.ogg', // Rain sounds

    // Short sounds and effects
    chimes: 'https://actions.google.com/sounds/v1/household/metal_bowl_struck.ogg', // Chimes
    bell: 'https://actions.google.com/sounds/v1/musical_instruments/bright_piano_bell.ogg', // Bell sound
    piano: 'https://actions.google.com/sounds/v1/musical_instruments/piano_phrase.ogg', // Piano notes
    melody: 'https://actions.google.com/sounds/v1/musical_instruments/harp_phrase.ogg', // Gentle melody
  };

  // Add Pixabay sounds as fallbacks
  const fallbackSounds = {
    ambientLoop1: ambientSounds.forest1,
    ambientLoop2: ambientSounds.wind1,
    ambientLoop3: ambientSounds.water2,
    ambientLoop4: ambientSounds.water3,
    chimes: soundEffects.bell1,
    bell: soundEffects.bell2,
    piano: soundEffects.piano1,
    melody: soundEffects.piano2
  };

  // Log that we're using placeholder sounds
  console.log('Using placeholder sounds from Google and Pixabay');

  const soundMap = {
    // Personality-based soundscapes
    'openness/ambient-pad.mp3': workingSounds.ambientLoop1,
    'openness/chimes.mp3': workingSounds.chimes,
    'openness/melody.mp3': workingSounds.melody,

    'conscientiousness/rhythm.mp3': workingSounds.ambientLoop2,
    'conscientiousness/focus.mp3': workingSounds.bell,
    'conscientiousness/clarity.mp3': workingSounds.piano,

    'extraversion/energy.mp3': workingSounds.ambientLoop3,
    'extraversion/rhythm.mp3': workingSounds.chimes,
    'extraversion/melody.mp3': workingSounds.melody,

    'agreeableness/warmth.mp3': workingSounds.ambientLoop4,
    'agreeableness/harmony.mp3': workingSounds.piano,
    'agreeableness/nature.mp3': workingSounds.ambientLoop1,

    'neuroticism/calm.mp3': workingSounds.ambientLoop4,
    'neuroticism/water.mp3': workingSounds.ambientLoop3,
    'neuroticism/depth.mp3': workingSounds.piano,

    'balanced/ambient.mp3': workingSounds.ambientLoop2,
    'balanced/melody.mp3': workingSounds.piano,
    'balanced/nature.mp3': workingSounds.ambientLoop4,

    // Themed soundscapes
    'themes/mystic-forest/ambient.mp3': workingSounds.ambientLoop1,
    'themes/mystic-forest/birds.mp3': workingSounds.ambientLoop1,
    'themes/mystic-forest/chimes.mp3': workingSounds.chimes,

    'themes/celestial-flow/ambient.mp3': workingSounds.ambientLoop2,
    'themes/celestial-flow/pulses.mp3': workingSounds.bell,
    'themes/celestial-flow/tones.mp3': workingSounds.melody,

    'themes/ocean-dream/waves.mp3': workingSounds.ambientLoop3,
    'themes/ocean-dream/seagulls.mp3': workingSounds.ambientLoop3,
    'themes/ocean-dream/underwater.mp3': workingSounds.ambientLoop3,

    'themes/aurora-borealis/ambient.mp3': workingSounds.ambientLoop2,
    'themes/aurora-borealis/shimmer.mp3': workingSounds.bell,
    'themes/aurora-borealis/crystals.mp3': workingSounds.piano,

    // Fallback for any missing sounds
    'fallback.mp3': workingSounds.ambientLoop1,
  };

  // Create a proxy to handle any missing keys with fallbacks
  return new Proxy(soundMap, {
    get: (target, prop) => {
      if (typeof prop === 'string') {
        // If the key exists in our map, return it
        if (prop in target) {
          return target[prop as keyof typeof target];
        }

        // Try to map it to a reliable source
        const mappedSource = mapSoundToReliableSource(prop);
        if (mappedSource) {
          return mappedSource;
        }

        // Last resort fallback
        return '/sounds/fallback-ambient.mp3';
      }
      return undefined;
    }
  });
}
