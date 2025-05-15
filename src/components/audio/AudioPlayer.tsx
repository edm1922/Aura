'use client'

import { useState, useEffect, useRef } from 'react'
import { Soundscape, SoundTrack, getPlaceholderSounds } from '@/lib/soundscapes'

interface AudioPlayerProps {
  soundscape: Soundscape
  isPlaying: boolean
  volume: number
  onLoad?: () => void
}

export default function AudioPlayer({
  soundscape,
  isPlaying,
  volume = 0.5,
  onLoad,
}: AudioPlayerProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [loadedTracks, setLoadedTracks] = useState(0)
  const audioRefs = useRef<Record<string, HTMLAudioElement | null>>({})
  const placeholderSounds = getPlaceholderSounds()
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Initialize audio elements with improved performance and memory management
  useEffect(() => {
    // Wrap in try-catch to prevent any unhandled exceptions
    try {
      // Clean up previous audio elements and timeout
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current)
      }

      // Properly clean up audio elements to prevent memory leaks
      Object.values(audioRefs.current).forEach(audio => {
        if (audio) {
          try {
            // Remove all event listeners
            audio.oncanplaythrough = null
            audio.onerror = null
            audio.onended = null
            audio.onpause = null
            audio.onplay = null

            // Stop and unload
            audio.pause()
            audio.src = ''
            audio.load() // Force unload resources
          } catch (err) {
            console.warn('Error cleaning up audio element:', err)
          }
        }
      })

      // Reset state
      audioRefs.current = {}
      setIsLoaded(false)
      setLoadedTracks(0)

      // Set a safety timeout to prevent infinite loading
      loadingTimeoutRef.current = setTimeout(() => {
        if (!isLoaded) {
          console.log('Audio loading timeout - forcing loaded state')
          setIsLoaded(true)
          if (onLoad) onLoad()
        }
      }, 8000) // 8 second timeout
    } catch (error) {
      // Recover from any errors
      console.error('Error initializing audio elements:', error)
      setIsLoaded(true)
      if (onLoad) onLoad()
    }

    // Create new audio elements for each track - sequentially to reduce load
    const loadTrackSequentially = (index: number) => {
      if (index >= soundscape.tracks.length) {
        return // All tracks loaded
      }

      const track = soundscape.tracks[index]
      const audio = new Audio()

      // Use guaranteed working sounds from Google's sound library
      let audioSrc: string;

      // Map track types to reliable Google sound sources
      if (track.id.includes('ambient') || track.id.includes('nature')) {
        audioSrc = 'https://actions.google.com/sounds/v1/ambiences/forest_ambience.ogg';
      } else if (track.id.includes('water') || track.id.includes('ocean') || track.id.includes('waves')) {
        audioSrc = 'https://actions.google.com/sounds/v1/water/waves_crashing_on_rock_beach.ogg';
      } else if (track.id.includes('rain')) {
        audioSrc = 'https://actions.google.com/sounds/v1/weather/rain_on_roof.ogg';
      } else if (track.id.includes('bell') || track.id.includes('chime')) {
        audioSrc = 'https://actions.google.com/sounds/v1/musical_instruments/bright_piano_bell.ogg';
      } else if (track.id.includes('piano') || track.id.includes('melody')) {
        audioSrc = 'https://actions.google.com/sounds/v1/musical_instruments/piano_phrase.ogg';
      } else {
        // Default to forest ambience for any other track type
        audioSrc = 'https://actions.google.com/sounds/v1/ambiences/forest_ambience.ogg';
      }

      // Fallback sounds in case the primary one fails
      const fallbackSounds = [
        'https://actions.google.com/sounds/v1/ambiences/forest_ambience.ogg', // Forest ambience
        'https://actions.google.com/sounds/v1/water/waves_crashing_on_rock_beach.ogg', // Ocean waves
        'https://actions.google.com/sounds/v1/weather/rain_on_roof.ogg', // Rain sounds
        'https://actions.google.com/sounds/v1/musical_instruments/bright_piano_bell.ogg', // Bell sound
        '/sounds/fallback-ambient.mp3'  // Local fallback file
      ]

      // Add event listener for errors before setting the source
      audio.onerror = () => {
        console.warn(`Audio source failed for track ${track.id}, trying fallback`)

        // Try each fallback sound in sequence
        let fallbackIndex = 0
        const tryFallback = () => {
          if (fallbackIndex < fallbackSounds.length) {
            audio.src = fallbackSounds[fallbackIndex]
            fallbackIndex++
            // The error event will trigger again if this source fails
          } else {
            // All fallbacks failed, continue to next track
            console.error(`All audio sources failed for track ${track.id}`)
            handleError({ target: audio } as any)
          }
        }

        // Set up the error handler for fallback attempts
        audio.onerror = tryFallback

        // Try the first fallback
        tryFallback()
      }

      // Now set the source
      audio.src = audioSrc

      // Log the audio source for debugging
      console.log(`Loading audio track ${track.id} from: ${audio.src}`)

      audio.loop = track.loop
      audio.volume = 0 // Start with volume 0, will adjust when playing
      audio.preload = 'auto'

      // Track loading progress
      const handleCanPlayThrough = () => {
        audio.removeEventListener('canplaythrough', handleCanPlayThrough)

        setLoadedTracks(prev => {
          const newCount = prev + 1
          if (newCount === soundscape.tracks.length) {
            setIsLoaded(true)
            if (onLoad) onLoad()
            if (loadingTimeoutRef.current) {
              clearTimeout(loadingTimeoutRef.current)
            }
          }
          return newCount
        })

        // Load next track
        loadTrackSequentially(index + 1)
      }

      // Handle errors during loading
      const handleError = (e: ErrorEvent) => {
        console.error(`Error loading audio track ${track.id}:`, e)

        // Mark this track as loaded (even though it failed) to prevent hanging
        setLoadedTracks(prev => {
          const newCount = prev + 1
          if (newCount === soundscape.tracks.length) {
            setIsLoaded(true)
            if (onLoad) onLoad()
            if (loadingTimeoutRef.current) {
              clearTimeout(loadingTimeoutRef.current)
            }
          }
          return newCount
        })

        // Continue loading other tracks even if one fails
        loadTrackSequentially(index + 1)
      }

      audio.addEventListener('canplaythrough', handleCanPlayThrough)

      // The error handler is now set earlier for fallback handling
      // This is a backup in case that handler doesn't catch something
      audio.addEventListener('error', handleError)

      // Set a timeout for this specific track
      const trackTimeout = setTimeout(() => {
        audio.removeEventListener('canplaythrough', handleCanPlayThrough)
        audio.removeEventListener('error', handleError)
        console.warn(`Track ${track.id} loading timed out - continuing`)
        loadTrackSequentially(index + 1)
      }, 5000) // 5 second timeout per track

      audioRefs.current[track.id] = audio
    }

    // Start loading the first track
    if (soundscape.tracks.length > 0) {
      loadTrackSequentially(0)
    } else {
      // No tracks to load
      setIsLoaded(true)
      if (onLoad) onLoad()
    }

    // Clean up on unmount with improved error handling
    return () => {
      try {
        // Clear all timeouts
        if (loadingTimeoutRef.current) {
          clearTimeout(loadingTimeoutRef.current)
          loadingTimeoutRef.current = null
        }

        // Clean up all track timeouts that might be pending
        const trackTimeouts = document.querySelectorAll('[data-track-timeout]');
        trackTimeouts.forEach(element => {
          const timeoutId = parseInt(element.getAttribute('data-timeout-id') || '0');
          if (timeoutId) clearTimeout(timeoutId);
        });

        // Properly dispose of audio elements
        Object.values(audioRefs.current).forEach(audio => {
          if (audio) {
            try {
              // Remove all event listeners
              audio.oncanplaythrough = null
              audio.onerror = null
              audio.onended = null
              audio.onpause = null
              audio.onplay = null

              // Stop and unload
              audio.pause()
              audio.src = ''
              audio.load() // Force unload resources
            } catch (err) {
              console.warn('Error cleaning up audio element during unmount:', err)
            }
          }
        })

        // Clear references
        audioRefs.current = {}
      } catch (error) {
        console.error('Error during cleanup:', error)
      }
    }
  }, [soundscape, onLoad])

  // Handle play/pause with improved error handling and performance optimizations
  useEffect(() => {
    // Store timeouts so we can clear them if needed
    const timeouts: NodeJS.Timeout[] = []

    if (isPlaying) {
      // Limit the number of tracks playing simultaneously to prevent performance issues
      const maxSimultaneousTracks = 3

      // Get tracks sorted by importance (volume)
      const sortedTracks = [...soundscape.tracks].sort((a, b) => b.volume - a.volume)
      const tracksToPlay = sortedTracks.slice(0, maxSimultaneousTracks)

      // Start playing tracks one by one with small delay to prevent audio overload
      tracksToPlay.forEach((track, index) => {
        const audio = audioRefs.current[track.id]
        if (!audio) return

        const timeout = setTimeout(() => {
          try {
            // Set the volume based on the master volume and track volume
            // Increase the base volume to ensure it's audible
            const calculatedVolume = volume * track.volume * soundscape.baseVolume * 1.5 // Boost volume by 50%

            // Ensure minimum volume is audible if not muted
            const finalVolume = volume > 0 ? Math.max(calculatedVolume, 0.3) : 0 // Higher minimum volume

            // Apply volume with logging for debugging
            audio.volume = finalVolume
            console.log(`Setting volume for track ${track.id}: ${finalVolume.toFixed(2)} (base: ${volume.toFixed(2)}, track: ${track.volume.toFixed(2)}, soundscape: ${soundscape.baseVolume.toFixed(2)})`)

            // Play the audio with better error handling for autoplay restrictions
            const playPromise = audio.play();

            // Handle autoplay restrictions
            if (playPromise !== undefined) {
              playPromise.catch(error => {
                console.error(`Error playing audio track ${track.id}:`, error)
                // Don't keep trying to play if there's an error
                audio.pause()
              })
            }
          } catch (err) {
            console.error(`Unexpected error playing track ${track.id}:`, err)
          }
        }, index * 150) // Stagger track starts by 150ms each for better performance

        timeouts.push(timeout)
      })
    } else {
      // Pause all tracks
      Object.values(audioRefs.current).forEach(audio => {
        if (audio) {
          try {
            audio.pause()
          } catch (err) {
            console.error('Error pausing audio:', err)
          }
        }
      })
    }

    // Clean up timeouts on effect cleanup
    return () => {
      timeouts.forEach(timeout => clearTimeout(timeout))
    }
  }, [isPlaying, volume, soundscape])

  // Handle volume changes with error handling
  useEffect(() => {
    if (!isPlaying) return

    // Update volume for all tracks
    Object.entries(audioRefs.current).forEach(([trackId, audio]) => {
      if (!audio) return

      try {
        // Find the track configuration
        const track = soundscape.tracks.find(t => t.id === trackId)
        if (!track) return

        // Set the volume based on the master volume and track volume
        // Increase the base volume to ensure it's audible
        const calculatedVolume = volume * track.volume * soundscape.baseVolume * 1.5 // Boost volume by 50%

        // Ensure minimum volume is audible if not muted
        const finalVolume = volume > 0 ? Math.max(calculatedVolume, 0.3) : 0 // Higher minimum volume

        // Apply volume with logging for debugging
        audio.volume = finalVolume
        console.log(`Volume change - track ${track.id}: ${finalVolume.toFixed(2)}`)
      } catch (err) {
        console.error(`Error adjusting volume for track ${trackId}:`, err)
      }
    })
  }, [volume, isPlaying, soundscape])

  // No visible UI - this is just a controller component
  return null
}
