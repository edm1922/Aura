'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useTheme } from '@/context/ThemeContext'
import { useNotification } from '@/context/NotificationContext'
import {
  FaceSmileIcon,
  FaceFrownIcon,
  PencilIcon,
  CalendarIcon,
  ChartBarIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline'
import MoodEntryForm from './MoodEntryForm'
import MoodCalendar from './MoodCalendar'
import MoodInsights from './MoodInsights'

// Mood types
export type MoodLevel = 1 | 2 | 3 | 4 | 5
export type MoodCategory = 'happy' | 'calm' | 'sad' | 'anxious' | 'angry' | 'energetic'

export interface MoodEntry {
  id: string
  date: string // ISO date string
  level: MoodLevel
  category: MoodCategory
  notes: string
  factors: string[]
}

interface MoodTrackerProps {
  userId: string
  traits?: Record<string, number>
  className?: string
}

export default function MoodTracker({
  userId,
  traits,
  className = '',
}: MoodTrackerProps) {
  const { theme } = useTheme()
  const { showNotification } = useNotification()
  const [moodEntries, setMoodEntries] = useState<MoodEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeView, setActiveView] = useState<'form' | 'calendar' | 'insights'>('form')
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Fetch mood entries with timeout and error handling
  const fetchMoodEntries = async () => {
    try {
      setIsRefreshing(true)

      // Create a timeout promise to prevent hanging requests
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Mood entries request timeout')), 5000)
      })

      // Fetch with timeout
      const fetchPromise = fetch('/api/mood')
      const response = await Promise.race([fetchPromise, timeoutPromise]) as Response

      if (response.ok) {
        const data = await response.json()
        setMoodEntries(data.entries || [])
      } else {
        console.error('Failed to fetch mood entries:', response.status, response.statusText)

        // Use mock data in development for better UX
        if (process.env.NODE_ENV === 'development') {
          console.info('Using mock mood entries as fallback')
          setMoodEntries([
            {
              id: 'mock-1',
              date: new Date().toISOString(),
              level: 3 as MoodLevel,
              category: 'calm' as MoodCategory,
              notes: 'Mock mood entry for development',
              factors: ['development', 'testing']
            }
          ])
        }
      }
    } catch (error) {
      console.error('Error fetching mood entries:', error)
      // Don't block the UI - use empty array as fallback
      setMoodEntries([])
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  // Load mood entries on component mount with a slight delay to prevent
  // too many simultaneous API calls when the dashboard loads
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchMoodEntries()
    }, 300)

    return () => clearTimeout(timer)
  }, [])

  // Handle mood entry submission with timeout and error handling
  const handleMoodSubmit = async (entry: Omit<MoodEntry, 'id'>) => {
    try {
      // Create a timeout promise to prevent hanging requests
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Mood submission timeout')), 5000)
      })

      // Fetch with timeout
      const fetchPromise = fetch('/api/mood', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(entry),
      })

      const response = await Promise.race([fetchPromise, timeoutPromise]) as Response

      if (response.ok) {
        const data = await response.json()

        // Generate a temporary ID if the server didn't return one
        const newEntry = data.entry || {
          ...entry,
          id: `temp-${Date.now()}`,
          date: entry.date || new Date().toISOString()
        }

        setMoodEntries(prev => [newEntry, ...prev])
        showNotification('success', 'Mood entry saved successfully')
      } else {
        console.error('Failed to save mood entry:', response.status, response.statusText)

        // In development, still update the UI optimistically
        if (process.env.NODE_ENV === 'development') {
          const tempEntry = {
            ...entry,
            id: `temp-${Date.now()}`,
            date: entry.date || new Date().toISOString()
          }
          setMoodEntries(prev => [tempEntry, ...prev])
          showNotification('info', 'Using temporary mood entry (API error)')
        } else {
          showNotification('error', 'Failed to save mood entry')
        }
      }
    } catch (error) {
      console.error('Error saving mood entry:', error)
      showNotification('error', 'An error occurred while saving your mood entry')
    }
  }

  // Get today's entry if it exists
  const todayEntry = moodEntries.find(entry => {
    const entryDate = new Date(entry.date).toDateString()
    const today = new Date().toDateString()
    return entryDate === today
  })

  // Render active view
  const renderActiveView = () => {
    switch (activeView) {
      case 'form':
        return (
          <MoodEntryForm
            onSubmit={handleMoodSubmit}
            existingEntry={todayEntry}
            traits={traits}
          />
        )
      case 'calendar':
        return (
          <MoodCalendar
            entries={moodEntries}
          />
        )
      case 'insights':
        return (
          <MoodInsights
            entries={moodEntries}
            traits={traits}
          />
        )
      default:
        return null
    }
  }

  return (
    <div
      className={`glass rounded-xl overflow-hidden ${className}`}
    >
      {/* Header */}
      <div className="p-6 relative">
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

        <div className="flex justify-between items-center">
          <h3 className="text-xl font-serif font-medium text-primary-dark flex items-center">
            <span className="mr-2">✨</span> Mood Tracker
          </h3>

          <motion.button
            onClick={fetchMoodEntries}
            disabled={isRefreshing}
            className="text-primary/70 hover:text-primary disabled:opacity-50 p-1 rounded-full"
            aria-label="Refresh mood entries"
            whileHover={{ scale: 1.1, rotate: 10 }}
            whileTap={{ scale: 0.9, rotate: 0 }}
          >
            <ArrowPathIcon className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`} />
          </motion.button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex mt-6 border-b border-white/20">
          <motion.button
            onClick={() => setActiveView('form')}
            className={`flex items-center px-4 py-2 text-sm font-medium rounded-t-lg ${
              activeView === 'form'
                ? 'text-primary border-b-2 border-primary bg-white/30'
                : 'text-gray-500 hover:text-primary hover:bg-white/10'
            }`}
            whileHover={{ y: -2 }}
            whileTap={{ y: 0 }}
          >
            <PencilIcon className="h-4 w-4 mr-2" />
            Log Mood
          </motion.button>

          <motion.button
            onClick={() => setActiveView('calendar')}
            className={`flex items-center px-4 py-2 text-sm font-medium rounded-t-lg ${
              activeView === 'calendar'
                ? 'text-primary border-b-2 border-primary bg-white/30'
                : 'text-gray-500 hover:text-primary hover:bg-white/10'
            }`}
            whileHover={{ y: -2 }}
            whileTap={{ y: 0 }}
          >
            <CalendarIcon className="h-4 w-4 mr-2" />
            History
          </motion.button>

          <motion.button
            onClick={() => setActiveView('insights')}
            className={`flex items-center px-4 py-2 text-sm font-medium rounded-t-lg ${
              activeView === 'insights'
                ? 'text-primary border-b-2 border-primary bg-white/30'
                : 'text-gray-500 hover:text-primary hover:bg-white/10'
            }`}
            whileHover={{ y: -2 }}
            whileTap={{ y: 0 }}
          >
            <ChartBarIcon className="h-4 w-4 mr-2" />
            Insights
          </motion.button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <motion.div
              className="w-12 h-12 rounded-full border-4 border-primary/30 border-t-primary"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
          </div>
        ) : (
          renderActiveView()
        )}
      </div>

      {/* Footer */}
      <div className="px-6 py-4 bg-white/20 backdrop-blur-sm text-sm text-center text-primary-dark/70 italic">
        Track your mood over time to discover patterns and insights about yourself.
      </div>
    </div>
  )
}
