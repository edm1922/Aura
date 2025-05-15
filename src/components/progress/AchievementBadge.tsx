'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useTheme } from '@/context/ThemeContext'
import { Achievement } from '@/lib/progressTracker'
import {
  AcademicCapIcon,
  BeakerIcon,
  CalendarIcon,
  ChartBarIcon,
  ClipboardIcon, // Updated from ClipboardCheckIcon
  ClipboardDocumentIcon, // Updated from ClipboardListIcon
  ClockIcon,
  SquaresPlusIcon, // Updated from CollectionIcon
  FaceSmileIcon, // Updated from EmojiHappyIcon
  FireIcon,
  LightBulbIcon,
  ScaleIcon,
  ShareIcon,
  StarIcon,
  ArrowTrendingUpIcon, // Updated from TrendingUpIcon
  UserCircleIcon,
  UsersIcon,
  LockClosedIcon
} from '@heroicons/react/24/outline'

interface AchievementBadgeProps {
  achievement: Achievement
  unlocked?: boolean
  showDetails?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

// Map achievement icons to Heroicons
const iconMap: Record<string, React.ReactNode> = {
  'academic-cap': <AcademicCapIcon />,
  'beaker': <BeakerIcon />,
  'calendar': <CalendarIcon />,
  'chart-bar': <ChartBarIcon />,
  'clipboard-check': <ClipboardIcon />, // Updated
  'clipboard-list': <ClipboardDocumentIcon />, // Updated
  'clock': <ClockIcon />,
  'collection': <SquaresPlusIcon />, // Updated
  'emoji-happy': <FaceSmileIcon />, // Updated
  'fire': <FireIcon />,
  'light-bulb': <LightBulbIcon />,
  'scale': <ScaleIcon />,
  'share': <ShareIcon />,
  'star': <StarIcon />,
  'trending-up': <ArrowTrendingUpIcon />, // Updated
  'user-circle': <UserCircleIcon />,
  'users': <UsersIcon />,
}

// Category colors
const categoryColors: Record<string, string> = {
  tests: '#3B82F6', // Blue
  mood: '#10B981', // Emerald
  insights: '#8B5CF6', // Purple
  engagement: '#F59E0B', // Amber
  growth: '#EC4899', // Pink
  social: '#6366F1', // Indigo
}

export default function AchievementBadge({
  achievement,
  unlocked = false,
  showDetails = false,
  size = 'md',
  className = '',
}: AchievementBadgeProps) {
  const { theme } = useTheme()
  const [isHovered, setIsHovered] = useState(false)

  // Size mapping
  const sizeMap = {
    sm: {
      badge: 'h-10 w-10',
      icon: 'h-5 w-5',
      font: 'text-xs',
    },
    md: {
      badge: 'h-16 w-16',
      icon: 'h-8 w-8',
      font: 'text-sm',
    },
    lg: {
      badge: 'h-20 w-20',
      icon: 'h-10 w-10',
      font: 'text-base',
    },
  }

  // Get category color or use theme primary
  const badgeColor = categoryColors[achievement.category] || theme.primary

  // Get icon or use star as fallback
  const icon = iconMap[achievement.icon] || <StarIcon />

  return (
    <div
      className={`flex flex-col items-center ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative">
        <motion.div
          className={`relative rounded-full flex items-center justify-center ${sizeMap[size].badge}`}
          style={{
            backgroundColor: unlocked ? badgeColor : '#E5E7EB',
            opacity: unlocked ? 1 : 0.7,
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <div className={`text-white ${sizeMap[size].icon}`}>
            {unlocked ? icon : <LockClosedIcon />}
          </div>

          {/* Progress indicator (if applicable) */}
          {!unlocked && achievement.progress !== undefined && achievement.maxProgress && (
            <svg
              className="absolute inset-0 w-full h-full -rotate-90"
              viewBox="0 0 100 100"
            >
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="#D1D5DB"
                strokeWidth="8"
              />
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke={badgeColor}
                strokeWidth="8"
                strokeDasharray={`${2 * Math.PI * 45}`}
                strokeDashoffset={`${2 * Math.PI * 45 * (1 - achievement.progress / achievement.maxProgress)}`}
                strokeLinecap="round"
              />
            </svg>
          )}
        </motion.div>

        {/* Unlocked indicator */}
        {unlocked && (
          <div
            className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-0.5 border-2 border-white"
          >
            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )}
      </div>

      {/* Title */}
      {showDetails && (
        <div className={`mt-2 font-medium text-center ${sizeMap[size].font}`}>
          {achievement.title}
        </div>
      )}

      {/* Tooltip */}
      {isHovered && !showDetails && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute mt-2 z-10 bg-white rounded-md shadow-lg p-2 text-xs max-w-xs"
          style={{ top: '100%' }}
        >
          <div className="font-medium mb-1">{achievement.title}</div>
          <div className="text-gray-600">{achievement.description}</div>

          {!unlocked && achievement.progress !== undefined && achievement.maxProgress && (
            <div className="mt-1 text-gray-500">
              Progress: {achievement.progress}/{achievement.maxProgress}
            </div>
          )}

          {unlocked && achievement.unlockedAt && (
            <div className="mt-1 text-gray-500">
              Unlocked: {new Date(achievement.unlockedAt).toLocaleDateString()}
            </div>
          )}
        </motion.div>
      )}
    </div>
  )
}
