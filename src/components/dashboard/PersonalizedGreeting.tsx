'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { generatePersonalizedGreeting, generateMoodBasedSuggestion } from '@/lib/personalizedGreetings'
import { LightBulbIcon } from '@heroicons/react/24/outline'

interface PersonalizedGreetingProps {
  userName: string
  traits?: {
    openness?: number
    conscientiousness?: number
    extraversion?: number
    agreeableness?: number
    neuroticism?: number
  }
  className?: string
}

export default function PersonalizedGreeting({
  userName,
  traits,
  className = '',
}: PersonalizedGreetingProps) {
  const [greeting, setGreeting] = useState('')
  const [suggestion, setSuggestion] = useState('')
  const [showSuggestion, setShowSuggestion] = useState(false)

  // Generate greeting on component mount and when traits change
  useEffect(() => {
    const name = userName || 'there'
    const personalizedGreeting = generatePersonalizedGreeting(name, traits)
    setGreeting(personalizedGreeting)
    
    // Generate suggestion if traits are available
    if (traits && Object.keys(traits).length > 0) {
      const moodSuggestion = generateMoodBasedSuggestion(traits)
      setSuggestion(moodSuggestion)
    }
  }, [userName, traits])

  // Toggle suggestion visibility
  const toggleSuggestion = () => {
    setShowSuggestion(!showSuggestion)
  }

  return (
    <div className={`${className}`}>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
          {greeting}
        </h1>
        
        {suggestion && (
          <div className="mt-2">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="flex items-start"
            >
              <button
                onClick={toggleSuggestion}
                className="flex items-center text-sm text-primary hover:text-primary-dark transition-colors"
              >
                <LightBulbIcon className="h-5 w-5 mr-1" />
                <span>Today's suggestion</span>
              </button>
            </motion.div>
            
            {showSuggestion && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-2 text-sm text-gray-600 bg-primary/5 p-3 rounded-md"
              >
                {suggestion}
              </motion.div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  )
}
