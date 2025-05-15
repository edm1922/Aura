/**
 * Utility functions for audio playback and testing
 */

// Test if audio can be played
export async function testAudioPlayback(): Promise<boolean> {
  try {
    // Create an audio context
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext
    if (!AudioContext) {
      console.error('AudioContext not supported in this browser')
      return false
    }

    const audioContext = new AudioContext()

    // Check if the audio context is in a suspended state (common in browsers that require user interaction)
    if (audioContext.state === 'suspended') {
      console.warn('AudioContext is suspended, may require user interaction')
    }

    // Create a test oscillator
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    // Set the gain to 0 to make it silent
    gainNode.gain.value = 0

    // Connect the oscillator to the gain node and the gain node to the destination
    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)

    // Start and stop the oscillator immediately
    oscillator.start(0)
    oscillator.stop(0.001)

    console.log('Audio test successful')
    return true
  } catch (error) {
    console.error('Audio test failed:', error)
    return false
  }
}

// Unlock audio on iOS and other browsers that require user interaction
export function unlockAudio(): void {
  try {
    // Create a silent audio element
    const audio = new Audio()
    audio.src = 'data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4LjI5LjEwMAAAAAAAAAAAAAAA//tQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAADQgD///////////////////////////////////////////8AAAA8TEFNRTMuMTAwAQAAAAAAAAAAABSAJAJAQgAAgAAAA0JbYjQzAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'
    audio.load()

    // Play the silent audio
    const playPromise = audio.play()

    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          console.log('Audio unlocked successfully')
        })
        .catch(error => {
          console.warn('Could not unlock audio:', error)
        })
    }
  } catch (error) {
    console.error('Error unlocking audio:', error)
  }
}

// Check if the browser supports audio playback
export function checkAudioSupport(): { supported: boolean; issues: string[] } {
  const issues: string[] = []
  let supported = true

  // Check for Audio API support
  if (typeof Audio === 'undefined') {
    issues.push('Audio API not supported')
    supported = false
  }

  // Check for AudioContext support
  const AudioContext = window.AudioContext || (window as any).webkitAudioContext
  if (!AudioContext) {
    issues.push('AudioContext not supported')
    supported = false
  }

  // Check for autoplay policy
  if (document.documentElement.hasAttribute('data-autoplay-policy')) {
    issues.push('Autoplay may be restricted')
  }

  // Check for iOS
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
  if (isIOS) {
    issues.push('iOS detected - may require user interaction for audio')
  }

  return { supported, issues }
}

// Play a test sound to check if audio is working
export function playTestSound(volume: number = 0.5): void {
  try {
    // Use a guaranteed working sound from Google's sound library and local fallbacks
    const testSounds = [
      '/sounds/test-tone.mp3', // Local test tone (first priority)
      'https://actions.google.com/sounds/v1/musical_instruments/bright_piano_bell.ogg', // Bell sound
      'https://actions.google.com/sounds/v1/musical_instruments/piano_phrase.ogg', // Piano notes
      'https://cdn.pixabay.com/download/audio/2021/08/09/audio_12b0c7443c.mp3', // Pixabay chime
      'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA' // Inline audio
    ];

    // Try multiple sounds in case one fails
    const audio = new Audio(testSounds[0]);

    // Set volume
    audio.volume = volume;

    // Log when the sound starts playing
    audio.onplay = () => {
      console.log('Test sound playing at volume:', volume);
    };

    // Log any errors and try the next sound
    audio.onerror = (error) => {
      console.error('Test sound error with first source:', error);

      // Try the second sound
      const audio2 = new Audio(testSounds[1]);
      audio2.volume = volume;

      audio2.onplay = () => {
        console.log('Second test sound playing');
      };

      audio2.onerror = (error2) => {
        console.error('Test sound error with second source:', error2);

        // Try the third sound
        const audio3 = new Audio(testSounds[2]);
        audio3.volume = volume;

        audio3.onplay = () => {
          console.log('Third test sound playing');
        };

        audio3.onerror = (error3) => {
          console.error('All test sounds failed:', error3);
        };

        audio3.play().catch(e => console.error('Third sound attempt failed:', e));
      };

      audio2.play().catch(e => console.error('Second sound attempt failed:', e));
    };

    // Play the sound
    const playPromise = audio.play();

    if (playPromise !== undefined) {
      playPromise.catch(error => {
        console.error('Error playing test sound:', error);

        // Try to unlock audio and try again
        unlockAudio();
        setTimeout(() => {
          audio.play().catch(e => {
            console.error('Second attempt failed:', e);

            // Try a different sound format
            const backupAudio = new Audio('data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA');
            backupAudio.volume = volume;
            backupAudio.play().catch(e2 => console.error('Backup sound failed:', e2));
          });
        }, 1000);
      });
    }
  } catch (error) {
    console.error('Error creating test sound:', error);
  }
}
