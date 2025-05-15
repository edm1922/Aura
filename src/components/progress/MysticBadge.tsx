'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Achievement } from '@/lib/progressTracker'

// Icons for different achievement categories
import { SparklesIcon } from '@heroicons/react/24/outline'
import { FireIcon } from '@heroicons/react/24/outline'
import { LightBulbIcon } from '@heroicons/react/24/outline'
import { UserCircleIcon } from '@heroicons/react/24/outline'
import { ChartBarIcon } from '@heroicons/react/24/outline'
import { ShareIcon } from '@heroicons/react/24/outline'
import { CheckCircleIcon } from '@heroicons/react/24/outline'
import { AcademicCapIcon } from '@heroicons/react/24/outline'
import { CalendarIcon } from '@heroicons/react/24/outline'
import { ClockIcon } from '@heroicons/react/24/outline'
import { ArrowTrendingUpIcon } from '@heroicons/react/24/outline'
import { ScaleIcon } from '@heroicons/react/24/outline'
import { UsersIcon } from '@heroicons/react/24/outline'
import { QueueListIcon } from '@heroicons/react/24/outline'
import { FaceSmileIcon } from '@heroicons/react/24/outline'

interface MysticBadgeProps {
  achievement: Achievement
  size?: 'sm' | 'md' | 'lg'
  showDetails?: boolean
  className?: string
  animate?: boolean
}

export default function MysticBadge({
  achievement,
  size = 'md',
  showDetails = false,
  className = '',
  animate = false
}: MysticBadgeProps) {
  // Get badge color based on category
  const getBadgeColor = (category: string) => {
    switch (category) {
      case 'tests':
        return {
          bg: 'from-purple-500 to-indigo-600',
          glow: 'rgba(139, 92, 246, 0.5)',
          border: 'rgba(139, 92, 246, 0.3)'
        }
      case 'mood':
        return {
          bg: 'from-yellow-400 to-orange-500',
          glow: 'rgba(251, 191, 36, 0.5)',
          border: 'rgba(251, 191, 36, 0.3)'
        }
      case 'insights':
        return {
          bg: 'from-blue-400 to-cyan-500',
          glow: 'rgba(96, 165, 250, 0.5)',
          border: 'rgba(96, 165, 250, 0.3)'
        }
      case 'engagement':
        return {
          bg: 'from-green-400 to-emerald-500',
          glow: 'rgba(52, 211, 153, 0.5)',
          border: 'rgba(52, 211, 153, 0.3)'
        }
      case 'growth':
        return {
          bg: 'from-pink-400 to-rose-500',
          glow: 'rgba(244, 114, 182, 0.5)',
          border: 'rgba(244, 114, 182, 0.3)'
        }
      case 'social':
        return {
          bg: 'from-amber-400 to-red-500',
          glow: 'rgba(251, 146, 60, 0.5)',
          border: 'rgba(251, 146, 60, 0.3)'
        }
      default:
        return {
          bg: 'from-gray-400 to-gray-600',
          glow: 'rgba(156, 163, 175, 0.5)',
          border: 'rgba(156, 163, 175, 0.3)'
        }
    }
  }

  // Get icon based on achievement icon name
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'sparkles': return <SparklesIcon className="h-full w-full" />
      case 'fire': return <FireIcon className="h-full w-full" />
      case 'light-bulb': return <LightBulbIcon className="h-full w-full" />
      case 'user-circle': return <UserCircleIcon className="h-full w-full" />
      case 'chart-bar': return <ChartBarIcon className="h-full w-full" />
      case 'share': return <ShareIcon className="h-full w-full" />
      case 'clipboard-check': return <CheckCircleIcon className="h-full w-full" />
      case 'academic-cap': return <AcademicCapIcon className="h-full w-full" />
      case 'calendar': return <CalendarIcon className="h-full w-full" />
      case 'clock': return <ClockIcon className="h-full w-full" />
      case 'trending-up': return <ArrowTrendingUpIcon className="h-full w-full" />
      case 'scale': return <ScaleIcon className="h-full w-full" />
      case 'users': return <UsersIcon className="h-full w-full" />
      case 'collection': return <QueueListIcon className="h-full w-full" />
      case 'emoji-happy': return <FaceSmileIcon className="h-full w-full" />
      default: return <SparklesIcon className="h-full w-full" />
    }
  }

  // Size classes
  const sizeClasses = {
    sm: 'w-10 h-10 text-xs',
    md: 'w-16 h-16 text-sm',
    lg: 'w-24 h-24 text-base'
  }

  // Badge colors
  const colors = getBadgeColor(achievement.category)
  const isUnlocked = !!achievement.unlockedAt

  return (
    <div className={`flex ${showDetails ? 'items-start' : 'items-center'} ${className}`}>
      <motion.div
        className={`relative ${sizeClasses[size]} rounded-full flex items-center justify-center text-white overflow-hidden`}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{
          scale: 1,
          opacity: 1,
          boxShadow: isUnlocked && animate
            ? [
                `0 0 0 ${colors.glow}`,
                `0 0 20px ${colors.glow}`,
                `0 0 0 ${colors.glow}`
              ]
            : `0 0 ${isUnlocked ? '10px' : '0px'} ${colors.glow}`
        }}
        transition={{
          duration: 0.5,
          boxShadow: {
            repeat: animate && isUnlocked ? Infinity : 0,
            duration: 2
          }
        }}
      >
        {/* Background gradient */}
        <div className={`absolute inset-0 bg-gradient-to-br ${colors.bg} ${!isUnlocked && 'opacity-30 grayscale'}`} />

        {/* Border */}
        <div className={`absolute inset-0 border-2 rounded-full ${isUnlocked ? 'border-white/30' : 'border-white/10'}`} />

        {/* Icon */}
        <div className={`relative z-10 w-1/2 h-1/2 ${!isUnlocked && 'opacity-50'}`}>
          {getIcon(achievement.icon)}
        </div>

        {/* Locked overlay */}
        {!isUnlocked && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <div className="w-1/3 h-1/3 border-2 border-white/70 rounded-full" />
          </div>
        )}
      </motion.div>

      {showDetails && (
        <div className="ml-3">
          <h4 className={`font-medium ${isUnlocked ? 'text-primary-dark' : 'text-gray-500'}`}>
            {achievement.title}
          </h4>
          <p className="text-xs text-text-light">
            {achievement.description}
          </p>

          {achievement.progress !== undefined && achievement.maxProgress && (
            <div className="mt-1">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>{achievement.progress}/{achievement.maxProgress}</span>
                <span>{Math.round((achievement.progress / achievement.maxProgress) * 100)}%</span>
              </div>
              <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r ${colors.bg}`}
                  style={{ width: `${(achievement.progress / achievement.maxProgress) * 100}%` }}
                />
              </div>
            </div>
          )}

          {isUnlocked && achievement.unlockedAt && (
            <div className="text-xs text-text-light mt-1">
              Unlocked: {new Date(achievement.unlockedAt).toLocaleDateString()}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
