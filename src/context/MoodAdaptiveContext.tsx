'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useSession } from 'next-auth/react'

// Mood types
export type MoodLevel = 1 | 2 | 3 | 4 | 5
export type MoodCategory = 'happy' | 'calm' | 'energetic' | 'sad' | 'anxious' | 'angry'

// Mood entry interface
export interface MoodEntry {
  id: string
  userId: string
  level: MoodLevel
  category: MoodCategory
  factors: string[]
  notes?: string
  createdAt: Date
}

// Mood theme interface
export interface MoodTheme {
  primary: string
  secondary: string
  accent: string
  background: string
  gradientStart: string
  gradientEnd: string
  intensity: number // 0-100
}

// Context interface
interface MoodAdaptiveContextType {
  currentMood: MoodEntry | null
  moodTheme: MoodTheme
  isLoading: boolean
  refreshMood: () => Promise<void>
}

// Default theme (neutral)
const defaultTheme: MoodTheme = {
  primary: 'var(--color-primary)',
  secondary: 'var(--color-secondary)',
  accent: 'var(--color-accent)',
  background: 'var(--color-background)',
  gradientStart: '#F5EDFF',
  gradientEnd: '#EAE6F8',
  intensity: 50,
}

// Create context
const MoodAdaptiveContext = createContext<MoodAdaptiveContextType>({
  currentMood: null,
  moodTheme: defaultTheme,
  isLoading: true,
  refreshMood: async () => {},
})

// Hook to use the context
export const useMoodAdaptive = () => useContext(MoodAdaptiveContext)

