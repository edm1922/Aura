'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useTheme } from '@/context/ThemeContext'
import { SparklesIcon } from '@heroicons/react/24/solid'

interface AuraBadgeProps {
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  className?: string
  onClick?: () => void
}

export default function AuraBadge({
  size = 'md',
  showLabel = false,
  className = '',
  onClick,
}: AuraBadgeProps) {
  const { theme } = useTheme()
  const [isAnimating, setIsAnimating] = useState(false)
  
  // Size mapping
  const sizeMap = {
    sm: {
      badge: 'h-8 w-8',
      icon: 'h-4 w-4',
      font: 'text-xs',
    },
    md: {
      badge: 'h-12 w-12',
      icon: 'h-6 w-6',
      font: 'text-sm',
    },
    lg: {
      badge: 'h-16 w-16',
      icon: 'h-8 w-8',
      font: 'text-base',
    },
  }
  
  // Trigger animation periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true)
      setTimeout(() => setIsAnimating(false), 2000)
    }, 10000)
    
    return () => clearInterval(interval)
  }, [])
  
  // Handle click
  const handleClick = () => {
    setIsAnimating(true)
    setTimeout(() => setIsAnimating(false), 2000)
    
    if (onClick) {
      onClick()
    }
  }
  
  return (
    <div className={`flex flex-col items-center ${className}`}>
      <motion.div
        className={`relative rounded-full flex items-center justify-center cursor-pointer ${sizeMap[size].badge}`}
        style={{
          background: theme.badge.background,
          border: `2px solid ${theme.badge.border}`,
          boxShadow: `0 0 15px ${theme.badge.shadow}`,
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        animate={isAnimating ? {
          boxShadow: [
            `0 0 15px ${theme.badge.shadow}`,
            `0 0 30px ${theme.badge.shadow}`,
            `0 0 15px ${theme.badge.shadow}`,
          ]
        } : {}}
        transition={{ duration: 2 }}
        onClick={handleClick}
      >
        <SparklesIcon className={`text-white ${sizeMap[size].icon}`} />
        
        {/* Animated particles */}
        {isAnimating && (
          <>
            <motion.div
              className="absolute w-full h-full rounded-full"
              initial={{ opacity: 0.7, scale: 1 }}
              animate={{ opacity: 0, scale: 1.5 }}
              transition={{ duration: 2 }}
              style={{ background: theme.badge.background }}
            />
            <motion.div
              className="absolute w-full h-full rounded-full"
              initial={{ opacity: 0.5, scale: 1 }}
              animate={{ opacity: 0, scale: 1.3 }}
              transition={{ duration: 1.5, delay: 0.2 }}
              style={{ background: theme.badge.background }}
            />
          </>
        )}
      </motion.div>
      
      {showLabel && (
        <motion.div
          className={`mt-2 font-medium ${sizeMap[size].font}`}
          style={{ color: theme.primary }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {theme.name}
        </motion.div>
      )}
    </div>
  )
}
