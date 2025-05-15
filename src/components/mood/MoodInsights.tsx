'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useTheme } from '@/context/ThemeContext'
import { MoodEntry } from './MoodTracker'
import { InformationCircleIcon } from '@heroicons/react/24/outline'

interface MoodInsightsProps {
  entries: MoodEntry[]
  traits?: Record<string, number>
}

// Mood level to color mapping
const moodLevelColors = {
  1: '#EF4444', // Red
  2: '#F97316', // Orange
  3: '#F59E0B', // Amber
  4: '#3B82F6', // Blue
  5: '#10B981', // Emerald
}

export default function MoodInsights({ entries, traits }: MoodInsightsProps) {
  const { theme } = useTheme()
  const [insights, setInsights] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  
  // Generate insights based on mood entries and personality traits
  useEffect(() => {
    if (entries.length === 0) return
    
    generateInsights()
  }, [entries, traits])
  
  // Generate insights
  const generateInsights = () => {
    setIsLoading(true)
    
    try {
      const newInsights = []
      
      // Calculate average mood level
      const averageMoodLevel = entries.reduce((sum, entry) => sum + entry.level, 0) / entries.length
      newInsights.push(`Your average mood is ${averageMoodLevel.toFixed(1)} out of 5.`)
      
      // Find most common mood category
      const categoryCount: Record<string, number> = {}
      entries.forEach(entry => {
        categoryCount[entry.category] = (categoryCount[entry.category] || 0) + 1
      })
      
      const mostCommonCategory = Object.entries(categoryCount)
        .sort((a, b) => b[1] - a[1])[0][0]
      
      newInsights.push(`Your most common mood is "${mostCommonCategory}".`)
      
      // Find most common factors
      const factorCount: Record<string, number> = {}
      entries.forEach(entry => {
        entry.factors.forEach(factor => {
          factorCount[factor] = (factorCount[factor] || 0) + 1
        })
      })
      
      if (Object.keys(factorCount).length > 0) {
        const sortedFactors = Object.entries(factorCount)
          .sort((a, b) => b[1] - a[1])
        
        if (sortedFactors.length > 0) {
          const topFactor = sortedFactors[0][0]
          newInsights.push(`"${topFactor}" appears to be a significant factor in your mood.`)
        }
      }
      
      // Day of week analysis
      const dayMoods: Record<number, number[]> = {
        0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: []
      }
      
      entries.forEach(entry => {
        const date = new Date(entry.date)
        const day = date.getDay()
        dayMoods[day].push(entry.level)
      })
      
      const dayAverages = Object.entries(dayMoods)
        .map(([day, levels]) => {
          if (levels.length === 0) return [parseInt(day), 0]
          const avg = levels.reduce((sum, level) => sum + level, 0) / levels.length
          return [parseInt(day), avg]
        })
        .filter(([_, avg]) => avg > 0)
      
      if (dayAverages.length > 0) {
        // Find best and worst days
        const sortedDays = [...dayAverages].sort((a, b) => b[1] as number - (a[1] as number))
        
        if (sortedDays.length > 1) {
          const bestDay = sortedDays[0][0]
          const worstDay = sortedDays[sortedDays.length - 1][0]
          
          const dayNames = ['Sundays', 'Mondays', 'Tuesdays', 'Wednesdays', 'Thursdays', 'Fridays', 'Saturdays']
          
          if (bestDay !== worstDay) {
            newInsights.push(`You tend to feel best on ${dayNames[bestDay as number]} and less positive on ${dayNames[worstDay as number]}.`)
          }
        }
      }
      
      // Personality trait correlations (if traits are available)
      if (traits) {
        if (traits.extraversion && traits.extraversion > 3.5 && averageMoodLevel > 3.5) {
          newInsights.push('Your high extraversion may contribute to your generally positive mood.')
        }
        
        if (traits.neuroticism && traits.neuroticism > 3.5 && averageMoodLevel < 3) {
          newInsights.push('Your emotional sensitivity may be reflected in your mood patterns.')
        }
        
        if (traits.conscientiousness && traits.conscientiousness > 4) {
          const hasWorkFactor = entries.some(entry => entry.factors.includes('work'))
          if (hasWorkFactor) {
            newInsights.push('As someone high in conscientiousness, work-related factors appear to influence your mood.')
          }
        }
      }
      
      // Set insights
      setInsights(newInsights)
    } catch (error) {
      console.error('Error generating insights:', error)
    } finally {
      setIsLoading(false)
    }
  }
  
  // Render mood distribution chart
  const renderMoodDistribution = () => {
    // Count entries by mood level
    const levelCounts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    
    entries.forEach(entry => {
      levelCounts[entry.level] = (levelCounts[entry.level] || 0) + 1
    })
    
    // Find the maximum count for scaling
    const maxCount = Math.max(...Object.values(levelCounts))
    
    return (
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Mood Distribution</h4>
        
        <div className="flex items-end h-32 space-x-2">
          {Object.entries(levelCounts).map(([level, count]) => {
            const height = maxCount > 0 ? (count / maxCount) * 100 : 0
            
            return (
              <div key={level} className="flex flex-col items-center flex-1">
                <div className="text-xs text-gray-500 mb-1">{count}</div>
                <div 
                  className="w-full rounded-t-md transition-all duration-500"
                  style={{ 
                    height: `${height}%`, 
                    backgroundColor: moodLevelColors[level as unknown as keyof typeof moodLevelColors],
                    minHeight: count > 0 ? '4px' : '0'
                  }}
                ></div>
                <div className="text-xs text-gray-500 mt-1">{level}</div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }
  
  // If no entries, show empty state
  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-6 text-center">
        <InformationCircleIcon className="h-8 w-8 text-gray-400 mb-2" />
        <p className="text-gray-500 mb-1">No mood data to analyze</p>
        <p className="text-sm text-gray-400">
          Log your mood regularly to see patterns and insights
        </p>
      </div>
    )
  }
  
  return (
    <div>
      {/* Mood Distribution Chart */}
      {renderMoodDistribution()}
      
      {/* Insights */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-2">Insights</h4>
        
        {isLoading ? (
          <div className="flex justify-center items-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        ) : (
          <ul className="space-y-2">
            {insights.map((insight, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-3 bg-primary/5 rounded-md text-sm text-gray-700"
              >
                {insight}
              </motion.li>
            ))}
          </ul>
        )}
      </div>
      
      {/* Data Summary */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <div className="text-sm font-medium text-gray-500">Entries</div>
            <div className="text-xl font-semibold text-gray-900">{entries.length}</div>
          </div>
          
          <div>
            <div className="text-sm font-medium text-gray-500">Time Span</div>
            <div className="text-xl font-semibold text-gray-900">
              {entries.length > 1 ? 
                `${Math.round((new Date().getTime() - new Date(entries[entries.length - 1].date).getTime()) / (1000 * 60 * 60 * 24))} days` : 
                '1 day'}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
