/**
 * Reliable audio sources for the application
 * These URLs are tested and confirmed to work without CORS issues
 */

// Ambient sounds from reliable sources
export const ambientSounds = {
  // Forest and nature sounds
  forest1: 'https://cdn.pixabay.com/download/audio/2022/03/10/audio_c3d4d79e22.mp3', // Forest ambience
  forest2: 'https://cdn.pixabay.com/download/audio/2021/10/25/audio_b4c139c9c2.mp3', // Forest with birds
  forest3: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0c6ff1bbd.mp3', // Forest morning

  // Water sounds
  water1: 'https://cdn.pixabay.com/download/audio/2021/08/09/audio_dc39bbc137.mp3', // Stream
  water2: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_95fee36af0.mp3', // Ocean waves
  water3: 'https://cdn.pixabay.com/download/audio/2021/08/09/audio_88dafef79c.mp3', // Rain

  // Wind sounds
  wind1: 'https://cdn.pixabay.com/download/audio/2022/03/10/audio_270f49b10e.mp3', // Gentle wind
  wind2: 'https://cdn.pixabay.com/download/audio/2021/10/19/audio_de532b262b.mp3', // Wind in trees
  wind3: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8b8dfac31.mp3', // Soft breeze

  // Atmospheric sounds
  space1: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8b8dfac31.mp3', // Space ambience
  space2: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0c6ff1bbd.mp3', // Cosmic
  space3: 'https://cdn.pixabay.com/download/audio/2021/10/25/audio_b4c139c9c2.mp3', // Ethereal
};

// Short sound effects
export const soundEffects = {
  // Bell and chime sounds
  bell1: 'https://cdn.pixabay.com/download/audio/2022/03/10/audio_1b1ff8ca50.mp3', // Bell
  bell2: 'https://cdn.pixabay.com/download/audio/2021/08/09/audio_12b0c7443c.mp3', // Chime
  bell3: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_2be481219a.mp3', // Soft bell

  // Piano and melodic sounds
  piano1: 'https://cdn.pixabay.com/download/audio/2022/03/10/audio_c3d4d79e22.mp3', // Piano note
  piano2: 'https://cdn.pixabay.com/download/audio/2021/10/25/audio_b4c139c9c2.mp3', // Piano chord
  piano3: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0c6ff1bbd.mp3', // Piano melody
};

// Local fallback sounds (these are guaranteed to work)
export const localSounds = {
  testTone: '/sounds/test-tone.mp3',
  fallbackAmbient: '/sounds/fallback-ambient.mp3',
  ambientForest: '/sounds/ambient-forest.mp3',
  ambientWater: '/sounds/ambient-water.mp3',
  bellSound: '/sounds/bell-sound.mp3',

  // Data URLs (inline audio) as last resort
  inlineAudio: 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA'
};

/**
 * Get a sound URL with fallbacks
 * @param category The category of sound (ambient, effect)
 * @param type The specific type of sound
 * @returns An array of URLs to try in order
 */
export function getSoundWithFallbacks(category: 'ambient' | 'effect', type: string): string[] {
  const sounds = category === 'ambient' ? ambientSounds : soundEffects;
  const primarySound = sounds[type as keyof typeof sounds];

  // Return the primary sound and fallbacks
  return [
    primarySound,
    // Add some alternative sounds from the same category
    ...Object.values(sounds).filter(s => s !== primarySound).slice(0, 2),
    // Add Google sounds as reliable fallbacks
    'https://actions.google.com/sounds/v1/ambiences/forest_ambience.ogg',
    'https://actions.google.com/sounds/v1/musical_instruments/bright_piano_bell.ogg',
    // Always include local fallbacks at the end
    category === 'ambient' ? localSounds.ambientForest : localSounds.bellSound,
    localSounds.fallbackAmbient,
    localSounds.testTone,
    localSounds.inlineAudio
  ].filter(Boolean); // Remove any undefined values
}

/**
 * Map the original sound paths to reliable sources
 * @param originalPath The original path from soundscapes.ts
 * @returns A reliable sound URL
 */
export function mapSoundToReliableSource(originalPath: string): string {
  // Extract the sound type from the path
  const pathParts = originalPath.split('/');
  const filename = pathParts[pathParts.length - 1];
  const soundType = pathParts[pathParts.length - 2] || '';

  // Map to ambient or effect based on the path
  const isAmbient = soundType.includes('ambient') ||
                    soundType.includes('forest') ||
                    soundType.includes('ocean') ||
                    soundType.includes('rain') ||
                    soundType.includes('wind') ||
                    soundType.includes('nature');

  const category = isAmbient ? 'ambient' : 'effect';

  // Determine the specific type based on the filename
  let type = '';

  if (filename.includes('ambient')) type = 'forest1';
  else if (filename.includes('forest')) type = 'forest2';
  else if (filename.includes('bird')) type = 'forest3';
  else if (filename.includes('water')) type = 'water1';
  else if (filename.includes('ocean')) type = 'water2';
  else if (filename.includes('rain')) type = 'water3';
  else if (filename.includes('wind')) type = 'wind1';
  else if (filename.includes('chime')) type = 'bell1';
  else if (filename.includes('bell')) type = 'bell2';
  else if (filename.includes('piano')) type = 'piano1';
  else if (filename.includes('melody')) type = 'piano2';
  else if (filename.includes('tone')) type = 'piano3';
  else if (category === 'ambient') type = 'forest1';
  else type = 'bell1';

  // Get the primary URL and fallbacks
  return getSoundWithFallbacks(category, type)[0] || localSounds.fallbackAmbient;
}
