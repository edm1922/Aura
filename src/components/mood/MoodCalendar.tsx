'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useTheme } from '@/context/ThemeContext'
import { MoodEntry } from './MoodTracker'
import { 
  ChevronLeftIcon, 
  ChevronRightIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline'

interface MoodCalendarProps {
  entries: MoodEntry[]
}

// Mood level to color mapping
const moodLevelColors = {
  1: '#EF4444', // Red
  2: '#F97316', // Orange
  3: '#F59E0B', // Amber
  4: '#3B82F6', // Blue
  5: '#10B981', // Emerald
}

// Mood category to emoji mapping
const moodCategoryEmojis = {
  happy: '😄',
  calm: '😌',
  energetic: '⚡',
  sad: '😔',
  anxious: '😰',
  angry: '😠',
}

export default function MoodCalendar({ entries }: MoodCalendarProps) {
  const { theme } = useTheme()
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedEntry, setSelectedEntry] = useState<MoodEntry | null>(null)
  
  // Get days in month
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate()
  }
  
  // Get day of week for first day of month (0 = Sunday, 6 = Saturday)
  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay()
  }
  
  // Navigate to previous month
  const goToPreviousMonth = () => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev)
      newMonth.setMonth(newMonth.getMonth() - 1)
      return newMonth
    })
    setSelectedEntry(null)
  }
  
  // Navigate to next month
  const goToNextMonth = () => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev)
      newMonth.setMonth(newMonth.getMonth() + 1)
      return newMonth
    })
    setSelectedEntry(null)
  }
  
  // Format date as YYYY-MM-DD
  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0]
  }
  
  // Get entry for a specific date
  const getEntryForDate = (date: Date) => {
    const dateString = formatDate(date)
    return entries.find(entry => entry.date.startsWith(dateString))
  }
  
  // Render calendar
  const renderCalendar = () => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const daysInMonth = getDaysInMonth(year, month)
    const firstDayOfMonth = getFirstDayOfMonth(year, month)
    const today = new Date()
    
    // Create array of day cells
    const dayCells = []
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      dayCells.push(
        <div key={`empty-${i}`} className="h-10 border border-gray-100"></div>
      )
    }
    
    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day)
      const entry = getEntryForDate(date)
      const isToday = today.getDate() === day && 
                      today.getMonth() === month && 
                      today.getFullYear() === year
      
      dayCells.push(
        <div 
          key={`day-${day}`}
          className={`h-10 border border-gray-100 relative ${
            isToday ? 'ring-2 ring-primary ring-inset' : ''
          } ${entry ? 'cursor-pointer hover:bg-gray-50' : ''}`}
          onClick={() => entry && setSelectedEntry(entry)}
        >
          <div className="absolute top-0 left-0 p-1 text-xs text-gray-500">
            {day}
          </div>
          
          {entry && (
            <div 
              className="absolute inset-0 flex items-center justify-center"
              style={{ backgroundColor: `${moodLevelColors[entry.level]}20` }}
            >
              <span className="text-lg" role="img" aria-label={entry.category}>
                {moodCategoryEmojis[entry.category]}
              </span>
            </div>
          )}
        </div>
      )
    }
    
    return dayCells
  }
  
  return (
    <div>
      {/* Calendar Header */}
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={goToPreviousMonth}
          className="p-1 rounded-full hover:bg-gray-100"
          aria-label="Previous month"
        >
          <ChevronLeftIcon className="h-5 w-5 text-gray-600" />
        </button>
        
        <h3 className="text-lg font-medium text-gray-900">
          {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </h3>
        
        <button
          onClick={goToNextMonth}
          className="p-1 rounded-full hover:bg-gray-100"
          aria-label="Next month"
        >
          <ChevronRightIcon className="h-5 w-5 text-gray-600" />
        </button>
      </div>
      
      {/* Calendar Grid */}
      <div className="mb-4">
        {/* Day Labels */}
        <div className="grid grid-cols-7 gap-0 mb-1">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="h-8 flex items-center justify-center text-xs font-medium text-gray-500">
              {day}
            </div>
          ))}
        </div>
        
        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-0">
          {renderCalendar()}
        </div>
      </div>
      
      {/* Legend */}
      <div className="flex flex-wrap gap-2 mb-4 text-xs text-gray-600">
        {Object.entries(moodLevelColors).map(([level, color]) => (
          <div key={level} className="flex items-center">
            <div 
              className="w-3 h-3 rounded-full mr-1"
              style={{ backgroundColor: color }}
            ></div>
            <span>
              {level === '1' ? 'Very Bad' : 
               level === '2' ? 'Bad' : 
               level === '3' ? 'Neutral' : 
               level === '4' ? 'Good' : 'Very Good'}
            </span>
          </div>
        ))}
      </div>
      
      {/* Selected Entry Details */}
      {selectedEntry && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-4 border border-gray-200 rounded-md bg-gray-50"
        >
          <div className="flex justify-between items-start mb-2">
            <h4 className="text-sm font-medium text-gray-900">
              {new Date(selectedEntry.date).toLocaleDateString('en-US', { 
                weekday: 'long',
                month: 'long', 
                day: 'numeric'
              })}
            </h4>
            
            <button
              onClick={() => setSelectedEntry(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>
          
          <div className="flex items-center mb-2">
            <span className="text-2xl mr-2">
              {moodCategoryEmojis[selectedEntry.category]}
            </span>
            <span className="text-sm text-gray-700 capitalize">
              {selectedEntry.category} • Level {selectedEntry.level}
            </span>
          </div>
          
          {selectedEntry.factors.length > 0 && (
            <div className="mb-2">
              <div className="text-xs text-gray-500 mb-1">Factors:</div>
              <div className="flex flex-wrap gap-1">
                {selectedEntry.factors.map(factor => (
                  <span 
                    key={factor}
                    className="px-2 py-0.5 bg-gray-200 rounded-full text-xs text-gray-700"
                  >
                    {factor}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {selectedEntry.notes && (
            <div>
              <div className="text-xs text-gray-500 mb-1">Notes:</div>
              <p className="text-sm text-gray-700">{selectedEntry.notes}</p>
            </div>
          )}
        </motion.div>
      )}
      
      {/* Empty State */}
      {entries.length === 0 && (
        <div className="flex flex-col items-center justify-center py-6 text-center">
          <InformationCircleIcon className="h-8 w-8 text-gray-400 mb-2" />
          <p className="text-gray-500 mb-1">No mood entries yet</p>
          <p className="text-sm text-gray-400">
            Start tracking your mood to see your entries here
          </p>
        </div>
      )}
    </div>
  )
}