// Provider component
export function MoodAdaptiveProvider({ children }: { children: ReactNode }) {
  const { data: session } = useSession()
  const [currentMood, setCurrentMood] = useState<MoodEntry | null>(null)
  const [moodTheme, setMoodTheme] = useState<MoodTheme>(defaultTheme)
  const [isLoading, setIsLoading] = useState(true)

  // Function to get the latest mood entry
  const fetchLatestMood = async () => {
    // Always set a default theme first to ensure the UI works
    setMoodTheme(defaultTheme)

    if (!session?.user) {
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)

      // Create a mock mood for development if the API fails
      // This ensures the UI can still function even if the database connection fails
      const mockMood = {
        id: 'mock-mood',
        userId: session.user.id || 'mock-user',
        level: 3 as MoodLevel,
        category: 'calm' as MoodCategory,
        factors: ['development', 'testing'],
        notes: 'This is a mock mood for development',
        createdAt: new Date(),
        date: new Date()
      }

      try {
        const response = await fetch('/api/mood/latest')
        const data = await response.json()

        if (data.mood) {
          // Process the mood data (could be real or mock)
          const moodData = {
            ...data.mood,
            createdAt: new Date(data.mood.createdAt),
            date: new Date(data.mood.date)
          }

          setCurrentMood(moodData)

          // Generate theme based on mood
          const theme = generateMoodTheme(moodData)
          setMoodTheme(theme)
          setIsLoading(false)

          // Log if it's a mock mood
          if (data.error) {
            console.info('Using mock mood data due to API error:', data.error)
          }

          return
        }
      } catch (apiError) {
        console.error('API error fetching latest mood:', apiError)
        // Continue to fallback
      }

      // If we get here, either the API call failed or returned no mood
      // Use the mock mood for development
      console.info('Using mock mood for development')
      setCurrentMood(mockMood)
      const theme = generateMoodTheme(mockMood)
      setMoodTheme(theme)
    } catch (error) {
      console.error('Error in mood fetching process:', error)
      // Keep the default theme that was set at the beginning
    } finally {
      setIsLoading(false)
    }
  }

  // Generate theme based on mood
  const generateMoodTheme = (mood: MoodEntry): MoodTheme => {
    // Base theme properties
    let theme: MoodTheme = { ...defaultTheme }

    // Intensity based on recency (full intensity if within last 6 hours)
    const hoursSinceEntry = (Date.now() - new Date(mood.createdAt).getTime()) / (1000 * 60 * 60)
    const intensityFactor = Math.max(0, Math.min(1, 1 - (hoursSinceEntry / 24)))
    theme.intensity = Math.round(intensityFactor * 100)

    // Adjust theme based on mood category
    switch (mood.category) {
      case 'happy':
        theme.primary = '#10B981' // Emerald
        theme.secondary = '#C2FFD8' // Light green
        theme.accent = '#FFF2B6' // Light yellow
        theme.gradientStart = '#ECFDF5' // Light mint
        theme.gradientEnd = '#D1FAE5' // Pale mint
        break

      case 'calm':
        theme.primary = '#3B82F6' // Blue
        theme.secondary = '#B6E3F9' // Light blue
        theme.accent = '#DDD6FE' // Lavender
        theme.gradientStart = '#EFF6FF' // Light blue
        theme.gradientEnd = '#DBEAFE' // Pale blue
        break

      case 'energetic':
        theme.primary = '#F59E0B' // Amber
        theme.secondary = '#FDE68A' // Light yellow
        theme.accent = '#FCA5A5' // Light red
        theme.gradientStart = '#FFFBEB' // Light amber
        theme.gradientEnd = '#FEF3C7' // Pale amber
        break

      case 'sad':
        theme.primary = '#6B7280' // Gray
        theme.secondary = '#E5E7EB' // Light gray
        theme.accent = '#B6E3F9' // Light blue
        theme.gradientStart = '#F9FAFB' // Light gray
        theme.gradientEnd = '#F3F4F6' // Pale gray
        break

      case 'anxious':
        theme.primary = '#8B5CF6' // Purple
        theme.secondary = '#DDD6FE' // Light purple
        theme.accent = '#FDE68A' // Light yellow
        theme.gradientStart = '#F5F3FF' // Light purple
        theme.gradientEnd = '#EDE9FE' // Pale purple
        break

      case 'angry':
        theme.primary = '#EF4444' // Red
        theme.secondary = '#FCA5A5' // Light red
        theme.accent = '#FDE68A' // Light yellow
        theme.gradientStart = '#FEF2F2' // Light red
        theme.gradientEnd = '#FEE2E2' // Pale red
        break
    }

    // Adjust intensity based on mood level (1-5)
    const levelFactor = mood.level / 5

    // Blend with default theme based on intensity
    if (theme.intensity < 100) {
      const blendFactor = theme.intensity / 100
      theme.primary = blendColors(defaultTheme.primary, theme.primary, blendFactor * levelFactor)
      theme.secondary = blendColors(defaultTheme.secondary, theme.secondary, blendFactor * levelFactor)
      theme.accent = blendColors(defaultTheme.accent, theme.accent, blendFactor * levelFactor)
      theme.gradientStart = blendColors(defaultTheme.gradientStart, theme.gradientStart, blendFactor * levelFactor)
      theme.gradientEnd = blendColors(defaultTheme.gradientEnd, theme.gradientEnd, blendFactor * levelFactor)
    }

    return theme
  }

  // Helper function to blend colors
  const blendColors = (color1: string, color2: string, ratio: number): string => {
    // Convert hex to RGB
    const parseColor = (color: string) => {
      if (color.startsWith('var(')) return color // Skip CSS variables

      const hex = color.startsWith('#') ? color.substring(1) : color
      return {
        r: parseInt(hex.substring(0, 2), 16),
        g: parseInt(hex.substring(2, 4), 16),
        b: parseInt(hex.substring(4, 6), 16)
      }
    }

    // If either color is a CSS variable, return color2
    if (color1.startsWith('var(') || color2.startsWith('var(')) {
      return ratio > 0.5 ? color2 : color1
    }

    const c1 = parseColor(color1)
    const c2 = parseColor(color2)

    // Blend the colors
    const r = Math.round(c1.r * (1 - ratio) + c2.r * ratio)
    const g = Math.round(c1.g * (1 - ratio) + c2.g * ratio)
    const b = Math.round(c1.b * (1 - ratio) + c2.b * ratio)

    // Convert back to hex
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
  }

  // Fetch mood on initial load
  useEffect(() => {
    if (session?.user) {
      fetchLatestMood()
    } else {
      setIsLoading(false)
    }
  }, [session])

  return (
    <MoodAdaptiveContext.Provider
      value={{
        currentMood,
        moodTheme,
        isLoading,
        refreshMood: fetchLatestMood,
      }}
    >
      {children}
    </MoodAdaptiveContext.Provider>
  )
}
