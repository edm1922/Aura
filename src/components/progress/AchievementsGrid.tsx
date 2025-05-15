'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useTheme } from '@/context/ThemeContext'
import { Achievement } from '@/lib/progressTracker'
import AchievementBadge from './AchievementBadge'

interface AchievementsGridProps {
  achievements: Achievement[]
  className?: string
}

// Achievement categories
const categories = [
  { id: 'all', label: 'All' },
  { id: 'tests', label: 'Tests' },
  { id: 'mood', label: 'Mood' },
  { id: 'insights', label: 'Insights' },
  { id: 'engagement', label: 'Engagement' },
  { id: 'growth', label: 'Growth' },
  { id: 'social', label: 'Social' },
]

export default function AchievementsGrid({
  achievements,
  className = '',
}: AchievementsGridProps) {
  const { theme } = useTheme()
  const [activeCategory, setActiveCategory] = useState('all')
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null)
  
  // Filter achievements by category
  const filteredAchievements = activeCategory === 'all'
    ? achievements
    : achievements.filter(a => a.category === activeCategory)
  
  // Count unlocked achievements by category
  const unlockedCounts = categories.reduce((acc, category) => {
    if (category.id === 'all') {
      acc[category.id] = achievements.filter(a => a.unlockedAt).length
    } else {
      acc[category.id] = achievements
        .filter(a => a.category === category.id && a.unlockedAt)
        .length
    }
    return acc
  }, {} as Record<string, number>)
  
  // Count total achievements by category
  const totalCounts = categories.reduce((acc, category) => {
    if (category.id === 'all') {
      acc[category.id] = achievements.length
    } else {
      acc[category.id] = achievements.filter(a => a.category === category.id).length
    }
    return acc
  }, {} as Record<string, number>)
  
  return (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">
          Achievements
        </h3>
        
        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2 mt-4">
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`px-3 py-1 text-sm rounded-full ${
                activeCategory === category.id
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category.label} ({unlockedCounts[category.id]}/{totalCounts[category.id]})
            </button>
          ))}
        </div>
      </div>
      
      {/* Achievements Grid */}
      <div className="p-4">
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
          {filteredAchievements.map(achievement => (
            <div 
              key={achievement.id}
              onClick={() => setSelectedAchievement(achievement)}
              className="cursor-pointer"
            >
              <AchievementBadge
                achievement={achievement}
                unlocked={!!achievement.unlockedAt}
                showDetails={true}
              />
            </div>
          ))}
        </div>
        
        {filteredAchievements.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No achievements in this category
          </div>
        )}
      </div>
      
      {/* Selected Achievement Modal */}
      {selectedAchievement && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4"
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Achievement Details
                </h3>
                
                <button
                  onClick={() => setSelectedAchievement(null)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  ×
                </button>
              </div>
              
              <div className="flex flex-col items-center mb-4">
                <AchievementBadge
                  achievement={selectedAchievement}
                  unlocked={!!selectedAchievement.unlockedAt}
                  size="lg"
                />
                
                <h4 className="mt-4 text-xl font-medium text-gray-900">
                  {selectedAchievement.title}
                </h4>
                
                <div className="mt-1 text-gray-500 text-center">
                  {selectedAchievement.description}
                </div>
              </div>
              
              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="flex justify-between text-sm">
                  <div className="text-gray-500">Category</div>
                  <div className="font-medium text-gray-900 capitalize">
                    {selectedAchievement.category}
                  </div>
                </div>
                
                {selectedAchievement.unlockedAt && (
                  <div className="flex justify-between text-sm mt-2">
                    <div className="text-gray-500">Unlocked</div>
                    <div className="font-medium text-gray-900">
                      {new Date(selectedAchievement.unlockedAt).toLocaleDateString()}
                    </div>
                  </div>
                )}
                
                {!selectedAchievement.unlockedAt && 
                 selectedAchievement.progress !== undefined && 
                 selectedAchievement.maxProgress && (
                  <div className="mt-4">
                    <div className="flex justify-between text-sm mb-1">
                      <div className="text-gray-500">Progress</div>
                      <div className="font-medium text-gray-900">
                        {selectedAchievement.progress}/{selectedAchievement.maxProgress}
                      </div>
                    </div>
                    
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full"
                        style={{ 
                          width: `${(selectedAchievement.progress / selectedAchievement.maxProgress) * 100}%`,
                          backgroundColor: theme.primary
                        }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="bg-gray-50 px-6 py-3 flex justify-end">
              <button
                onClick={() => setSelectedAchievement(null)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
