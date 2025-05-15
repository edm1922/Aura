'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from '@/context/ThemeContext'
import {
  UserProgress,
  calculateLevel,
  calculateNextLevelExperience,
  calculateLevelProgress,
  getLevelTitle
} from '@/lib/progressTracker'
import {
  SparklesIcon,
  ArrowUpIcon,
  StarIcon,
  TrophyIcon,
  FireIcon,
  ChartBarIcon,
  CalendarIcon,
  LightBulbIcon
} from '@heroicons/react/24/outline'

// Import our new components
import AuraLevelOrb from './AuraLevelOrb'
import SimpleBadge from './SimpleBadge'
import SpiritGuide from './SpiritGuide'

interface AuraProgressProps {
  userId: string
  className?: string
}

export default function AuraProgress({
  userId,
  className = '',
}: AuraProgressProps) {
  const { theme } = useTheme()
  const [progress, setProgress] = useState<UserProgress | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showAchievements, setShowAchievements] = useState(false)

  // Fetch user progress
  useEffect(() => {
    const fetchUserProgress = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(`/api/progress`)

        if (response.ok) {
          const data = await response.json()
          setProgress(data.progress)
        } else {
          console.error('Failed to fetch user progress')
        }
      } catch (error) {
        console.error('Error fetching user progress:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserProgress()
  }, [userId])

  // If loading or no progress data, show loading state
  if (isLoading) {
    return (
      <div className={`glass rounded-xl p-6 ${className}`}>
        <div className="flex justify-center items-center py-8">
          <motion.div
            className="w-12 h-12 rounded-full border-4 border-primary/30 border-t-primary"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        </div>
      </div>
    )
  }

  // If no progress data, show empty state
  if (!progress) {
    return (
      <div className={`glass rounded-xl p-6 ${className}`}>
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <motion.div
            animate={{
              y: [0, -10, 0],
              opacity: [0.5, 1, 0.5]
            }}
            transition={{
              repeat: Infinity,
              duration: 3,
              ease: "easeInOut"
            }}
          >
            <SparklesIcon className="h-12 w-12 text-primary/50 mb-3" />
          </motion.div>
          <p className="text-primary-dark font-medium mb-2">No progress data available</p>
          <p className="text-sm text-text-light">
            Start using the app to track your progress and grow your aura
          </p>
        </div>
      </div>
    )
  }

  // Calculate level progress
  const levelProgress = calculateLevelProgress(
    progress.experience,
    progress.level
  )

  // Get recent achievements (last 3)
  const recentAchievements = progress.achievements
    .filter(a => a.unlockedAt)
    .sort((a, b) => {
      return new Date(b.unlockedAt!).getTime() - new Date(a.unlockedAt!).getTime()
    })
    .slice(0, 3)

  // Get in-progress achievements (up to 3)
  const inProgressAchievements = progress.achievements
    .filter(a => !a.unlockedAt && a.progress && a.maxProgress)
    .sort((a, b) => {
      const aProgress = (a.progress || 0) / (a.maxProgress || 1)
      const bProgress = (b.progress || 0) / (b.maxProgress || 1)
      return bProgress - aProgress
    })
    .slice(0, 3)

  return (
    <div className={`glass rounded-xl overflow-hidden relative ${className}`}>
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

      {/* Header */}
      <div className="p-5 border-b border-white/10">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-serif font-medium text-primary-dark flex items-center">
            <SparklesIcon className="h-5 w-5 mr-2 text-primary" />
            Aura Growth
          </h3>

          <div className="flex items-center">
            <motion.button
              onClick={() => setShowAchievements(!showAchievements)}
              className="text-sm text-primary hover:text-primary-dark px-3 py-1 rounded-full border border-primary/20 hover:bg-primary/5"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {showAchievements ? 'Show Progress' : 'Show Achievements'}
            </motion.button>

            {/* Spirit Guide */}
            <div className="ml-2">
              <SpiritGuide level={progress.level} />
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <AnimatePresence mode="wait">
          {!showAchievements ? (
            // Progress View
            <motion.div
              key="progress-view"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Level Orb and Title */}
              <div className="flex flex-col md:flex-row items-center mb-6">
                <div className="mb-4 md:mb-0 md:mr-6">
                  <AuraLevelOrb
                    level={progress.level}
                    progress={levelProgress}
                    color={theme.primary}
                    size="md"
                  />
                </div>

                <div className="text-center md:text-left flex-1">
                  <div className="text-sm text-text-light mb-1">Current Title</div>
                  <motion.div
                    className="text-xl font-serif font-medium text-primary-dark mb-2"
                    animate={{
                      color: [
                        theme.primary,
                        theme.accent,
                        theme.primary
                      ]
                    }}
                    transition={{
                      duration: 10,
                      repeat: Infinity,
                      ease: "linear"
                    }}
                  >
                    {getLevelTitle(progress.level)}
                  </motion.div>

                  {/* Progress Bar */}
                  <div className="w-full">
                    <div className="flex justify-between text-xs text-text-light mb-1">
                      <span>Level {progress.level}</span>
                      <span>Level {progress.level + 1}</span>
                    </div>

                    <div className="w-full bg-white/30 rounded-full h-2.5 mb-1 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${levelProgress}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="h-2.5 rounded-full relative"
                        style={{
                          background: `linear-gradient(to right, ${theme.primary}, ${theme.accent})`
                        }}
                      >
                        {/* Animated glow effect */}
                        <motion.div
                          className="absolute top-0 h-full w-10 bg-white/50 blur-sm"
                          animate={{
                            x: [-10, 100 + (levelProgress * 2)],
                            opacity: [0, 0.8, 0]
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            repeatDelay: 1
                          }}
                        />
                      </motion.div>
                    </div>

                    <div className="flex justify-between text-xs">
                      <span className="text-text-light">
                        {progress.experience} XP
                      </span>
                      <span className="text-text-light">
                        {progress.nextLevelExperience} XP
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <motion.div
                  className="glass p-4 rounded-lg"
                  whileHover={{ y: -5, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
                >
                  <div className="flex items-center mb-2">
                    <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center mr-2">
                      <StarIcon className="h-4 w-4 text-purple-600" />
                    </div>
                    <div className="text-sm font-medium text-primary-dark">Tests Completed</div>
                  </div>
                  <div className="text-2xl font-bold text-primary">
                    {progress.stats.testsCompleted}
                  </div>
                </motion.div>

                <motion.div
                  className="glass p-4 rounded-lg"
                  whileHover={{ y: -5, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
                >
                  <div className="flex items-center mb-2">
                    <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center mr-2">
                      <ChartBarIcon className="h-4 w-4 text-yellow-600" />
                    </div>
                    <div className="text-sm font-medium text-primary-dark">Moods Logged</div>
                  </div>
                  <div className="text-2xl font-bold text-primary">
                    {progress.stats.moodEntriesLogged}
                  </div>
                </motion.div>

                <motion.div
                  className="glass p-4 rounded-lg"
                  whileHover={{ y: -5, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
                >
                  <div className="flex items-center mb-2">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-2">
                      <CalendarIcon className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="text-sm font-medium text-primary-dark">Days Active</div>
                  </div>
                  <div className="text-2xl font-bold text-primary">
                    {progress.stats.daysActive}
                  </div>
                </motion.div>

                <motion.div
                  className="glass p-4 rounded-lg"
                  whileHover={{ y: -5, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
                >
                  <div className="flex items-center mb-2">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mr-2">
                      <LightBulbIcon className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="text-sm font-medium text-primary-dark">Insights Generated</div>
                  </div>
                  <div className="text-2xl font-bold text-primary">
                    {progress.stats.insightsGenerated}
                  </div>
                </motion.div>
              </div>

              {/* Recent Activity */}
              {recentAchievements.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-primary-dark mb-3 flex items-center">
                    <TrophyIcon className="h-4 w-4 mr-1 text-accent-alt" />
                    Recent Achievements
                  </h4>

                  <div className="space-y-3">
                    {recentAchievements.map((achievement, index) => (
                      <motion.div
                        key={achievement.id}
                        className="glass p-3 rounded-lg flex items-center"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ x: 5 }}
                      >
                        <SimpleBadge
                          achievement={achievement}
                          size="sm"
                          animate={true}
                          className="mr-3"
                        />

                        <div>
                          <div className="text-sm font-medium text-primary-dark">
                            {achievement.title}
                          </div>
                          <div className="text-xs text-text-light">
                            {new Date(achievement.unlockedAt!).toLocaleDateString()}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          ) : (
            // Achievements View
            <motion.div
              key="achievements-view"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Achievement Stats */}
              <div className="flex justify-between items-center mb-6">
                <div className="text-center p-4 glass rounded-lg">
                  <div className="text-sm text-text-light mb-1">Unlocked</div>
                  <div className="text-2xl font-bold text-primary">
                    {progress.achievements.filter(a => a.unlockedAt).length}
                  </div>
                </div>

                <div className="text-center p-4 glass rounded-lg">
                  <div className="text-sm text-text-light mb-1">Total</div>
                  <div className="text-2xl font-bold text-primary-dark">
                    {progress.achievements.length}
                  </div>
                </div>

                <div className="text-center p-4 glass rounded-lg">
                  <div className="text-sm text-text-light mb-1">Completion</div>
                  <div className="text-2xl font-bold text-primary">
                    {Math.round((progress.achievements.filter(a => a.unlockedAt).length / progress.achievements.length) * 100)}%
                  </div>
                </div>
              </div>

              {/* Badge Collection */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-primary-dark mb-3 flex items-center">
                  <SparklesIcon className="h-4 w-4 mr-1 text-accent-alt" />
                  Mystic Badge Collection
                </h4>

                <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 mb-4">
                  {progress.achievements.map((achievement, index) => (
                    <motion.div
                      key={achievement.id}
                      className="flex flex-col items-center"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <SimpleBadge
                        achievement={achievement}
                        size="sm"
                        animate={!!achievement.unlockedAt}
                      />
                      <div className="text-xs text-center mt-2 text-text-light">
                        {achievement.title}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* In Progress Achievements */}
              {inProgressAchievements.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-primary-dark mb-3 flex items-center">
                    <FireIcon className="h-4 w-4 mr-1 text-accent-alt" />
                    In Progress
                  </h4>

                  <div className="space-y-4">
                    {inProgressAchievements.map(achievement => {
                      const progressPercent = Math.round(
                        ((achievement.progress || 0) / (achievement.maxProgress || 1)) * 100
                      )

                      return (
                        <motion.div
                          key={achievement.id}
                          className="glass p-3 rounded-lg"
                          whileHover={{ x: 5 }}
                        >
                          <div className="flex items-start mb-2">
                            <SimpleBadge
                              achievement={achievement}
                              size="sm"
                              className="mr-3"
                            />

                            <div className="flex-1">
                              <div className="flex justify-between">
                                <span className="font-medium text-primary-dark">{achievement.title}</span>
                                <span className="text-sm text-text-light">
                                  {achievement.progress}/{achievement.maxProgress}
                                </span>
                              </div>

                              <div className="text-xs text-text-light mb-2">
                                {achievement.description}
                              </div>

                              <div className="w-full bg-white/30 rounded-full h-1.5 overflow-hidden">
                                <motion.div
                                  className="h-1.5 rounded-full"
                                  style={{
                                    background: `linear-gradient(to right, ${theme.primary}, ${theme.accent})`
                                  }}
                                  initial={{ width: 0 }}
                                  animate={{ width: `${progressPercent}%` }}
                                  transition={{ duration: 1 }}
                                />
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="px-5 py-4 bg-white/10 backdrop-blur-sm text-sm text-center text-text-light/80 italic">
        Continue your journey to grow your aura and unlock mystical achievements.
      </div>
    </div>
  )
}
