'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Soundscape, generateSoundscape, themedSoundscapes } from '@/lib/soundscapes'
import AudioPlayer from './AudioPlayer'
import { useTheme } from '@/context/ThemeContext'
import { unlockAudio, playTestSound, checkAudioSupport } from '@/lib/audio-utils'
import {
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
  PlayIcon,
  PauseIcon,
  InformationCircleIcon,
  ChevronDownIcon,
  MusicalNoteIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline'

interface SoundscapePlayerProps {
  traits?: Record<string, number>
  className?: string
}

export default function SoundscapePlayer({
  traits,
  className = '',
}: SoundscapePlayerProps) {
  const { theme } = useTheme()
  const [soundscape, setSoundscape] = useState<Soundscape | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  // Start with maximum volume for better audibility
  const [volume, setVolume] = useState(1.0)
  const [isMuted, setIsMuted] = useState(false)
  const [previousVolume, setPreviousVolume] = useState(1.0)
  const [isLoaded, setIsLoaded] = useState(false)
  const [showInfo, setShowInfo] = useState(false)
  const [showThemeSelector, setShowThemeSelector] = useState(false)
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null)
  const [isPersonalityBased, setIsPersonalityBased] = useState(true)
  const [userInteracted, setUserInteracted] = useState(false)

  // Generate soundscape based on traits or selected theme with error handling
  useEffect(() => {
    try {
      if (selectedTheme && !isPersonalityBased) {
        // Use selected themed soundscape
        if (themedSoundscapes[selectedTheme]) {
          setSoundscape(themedSoundscapes[selectedTheme])
          setIsLoaded(false)
        } else {
          // Fallback to first available theme if selected theme doesn't exist
          const firstTheme = Object.keys(themedSoundscapes)[0]
          if (firstTheme) {
            console.warn(`Selected theme "${selectedTheme}" not found, using "${firstTheme}" instead`)
            setSoundscape(themedSoundscapes[firstTheme])
            setSelectedTheme(firstTheme)
            setIsLoaded(false)
          }
        }
      } else if (traits) {
        // Use personality-based soundscape
        const newSoundscape = generateSoundscape(traits)
        setSoundscape(newSoundscape)
        setIsLoaded(false)
      }
    } catch (error) {
      console.error('Error generating soundscape:', error)

      // Use a simple fallback soundscape to prevent the component from breaking
      const fallbackSoundscape: Soundscape = {
        id: 'fallback-soundscape',
        name: 'Gentle Ambience',
        description: 'A simple ambient soundscape.',
        primaryTrait: 'balanced',
        baseVolume: 0.5,
        tracks: []
      }

      setSoundscape(fallbackSoundscape)
      setIsLoaded(true) // Skip loading since there are no tracks
    }
  }, [traits, selectedTheme, isPersonalityBased])

  // Handle theme selection
  const selectTheme = (themeId: string) => {
    setSelectedTheme(themeId)
    setIsPersonalityBased(false)
    setShowThemeSelector(false)
    // Stop current playback when changing themes
    setIsPlaying(false)
  }

  // Switch to personality-based soundscape
  const switchToPersonalityBased = () => {
    setIsPersonalityBased(true)
    setShowThemeSelector(false)
    // Stop current playback when changing themes
    setIsPlaying(false)
  }

  // Handle mute toggle
  const toggleMute = () => {
    setUserInteracted(true)
    if (isMuted) {
      setVolume(previousVolume)
      setIsMuted(false)
    } else {
      setPreviousVolume(volume)
      setVolume(0)
      setIsMuted(true)
    }
  }

  // Handle play/pause toggle with error handling and audio context initialization
  const togglePlay = () => {
    try {
      setUserInteracted(true)

      // Initialize audio context if needed (for browsers that require user interaction)
      if (!isPlaying) {
        // Unlock audio using our utility function
        unlockAudio()

        // Create and immediately use an AudioContext to unlock audio on iOS/Safari
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()

        // Create a silent oscillator and connect it
        const oscillator = audioContext.createOscillator()
        const gainNode = audioContext.createGain()
        gainNode.gain.value = 0 // Silent
        oscillator.connect(gainNode)
        gainNode.connect(audioContext.destination)

        // Play for a very short time to unlock audio
        oscillator.start(0)
        oscillator.stop(0.001)

        console.log('Audio context initialized to unlock audio playback')

        // Play a test sound to ensure audio is working
        playTestSound(0.1)

        // Try to resume the audio context if it's suspended
        if (audioContext.state === 'suspended') {
          audioContext.resume().then(() => {
            console.log('AudioContext resumed successfully')
          }).catch(err => {
            console.error('Failed to resume AudioContext:', err)
          })
        }
      }

      // Add a small delay to prevent UI freezing when toggling play state
      setTimeout(() => {
        setIsPlaying(prevState => !prevState)

        // Log the state change for debugging
        console.log(`Audio playback ${!isPlaying ? 'started' : 'stopped'}`)
      }, 100) // Increased delay to ensure audio context is ready
    } catch (error) {
      console.error('Error toggling play state:', error)
      // Ensure we don't get stuck in a bad state
      setIsPlaying(false)
    }
  }

  // Handle volume change
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserInteracted(true)
    const newVolume = parseFloat(e.target.value)
    setVolume(newVolume)
    if (newVolume > 0 && isMuted) {
      setIsMuted(false)
    } else if (newVolume === 0 && !isMuted) {
      setIsMuted(true)
    }
  }

  // Handle audio loaded with safety timeout
  const handleAudioLoaded = () => {
    try {
      setIsLoaded(true)
    } catch (error) {
      console.error('Error setting loaded state:', error)
    }
  }

  // Safety mechanism to ensure loading state doesn't get stuck
  useEffect(() => {
    const safetyTimeout = setTimeout(() => {
      if (!isLoaded) {
        console.log('Safety timeout: forcing loaded state')
        setIsLoaded(true)
      }
    }, 10000) // 10 second safety timeout

    return () => clearTimeout(safetyTimeout)
  }, [])

  // Check audio support and try to unlock audio on component mount
  useEffect(() => {
    // Check if audio is supported
    const { supported, issues } = checkAudioSupport()

    if (!supported) {
      console.error('Audio not supported in this browser:', issues.join(', '))
    } else if (issues.length > 0) {
      console.warn('Audio support issues detected:', issues.join(', '))

      // Try to unlock audio
      unlockAudio()
    }

    // Add a click event listener to the document to unlock audio on first user interaction
    const handleFirstInteraction = () => {
      unlockAudio()
      document.removeEventListener('click', handleFirstInteraction)
    }

    document.addEventListener('click', handleFirstInteraction)

    return () => {
      document.removeEventListener('click', handleFirstInteraction)
    }
  }, [])

  // If no traits or soundscape, don't render
  if (!traits || !soundscape) {
    return null
  }

  return (
    <div
      className={`glass rounded-xl overflow-hidden ${className}`}
    >
      <div className="p-5 relative">
        {/* Background gradient effect */}
        <div
          className="absolute inset-0 opacity-10 -z-10"
          style={{
            background: `radial-gradient(circle at top right,
              ${theme.primary}40 0%,
              ${theme.accent}30 50%,
              transparent 100%)`,
          }}
        />

        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-serif font-medium text-primary-dark flex items-center">
            <MusicalNoteIcon className="h-5 w-5 mr-2 text-primary" />
            <span>Ambient Soundscape</span>
          </h3>

          <div className="flex items-center space-x-2">
            <motion.button
              onClick={() => setShowInfo(!showInfo)}
              className="text-primary/70 hover:text-primary p-1 rounded-full"
              aria-label="Show information"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <InformationCircleIcon className="h-5 w-5" />
            </motion.button>

            <motion.button
              onClick={() => setShowThemeSelector(!showThemeSelector)}
              className="text-primary/70 hover:text-primary p-1 rounded-full flex items-center"
              aria-label="Select theme"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <ChevronDownIcon className="h-5 w-5" />
            </motion.button>
          </div>
        </div>

        {/* Theme selector dropdown */}
        <AnimatePresence>
          {showThemeSelector && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -10 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="mb-4 bg-white/50 backdrop-blur-sm p-3 rounded-lg border border-white/20 shadow-lg"
            >
              <div className="text-sm font-medium text-primary-dark mb-2">Select Soundscape Theme:</div>
              <div className="grid grid-cols-2 gap-2 mb-3">
                {Object.entries(themedSoundscapes).map(([id, themeData]) => (
                  <motion.button
                    key={id}
                    onClick={() => selectTheme(id)}
                    className={`text-left text-sm p-2 rounded-md ${
                      selectedTheme === id && !isPersonalityBased
                        ? 'bg-primary/20 text-primary ring-1 ring-primary/30'
                        : 'hover:bg-white/50 text-text-light'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {themeData.name}
                  </motion.button>
                ))}
              </div>
              <motion.button
                onClick={switchToPersonalityBased}
                className={`w-full text-left text-sm p-2 rounded-md flex items-center ${
                  isPersonalityBased
                    ? 'bg-primary/20 text-primary ring-1 ring-primary/30'
                    : 'hover:bg-white/50 text-text-light'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <ArrowPathIcon className="h-4 w-4 mr-2" />
                Personality-Based (Default)
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Soundscape info */}
        <AnimatePresence>
          {showInfo && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mb-4 text-sm text-text-light bg-white/30 backdrop-blur-sm p-4 rounded-lg border border-white/20"
            >
              <p className="mb-2 font-medium text-primary-dark">{soundscape.name}</p>
              <p>{soundscape.description}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Player controls */}
        <div className="flex items-center space-x-4 mb-4">
          <motion.button
            onClick={() => {
              // Play a test sound first to ensure audio is working
              if (!isPlaying) {
                // Play a test sound at higher volume to ensure it's audible
                playTestSound(0.5)
                // Small delay before starting the actual soundscape
                setTimeout(() => {
                  togglePlay()
                }, 300) // Longer delay to ensure test sound is heard
              } else {
                togglePlay()
              }
            }}
            disabled={false} /* Always enable the play button */
            className={`flex items-center justify-center w-12 h-12 rounded-full shadow-md ${
              isLoaded || !userInteracted
                ? 'bg-primary text-white hover:bg-primary-dark'
                : 'bg-primary/70 text-white'
            }`}
            aria-label={isPlaying ? 'Pause' : 'Play'}
            whileHover={{ scale: 1.05, boxShadow: '0 0 15px rgba(139, 92, 246, 0.5)' }}
            whileTap={{ scale: 0.95 }}
            animate={isPlaying ? {
              boxShadow: '0 0 10px rgba(139, 92, 246, 0.4)'
            } : {}}
            // Simplified animation to reduce performance impact
            transition={{ duration: 0.3 }}
          >
            {isPlaying ? (
              <PauseIcon className="h-6 w-6" />
            ) : (
              <PlayIcon className="h-6 w-6" />
            )}
          </motion.button>

          <motion.button
            onClick={toggleMute}
            className="text-primary/70 hover:text-primary"
            aria-label={isMuted ? 'Unmute' : 'Mute'}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            {isMuted ? (
              <SpeakerXMarkIcon className="h-5 w-5" />
            ) : (
              <SpeakerWaveIcon className="h-5 w-5" />
            )}
          </motion.button>

          <div className="flex-1">
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={handleVolumeChange}
              className="w-full h-2 bg-white/30 rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, ${theme.primary} 0%, ${theme.primary} ${volume * 100}%, rgba(255, 255, 255, 0.3) ${volume * 100}%, rgba(255, 255, 255, 0.3) 100%)`,
              }}
            />
          </div>
        </div>

        {/* Loading indicator */}
        {!isLoaded && (
          <div className="flex justify-center items-center py-3">
            <motion.div
              className="w-8 h-8 rounded-full border-2 border-primary/30 border-t-primary"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
            <span className="ml-3 text-sm text-primary-dark">Loading sounds...</span>
          </div>
        )}

        {/* Audio player (no UI) */}
        <AudioPlayer
          soundscape={soundscape}
          isPlaying={isPlaying && userInteracted}
          volume={volume}
          onLoad={handleAudioLoaded}
        />

        {/* User interaction notice */}
        {!userInteracted && (
          <div className="text-sm text-center text-primary-dark font-medium mt-3 mb-2 p-2 bg-primary/10 rounded-lg animate-pulse">
            Click the play button to enable audio playback
          </div>
        )}

        {/* Audio is now working correctly */}

        {/* Footer text */}
        <div className="mt-3 text-xs text-center text-text-light/80 italic">
          {isPersonalityBased ? (
            "This ambient soundscape is personalized based on your personality traits."
          ) : (
            `Currently playing: ${soundscape.name}`
          )}
        </div>
      </div>
    </div>
  )
}
