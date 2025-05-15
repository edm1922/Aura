'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { generateDailyAffirmation, generateAllTraitAffirmations } from '@/lib/personalityAffirmations'
import { SparklesIcon, ArrowPathIcon } from '@heroicons/react/24/outline'

interface DailyAffirmationProps {
  traits?: {
    openness?: number
    conscientiousness?: number
    extraversion?: number
    agreeableness?: number
    neuroticism?: number
  }
  className?: string
}

export default function DailyAffirmation({
  traits,
  className = '',
}: DailyAffirmationProps) {
  const [affirmation, setAffirmation] = useState('')
  const [allAffirmations, setAllAffirmations] = useState<Record<string, string>>({})
  const [showAll, setShowAll] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Generate affirmation on component mount and when traits change
  useEffect(() => {
    if (traits && Object.keys(traits).length > 0) {
      const dailyAffirmation = generateDailyAffirmation(traits)
      setAffirmation(dailyAffirmation)

      const traitAffirmations = generateAllTraitAffirmations(traits)
      setAllAffirmations(traitAffirmations)
    } else {
      setAffirmation("I embrace my unique qualities and continue to grow each day.")
    }
  }, [traits])

  // Toggle showing all affirmations
  const toggleShowAll = () => {
    setShowAll(!showAll)
  }

  // Refresh the daily affirmation
  const refreshAffirmation = () => {
    if (!traits || Object.keys(traits).length === 0) return

    setIsRefreshing(true)

    // Generate a new affirmation
    const newAffirmation = generateDailyAffirmation(traits)
    setAffirmation(newAffirmation)

    // Reset the refreshing state after animation
    setTimeout(() => {
      setIsRefreshing(false)
    }, 600)
  }

  // Get trait color class
  const getTraitColor = (trait: string) => {
    switch (trait) {
      case 'openness':
        return 'text-purple-600 border-purple-200 bg-purple-50'
      case 'conscientiousness':
        return 'text-green-600 border-green-200 bg-green-50'
      case 'extraversion':
        return 'text-blue-600 border-blue-200 bg-blue-50'
      case 'agreeableness':
        return 'text-yellow-600 border-yellow-200 bg-yellow-50'
      case 'neuroticism':
        return 'text-red-600 border-red-200 bg-red-50'
      default:
        return 'text-gray-600 border-gray-200 bg-gray-50'
    }
  }

  // Get trait color for gradient
  const getTraitGradient = (trait: string) => {
    switch (trait) {
      case 'openness':
        return 'from-purple-400 to-purple-600';
      case 'conscientiousness':
        return 'from-green-400 to-green-600';
      case 'extraversion':
        return 'from-blue-400 to-blue-600';
      case 'agreeableness':
        return 'from-yellow-400 to-yellow-600';
      case 'neuroticism':
        return 'from-red-400 to-red-600';
      default:
        return 'from-primary to-primary-dark';
    }
  };

  // Floating bubble animation variants
  const bubbleVariants = {
    initial: {
      opacity: 0,
      scale: 0.8,
      y: 20
    },
    animate: (i: number) => ({
      opacity: [0, 1, 1, 0],
      scale: [0.8, 1, 1, 0.9],
      y: [20, -10, -30, -60],
      transition: {
        duration: 8,
        times: [0, 0.1, 0.9, 1],
        delay: i * 2,
        repeat: Infinity,
        repeatDelay: 15
      }
    })
  };

  return (
    <div className={`glass rounded-xl overflow-hidden relative ${className}`}>
      {/* Background gradient effect */}
      <div
        className="absolute inset-0 opacity-10 -z-10"
        style={{
          background: `radial-gradient(circle at center,
            rgba(255, 215, 0, 0.2) 0%,
            rgba(255, 215, 0, 0.05) 50%,
            transparent 100%)`,
        }}
      />

      {/* Floating affirmation bubbles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Object.entries(allAffirmations).map(([trait, _], index) => (
          <motion.div
            key={`bubble-${trait}`}
            className={`absolute rounded-full bg-gradient-to-br ${getTraitGradient(trait)} p-3 shadow-lg text-white text-xs font-handwriting opacity-70 max-w-[120px] text-center`}
            style={{
              left: `${15 + (index * 20) % 60}%`,
              bottom: '-20px',
              filter: 'blur(0.5px)',
              zIndex: -1
            }}
            custom={index}
            variants={bubbleVariants}
            initial="initial"
            animate="animate"
          >
            {trait.charAt(0).toUpperCase() + trait.slice(1)}
          </motion.div>
        ))}
      </div>

      <div className="p-6 relative">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-serif font-medium text-primary-dark flex items-center">
            <SparklesIcon className="h-5 w-5 mr-2 text-accent-alt" />
            Daily Affirmation
          </h2>

          <div className="flex space-x-2">
            <motion.button
              onClick={refreshAffirmation}
              disabled={isRefreshing}
              className="p-1 rounded-full text-primary/70 hover:text-primary"
              aria-label="Refresh affirmation"
              whileHover={{ scale: 1.1, rotate: 10 }}
              whileTap={{ scale: 0.9, rotate: 0 }}
            >
              <ArrowPathIcon
                className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`}
              />
            </motion.button>

            <motion.button
              onClick={toggleShowAll}
              className="text-sm text-primary hover:text-primary-dark"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {showAll ? 'Show Less' : 'Show All'}
            </motion.button>
          </div>
        </div>

        <motion.div
          key={affirmation}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="p-5 glass rounded-lg mb-4 shadow-md"
        >
          <motion.p
            className="text-primary-dark font-handwriting text-lg text-center"
            animate={{
              scale: [1, 1.02, 1],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              repeatType: "reverse"
            }}
          >
            "{affirmation}"
          </motion.p>
        </motion.div>

        <AnimatePresence>
          {showAll && Object.keys(allAffirmations).length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-3 mt-6"
            >
              <h3 className="text-sm font-medium text-primary-dark">Trait-Specific Affirmations:</h3>

              <div className="grid grid-cols-1 gap-3">
                {Object.entries(allAffirmations).map(([trait, traitAffirmation], index) => (
                  <motion.div
                    key={trait}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="relative"
                  >
                    <motion.div
                      className={`p-4 glass rounded-lg border-l-4 ${
                        trait === 'openness' ? 'border-purple-400' :
                        trait === 'conscientiousness' ? 'border-green-400' :
                        trait === 'extraversion' ? 'border-blue-400' :
                        trait === 'agreeableness' ? 'border-yellow-400' :
                        trait === 'neuroticism' ? 'border-red-400' : 'border-primary'
                      }`}
                      whileHover={{
                        x: 5,
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                      }}
                    >
                      <div className={`font-medium capitalize mb-1 ${
                        trait === 'openness' ? 'text-purple-600' :
                        trait === 'conscientiousness' ? 'text-green-600' :
                        trait === 'extraversion' ? 'text-blue-600' :
                        trait === 'agreeableness' ? 'text-yellow-600' :
                        trait === 'neuroticism' ? 'text-red-600' : 'text-primary'
                      }`}>
                        {trait}:
                      </div>
                      <p className="text-sm font-handwriting text-text-light">"{traitAffirmation}"</p>
                    </motion.div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>


      </div>
    </div>
  )
}
