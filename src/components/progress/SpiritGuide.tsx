'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { SparklesIcon, LightBulbIcon, XMarkIcon } from '@heroicons/react/24/outline'

interface SpiritGuideProps {
  level: number
  className?: string
}

export default function SpiritGuide({
  level,
  className = '',
}: SpiritGuideProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [currentTip, setCurrentTip] = useState<string>('')
  const [tipIndex, setTipIndex] = useState(0)
  
  // Tips based on user level
  const getTipsForLevel = (level: number): string[] => {
    // Basic tips for all levels
    const basicTips = [
      "Track your mood daily to gain deeper insights into your emotional patterns.",
      "Complete personality tests regularly to see how your traits evolve over time.",
      "Your aura visualization reflects your unique personality traits.",
      "Explore different soundscapes to find what resonates with your current mood.",
    ]
    
    // Level-specific tips
    if (level <= 3) {
      return [
        ...basicTips,
        "Welcome to your journey of self-discovery!",
        "Try logging your mood at the same time each day for consistency.",
        "Complete your profile to unlock the 'Identity Established' achievement.",
      ]
    } else if (level <= 7) {
      return [
        ...basicTips,
        "You're making great progress on your self-awareness journey!",
        "Try comparing your test results over time to see how you've grown.",
        "Explore the different themed soundscapes for a more immersive experience.",
        "Share your insights with friends to gain new perspectives.",
      ]
    } else if (level <= 12) {
      return [
        ...basicTips,
        "Your aura is growing stronger with each insight you gain!",
        "Look for patterns in your mood entries to better understand your emotional triggers.",
        "Challenge yourself to improve in areas where your traits score lower.",
        "Meditation can help enhance your self-awareness even further.",
      ]
    } else {
      return [
        ...basicTips,
        "Your journey has made you a master of self-awareness!",
        "Consider mentoring others on their self-discovery journey.",
        "Subtle changes in your aura can reveal deep personal growth.",
        "Your consistent practice has unlocked deeper insights about yourself.",
        "Try setting personal growth goals based on your trait analysis.",
      ]
    }
  }
  
  // Get spirit guide name based on level
  const getSpiritGuideName = (level: number): string => {
    if (level <= 3) return "Lumina"
    if (level <= 7) return "Zephyr"
    if (level <= 12) return "Seraphina"
    return "Orion"
  }
  
  // Get spirit guide color based on level
  const getSpiritGuideColor = (level: number): string => {
    if (level <= 3) return "from-blue-400 to-purple-500"
    if (level <= 7) return "from-purple-400 to-pink-500"
    if (level <= 12) return "from-amber-400 to-orange-500"
    return "from-emerald-400 to-teal-500"
  }
  
  // Show guide randomly or when triggered
  useEffect(() => {
    // Show guide on initial load with a delay
    const initialTimer = setTimeout(() => {
      setIsVisible(true)
    }, 3000)
    
    // Set up random appearances
    const randomTimer = setInterval(() => {
      // 10% chance to appear if not already visible
      if (Math.random() < 0.1 && !isVisible) {
        setIsVisible(true)
      }
    }, 60000) // Check every minute
    
    return () => {
      clearTimeout(initialTimer)
      clearInterval(randomTimer)
    }
  }, [isVisible])
  
  // Rotate through tips
  useEffect(() => {
    if (isVisible) {
      const tips = getTipsForLevel(level)
      setCurrentTip(tips[tipIndex % tips.length])
      
      // Auto-hide after 10 seconds
      const hideTimer = setTimeout(() => {
        setIsVisible(false)
      }, 10000)
      
      return () => clearTimeout(hideTimer)
    }
  }, [isVisible, level, tipIndex])
  
  // Show next tip
  const showNextTip = () => {
    setTipIndex(prev => prev + 1)
    // Reset the auto-hide timer by toggling visibility
    setIsVisible(false)
    setTimeout(() => setIsVisible(true), 100)
  }
  
  // Close the guide
  const closeGuide = () => {
    setIsVisible(false)
  }
  
  // Show the guide
  const showGuide = () => {
    setIsVisible(true)
  }
  
  const guideName = getSpiritGuideName(level)
  const guideColor = getSpiritGuideColor(level)
  
  return (
    <div className={`relative ${className}`}>
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="absolute bottom-full mb-3 right-0 w-64 glass rounded-lg p-4 shadow-lg"
          >
            <button 
              onClick={closeGuide}
              className="absolute top-2 right-2 text-text-light/70 hover:text-text-light"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
            
            <div className="flex items-start mb-2">
              <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${guideColor} flex items-center justify-center text-white mr-2 flex-shrink-0`}>
                <SparklesIcon className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-sm font-medium text-primary-dark">{guideName}</h4>
                <p className="text-xs text-text-light">Your Spirit Guide</p>
              </div>
            </div>
            
            <p className="text-sm text-text-light mb-3">{currentTip}</p>
            
            <div className="flex justify-end">
              <button
                onClick={showNextTip}
                className="text-xs text-primary flex items-center hover:text-primary-dark"
              >
                <LightBulbIcon className="h-3 w-3 mr-1" />
                Another tip
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <motion.button
        onClick={showGuide}
        className={`w-10 h-10 rounded-full bg-gradient-to-br ${guideColor} flex items-center justify-center text-white shadow-lg`}
        whileHover={{ scale: 1.1, rotate: 5 }}
        whileTap={{ scale: 0.9 }}
        animate={!isVisible ? {
          y: [0, -5, 0],
          boxShadow: [
            '0 4px 6px rgba(0, 0, 0, 0.1)',
            '0 10px 15px rgba(0, 0, 0, 0.2)',
            '0 4px 6px rgba(0, 0, 0, 0.1)'
          ]
        } : {}}
        transition={{
          y: { repeat: !isVisible ? Infinity : 0, duration: 2 },
          boxShadow: { repeat: !isVisible ? Infinity : 0, duration: 2 }
        }}
      >
        <SparklesIcon className="h-5 w-5" />
      </motion.button>
    </div>
  )
}
