'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { useMoodAdaptive } from '@/context/MoodAdaptiveContext'

interface MoodAdaptiveElementProps {
  children: React.ReactNode
  className?: string
  type?: 'card' | 'button' | 'text' | 'border' | 'custom'
  intensity?: number // Override intensity (0-100)
  style?: React.CSSProperties
  animate?: boolean
}

export default function MoodAdaptiveElement({
  children,
  className = '',
  type = 'card',
  intensity: overrideIntensity,
  style = {},
  animate = true,
}: MoodAdaptiveElementProps) {
  const { moodTheme, currentMood } = useMoodAdaptive()

  // Use override intensity if provided, otherwise use theme intensity
  const intensity = overrideIntensity !== undefined ? overrideIntensity : moodTheme.intensity
  const intensityFactor = intensity / 100

  // Get mood-specific styles based on element type
  const getMoodStyles = () => {
    // Default styles (empty object)
    const defaultStyles = {}

    try {
      if (!currentMood) return defaultStyles

      // Default colors in case theme values are missing
      const defaultPrimary = '#8B5CF6' // Purple
      const defaultSecondary = '#DDD6FE' // Light purple
      const defaultAccent = '#FDE68A' // Light yellow

      // Handle CSS variables and missing values
      const primary = !moodTheme.primary ? defaultPrimary :
        moodTheme.primary.startsWith('var(') ? 'var(--color-primary)' : moodTheme.primary;

      const secondary = !moodTheme.secondary ? defaultSecondary :
        moodTheme.secondary.startsWith('var(') ? 'var(--color-secondary)' : moodTheme.secondary;

      const accent = !moodTheme.accent ? defaultAccent :
        moodTheme.accent.startsWith('var(') ? 'var(--color-accent)' : moodTheme.accent;

      switch (type) {
        case 'card':
          return {
            backgroundColor: `rgba(255, 255, 255, ${0.7 - intensityFactor * 0.2})`,
            borderColor: `${primary}${Math.round(intensityFactor * 30).toString(16).padStart(2, '0')}`,
            boxShadow: `0 4px 20px -5px ${primary}${Math.round(intensityFactor * 20).toString(16).padStart(2, '0')}`,
          }

        case 'button':
          return {
            backgroundColor: primary,
            color: '#FFFFFF',
            boxShadow: `0 2px 10px -2px ${primary}${Math.round(intensityFactor * 50).toString(16).padStart(2, '0')}`,
          }

        case 'text':
          return {
            color: primary,
          }

        case 'border':
          return {
            borderColor: `${primary}${Math.round(intensityFactor * 50).toString(16).padStart(2, '0')}`,
          }

        case 'custom':
          return {
            // For custom, just return the theme colors for use in custom styling
            '--mood-primary': primary,
            '--mood-secondary': secondary,
            '--mood-accent': accent,
            '--mood-intensity': intensityFactor.toString(),
          }

        default:
          return defaultStyles
      }
    } catch (error) {
      console.error('Error getting mood styles:', error)
      return defaultStyles
    }
  }

  // Get mood-specific animations
  const getMoodAnimations = () => {
    // Default animations (empty object)
    const defaultAnimations = {}

    try {
      if (!currentMood || !animate) return defaultAnimations

      // Make sure currentMood.category exists and is valid
      const category = currentMood.category || 'calm'

      switch (category) {
        case 'happy':
          return {
            y: [0, -3, 0],
            transition: {
              y: { repeat: Infinity, duration: 2, repeatType: "reverse" }
            }
          }

        case 'calm':
          return {
            opacity: [1, 0.9, 1],
            transition: {
              opacity: { repeat: Infinity, duration: 3, repeatType: "reverse" }
            }
          }

        case 'energetic':
          return {
            scale: [1, 1.02, 1],
            transition: {
              scale: { repeat: Infinity, duration: 1.5, repeatType: "reverse" }
            }
          }

        case 'sad':
          return {
            y: [0, 2, 0],
            transition: {
              y: { repeat: Infinity, duration: 4, repeatType: "reverse" }
            }
          }

        case 'anxious':
          return {
            x: [0, 1, -1, 0],
            transition: {
              x: { repeat: Infinity, duration: 2, repeatType: "reverse" }
            }
          }

        case 'angry':
          return {
            rotate: [0, 0.5, -0.5, 0],
            transition: {
              rotate: { repeat: Infinity, duration: 2, repeatType: "reverse" }
            }
          }

        default:
          return defaultAnimations
      }
    } catch (error) {
      console.error('Error getting mood animations:', error)
      return defaultAnimations
    }
  }

  const moodStyles = getMoodStyles()
  const moodAnimations = getMoodAnimations()

  // Combine custom styles with mood styles
  const combinedStyles = {
    ...moodStyles,
    ...style,
  }

  return (
    <motion.div
      className={className}
      style={combinedStyles}
      animate={moodAnimations}
      initial={false}
      transition={{ duration: 1 }}
    >
      {children}
    </motion.div>
  )
}
