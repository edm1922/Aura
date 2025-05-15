'use client'

import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useMoodAdaptive } from '@/context/MoodAdaptiveContext'

interface MoodAdaptiveBackgroundProps {
  children: React.ReactNode
  className?: string
  intensity?: number // Override intensity (0-100)
  animated?: boolean
}

export default function MoodAdaptiveBackground({
  children,
  className = '',
  intensity: overrideIntensity,
  animated = true,
}: MoodAdaptiveBackgroundProps) {
  const { moodTheme, currentMood } = useMoodAdaptive()
  const [prevTheme, setPrevTheme] = useState(moodTheme)

  // Use override intensity if provided, otherwise use theme intensity
  const intensity = overrideIntensity !== undefined ? overrideIntensity : moodTheme.intensity

  // Update previous theme when current theme changes (for transitions)
  useEffect(() => {
    // Small delay to ensure smooth transition
    const timer = setTimeout(() => {
      setPrevTheme(moodTheme)
    }, 500)

    return () => clearTimeout(timer)
  }, [moodTheme])

  // Get mood-specific particle colors
  const getParticleColors = () => {
    // Default colors if no mood data
    const defaultColors = ['rgba(139, 92, 246, 0.2)', 'rgba(194, 255, 216, 0.2)']

    try {
      if (!currentMood) return defaultColors

      switch (currentMood.category) {
        case 'happy':
          return ['rgba(16, 185, 129, 0.2)', 'rgba(194, 255, 216, 0.2)']
        case 'calm':
          return ['rgba(59, 130, 246, 0.2)', 'rgba(182, 227, 249, 0.2)']
        case 'energetic':
          return ['rgba(245, 158, 11, 0.2)', 'rgba(253, 230, 138, 0.2)']
        case 'sad':
          return ['rgba(107, 114, 128, 0.2)', 'rgba(229, 231, 235, 0.2)']
        case 'anxious':
          return ['rgba(139, 92, 246, 0.2)', 'rgba(221, 214, 254, 0.2)']
        case 'angry':
          return ['rgba(239, 68, 68, 0.2)', 'rgba(252, 165, 165, 0.2)']
        default:
          return defaultColors
      }
    } catch (error) {
      console.error('Error getting particle colors:', error)
      return defaultColors
    }
  }

  // Get mood-specific gradient
  const getGradient = () => {
    const intensityFactor = intensity / 100

    // Use CSS variables if the theme colors are CSS variables
    const gradientStart = moodTheme.gradientStart.startsWith('var(')
      ? 'var(--color-background)'
      : moodTheme.gradientStart;

    const gradientEnd = moodTheme.gradientEnd.startsWith('var(')
      ? 'var(--color-background-alt)'
      : moodTheme.gradientEnd;

    return {
      background: `linear-gradient(135deg,
        ${gradientStart} 0%,
        ${gradientEnd} 100%)`,
      opacity: intensityFactor * 0.4 + 0.1, // Min 0.1, max 0.5
    }
  }

  // Get mood-specific radial gradient
  const getRadialGradient = () => {
    const intensityFactor = intensity / 100

    // Use CSS variables if the theme colors are CSS variables
    const primary = moodTheme.primary.startsWith('var(')
      ? 'var(--color-primary)'
      : moodTheme.primary;

    const accent = moodTheme.accent.startsWith('var(')
      ? 'var(--color-accent)'
      : moodTheme.accent;

    return {
      background: `radial-gradient(circle at 70% 20%,
        ${primary}20 0%,
        ${accent}10 50%,
        transparent 70%)`,
      opacity: intensityFactor * 0.3 + 0.1, // Min 0.1, max 0.4
    }
  }

  // Get mood-specific pattern
  const getPattern = () => {
    // Default pattern (empty object with zero opacity)
    const defaultPattern = { opacity: 0 }

    try {
      if (!currentMood) return defaultPattern

      const intensityFactor = intensity / 100
      let patternOpacity = intensityFactor * 0.15

      // Make sure moodTheme.secondary exists and is valid
      const secondaryColor = moodTheme.secondary || 'rgba(200, 200, 200, 0.2)'

      switch (currentMood.category) {
        case 'happy':
          return {
            backgroundImage: `radial-gradient(${secondaryColor}40 1px, transparent 1px)`,
            backgroundSize: '20px 20px',
            opacity: patternOpacity,
          }
        case 'calm':
          return {
            backgroundImage: `linear-gradient(to right, ${secondaryColor}30 1px, transparent 1px)`,
            backgroundSize: '20px 20px',
            opacity: patternOpacity,
          }
        case 'energetic':
          return {
            backgroundImage: `radial-gradient(${secondaryColor}40 2px, transparent 2px)`,
            backgroundSize: '30px 30px',
            opacity: patternOpacity,
          }
        case 'sad':
          return {
            backgroundImage: `linear-gradient(to bottom, ${secondaryColor}20 1px, transparent 1px)`,
            backgroundSize: '20px 20px',
            opacity: patternOpacity * 0.7, // More subtle
          }
        case 'anxious':
          return {
            backgroundImage: `repeating-linear-gradient(45deg, ${secondaryColor}10, ${secondaryColor}10 5px, transparent 5px, transparent 25px)`,
            backgroundSize: '30px 30px',
            opacity: patternOpacity,
          }
        case 'angry':
          return {
            backgroundImage: `repeating-radial-gradient(${secondaryColor}20 0px, ${secondaryColor}20 3px, transparent 3px, transparent 15px)`,
            backgroundSize: '30px 30px',
            opacity: patternOpacity,
          }
        default:
          return defaultPattern
      }
    } catch (error) {
      console.error('Error getting pattern:', error)
      return defaultPattern
    }
  }

  const particleColors = getParticleColors()

  return (
    <div className={`relative ${className}`}>
      {/* Base gradient background */}
      <motion.div
        className="absolute inset-0 -z-20"
        initial={false}
        animate={getGradient()}
        transition={{ duration: 1.5 }}
      />

      {/* Radial gradient overlay */}
      <motion.div
        className="absolute inset-0 -z-10"
        initial={false}
        animate={getRadialGradient()}
        transition={{ duration: 1.5 }}
      />

      {/* Pattern overlay */}
      <motion.div
        className="absolute inset-0 -z-10"
        initial={false}
        animate={getPattern()}
        transition={{ duration: 1.5 }}
      />

      {/* Animated particles */}
      {animated && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full blur-xl"
              style={{
                backgroundColor: particleColors[i % particleColors.length],
                width: `${Math.random() * 100 + 50}px`,
                height: `${Math.random() * 100 + 50}px`,
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                opacity: intensity / 200, // Max 0.5
              }}
              animate={{
                x: [0, Math.random() * 40 - 20],
                y: [0, Math.random() * 40 - 20],
                opacity: [intensity / 200, intensity / 100, intensity / 200],
              }}
              transition={{
                duration: 5 + Math.random() * 5,
                repeat: Infinity,
                repeatType: "reverse",
              }}
            />
          ))}
        </div>
      )}

      {/* Content */}
      {children}
    </div>
  )
}
