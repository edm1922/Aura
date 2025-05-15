'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from '@/context/ThemeContext'
import { useMoodAdaptive } from '@/context/MoodAdaptiveContext'
import { MoodEntry, MoodLevel, MoodCategory } from './MoodTracker'
import LoadingButton from '@/components/LoadingButton'
import MoodAdaptiveElement from '@/components/ui/MoodAdaptiveElement'

interface MoodEntryFormProps {
  onSubmit: (entry: Omit<MoodEntry, 'id'>) => Promise<void>
  existingEntry?: MoodEntry
  traits?: Record<string, number>
}

// Mood factors that might influence mood
const moodFactors = [
  { id: 'sleep', label: 'Sleep' },
  { id: 'exercise', label: 'Exercise' },
  { id: 'nutrition', label: 'Nutrition' },
  { id: 'social', label: 'Social Interaction' },
  { id: 'work', label: 'Work/School' },
  { id: 'stress', label: 'Stress' },
  { id: 'weather', label: 'Weather' },
  { id: 'health', label: 'Health' },
]

// Mood categories with icons and colors
const moodCategories: Record<MoodCategory, { label: string, color: string }> = {
  happy: { label: 'Happy', color: '#10B981' }, // Emerald
  calm: { label: 'Calm', color: '#3B82F6' }, // Blue
  energetic: { label: 'Energetic', color: '#F59E0B' }, // Amber
  sad: { label: 'Sad', color: '#6B7280' }, // Gray
  anxious: { label: 'Anxious', color: '#8B5CF6' }, // Purple
  angry: { label: 'Angry', color: '#EF4444' }, // Red
}

export default function MoodEntryForm({
  onSubmit,
  existingEntry,
  traits,
}: MoodEntryFormProps) {
  const { theme } = useTheme()
  const { refreshMood } = useMoodAdaptive()
  const [moodLevel, setMoodLevel] = useState<MoodLevel>(existingEntry?.level || 3)
  const [moodCategory, setMoodCategory] = useState<MoodCategory>(existingEntry?.category || 'calm')
  const [notes, setNotes] = useState(existingEntry?.notes || '')
  const [selectedFactors, setSelectedFactors] = useState<string[]>(existingEntry?.factors || [])
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Suggest mood category based on personality traits
  useEffect(() => {
    if (!traits || existingEntry) return

    // If user has high extraversion, suggest 'energetic' or 'happy'
    if (traits.extraversion && traits.extraversion > 4) {
      setMoodCategory('energetic')
    }
    // If user has high neuroticism, suggest 'anxious'
    else if (traits.neuroticism && traits.neuroticism > 4) {
      setMoodCategory('anxious')
    }
    // If user has high agreeableness, suggest 'calm'
    else if (traits.agreeableness && traits.agreeableness > 4) {
      setMoodCategory('calm')
    }
  }, [traits, existingEntry])

  // Handle mood level selection
  const handleMoodLevelChange = (level: MoodLevel) => {
    setMoodLevel(level)
  }

  // Handle mood category selection
  const handleCategoryChange = (category: MoodCategory) => {
    setMoodCategory(category)
  }

  // Handle factor selection
  const handleFactorToggle = (factorId: string) => {
    setSelectedFactors(prev =>
      prev.includes(factorId)
        ? prev.filter(id => id !== factorId)
        : [...prev, factorId]
    )
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    setIsSubmitting(true)

    try {
      const entry = {
        date: new Date().toISOString(),
        level: moodLevel,
        category: moodCategory,
        notes,
        factors: selectedFactors,
      }

      await onSubmit(entry)

      // Refresh the mood context to update UI
      await refreshMood()

      // Reset form if it's not an existing entry
      if (!existingEntry) {
        setNotes('')
        setSelectedFactors([])
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Mood Level Selector */}
      <div className="mb-8">
        <label className="block text-sm font-medium text-primary-dark mb-3">
          How are you feeling today?
        </label>

        <div className="flex justify-between items-center">
          <motion.button
            type="button"
            onClick={() => handleMoodLevelChange(1)}
            className={`flex flex-col items-center p-3 rounded-lg transition-all duration-300 ${
              moodLevel === 1
                ? 'bg-red-100 ring-2 ring-red-400 shadow-lg scale-110'
                : 'hover:bg-red-50 hover:scale-105'
            }`}
            whileHover={{
              scale: moodLevel === 1 ? 1.1 : 1.05,
              y: -5,
            }}
            animate={moodLevel === 1 ? {
              boxShadow: ['0 0 0 rgba(248, 113, 113, 0)', '0 0 15px rgba(248, 113, 113, 0.5)', '0 0 0 rgba(248, 113, 113, 0)'],
            } : {}}
            transition={{
              boxShadow: { repeat: Infinity, duration: 2 },
              scale: { duration: 0.2 }
            }}
          >
            <motion.span
              className="text-3xl mb-1"
              animate={moodLevel === 1 ? { scale: [1, 1.1, 1] } : {}}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              😞
            </motion.span>
            <span className="text-xs font-medium">Very Bad</span>
          </motion.button>

          <motion.button
            type="button"
            onClick={() => handleMoodLevelChange(2)}
            className={`flex flex-col items-center p-3 rounded-lg transition-all duration-300 ${
              moodLevel === 2
                ? 'bg-orange-100 ring-2 ring-orange-400 shadow-lg scale-110'
                : 'hover:bg-orange-50 hover:scale-105'
            }`}
            whileHover={{
              scale: moodLevel === 2 ? 1.1 : 1.05,
              y: -5,
            }}
            animate={moodLevel === 2 ? {
              boxShadow: ['0 0 0 rgba(251, 146, 60, 0)', '0 0 15px rgba(251, 146, 60, 0.5)', '0 0 0 rgba(251, 146, 60, 0)'],
            } : {}}
            transition={{
              boxShadow: { repeat: Infinity, duration: 2 },
              scale: { duration: 0.2 }
            }}
          >
            <motion.span
              className="text-3xl mb-1"
              animate={moodLevel === 2 ? { scale: [1, 1.1, 1] } : {}}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              😕
            </motion.span>
            <span className="text-xs font-medium">Bad</span>
          </motion.button>

          <motion.button
            type="button"
            onClick={() => handleMoodLevelChange(3)}
            className={`flex flex-col items-center p-3 rounded-lg transition-all duration-300 ${
              moodLevel === 3
                ? 'bg-yellow-100 ring-2 ring-yellow-400 shadow-lg scale-110'
                : 'hover:bg-yellow-50 hover:scale-105'
            }`}
            whileHover={{
              scale: moodLevel === 3 ? 1.1 : 1.05,
              y: -5,
            }}
            animate={moodLevel === 3 ? {
              boxShadow: ['0 0 0 rgba(250, 204, 21, 0)', '0 0 15px rgba(250, 204, 21, 0.5)', '0 0 0 rgba(250, 204, 21, 0)'],
            } : {}}
            transition={{
              boxShadow: { repeat: Infinity, duration: 2 },
              scale: { duration: 0.2 }
            }}
          >
            <motion.span
              className="text-3xl mb-1"
              animate={moodLevel === 3 ? { scale: [1, 1.1, 1] } : {}}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              😐
            </motion.span>
            <span className="text-xs font-medium">Neutral</span>
          </motion.button>

          <motion.button
            type="button"
            onClick={() => handleMoodLevelChange(4)}
            className={`flex flex-col items-center p-3 rounded-lg transition-all duration-300 ${
              moodLevel === 4
                ? 'bg-blue-100 ring-2 ring-blue-400 shadow-lg scale-110'
                : 'hover:bg-blue-50 hover:scale-105'
            }`}
            whileHover={{
              scale: moodLevel === 4 ? 1.1 : 1.05,
              y: -5,
            }}
            animate={moodLevel === 4 ? {
              boxShadow: ['0 0 0 rgba(96, 165, 250, 0)', '0 0 15px rgba(96, 165, 250, 0.5)', '0 0 0 rgba(96, 165, 250, 0)'],
            } : {}}
            transition={{
              boxShadow: { repeat: Infinity, duration: 2 },
              scale: { duration: 0.2 }
            }}
          >
            <motion.span
              className="text-3xl mb-1"
              animate={moodLevel === 4 ? { scale: [1, 1.1, 1] } : {}}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              🙂
            </motion.span>
            <span className="text-xs font-medium">Good</span>
          </motion.button>

          <motion.button
            type="button"
            onClick={() => handleMoodLevelChange(5)}
            className={`flex flex-col items-center p-3 rounded-lg transition-all duration-300 ${
              moodLevel === 5
                ? 'bg-green-100 ring-2 ring-green-400 shadow-lg scale-110'
                : 'hover:bg-green-50 hover:scale-105'
            }`}
            whileHover={{
              scale: moodLevel === 5 ? 1.1 : 1.05,
              y: -5,
            }}
            animate={moodLevel === 5 ? {
              boxShadow: ['0 0 0 rgba(74, 222, 128, 0)', '0 0 15px rgba(74, 222, 128, 0.5)', '0 0 0 rgba(74, 222, 128, 0)'],
            } : {}}
            transition={{
              boxShadow: { repeat: Infinity, duration: 2 },
              scale: { duration: 0.2 }
            }}
          >
            <motion.span
              className="text-3xl mb-1"
              animate={moodLevel === 5 ? { scale: [1, 1.1, 1] } : {}}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              😄
            </motion.span>
            <span className="text-xs font-medium">Very Good</span>
          </motion.button>
        </div>
      </div>

      {/* Mood Category */}
      <div className="mb-8">
        <label className="block text-sm font-medium text-primary-dark mb-3">
          What best describes your mood?
        </label>

        <div className="grid grid-cols-3 gap-3">
          {Object.entries(moodCategories).map(([category, { label, color }]) => (
            <motion.button
              key={category}
              type="button"
              onClick={() => handleCategoryChange(category as MoodCategory)}
              className={`py-3 px-3 rounded-lg text-sm font-medium ${
                moodCategory === category
                  ? 'ring-2 text-white shadow-lg'
                  : 'bg-white/50 backdrop-blur-sm text-gray-700 hover:bg-white/80 border border-gray-100'
              }`}
              style={{
                backgroundColor: moodCategory === category ? color : undefined,
                borderColor: moodCategory === category ? color : undefined,
              }}
              whileHover={{
                scale: 1.03,
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
              }}
              animate={moodCategory === category ? {
                y: [0, -2, 0],
                boxShadow: [
                  `0 0 0 rgba(0, 0, 0, 0)`,
                  `0 0 15px ${color}80`,
                  `0 0 0 rgba(0, 0, 0, 0)`
                ],
              } : {}}
              transition={{
                y: { repeat: Infinity, duration: 2 },
                boxShadow: { repeat: Infinity, duration: 2 },
              }}
            >
              {label}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Mood Factors */}
      <div className="mb-8">
        <label className="block text-sm font-medium text-primary-dark mb-3">
          What factors might be influencing your mood? (Optional)
        </label>

        <div className="grid grid-cols-2 gap-3">
          {moodFactors.map(factor => (
            <motion.button
              key={factor.id}
              type="button"
              onClick={() => handleFactorToggle(factor.id)}
              className={`py-3 px-4 rounded-lg text-sm text-left ${
                selectedFactors.includes(factor.id)
                  ? 'bg-primary/10 text-primary border border-primary/30 shadow-md'
                  : 'bg-white/50 backdrop-blur-sm text-gray-700 hover:bg-white/80 border border-gray-100'
              }`}
              whileHover={{
                scale: 1.02,
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
              }}
              whileTap={{ scale: 0.98 }}
              animate={selectedFactors.includes(factor.id) ? {
                boxShadow: [
                  '0 0 0 rgba(139, 92, 246, 0)',
                  '0 0 8px rgba(139, 92, 246, 0.3)',
                  '0 0 0 rgba(139, 92, 246, 0)',
                ],
              } : {}}
              transition={{
                boxShadow: { repeat: Infinity, duration: 2 },
                scale: { duration: 0.2 }
              }}
            >
              {factor.label}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Notes */}
      <div className="mb-8">
        <label htmlFor="notes" className="block text-sm font-medium text-primary-dark mb-3">
          Notes (Optional)
        </label>

        <motion.div
          whileHover={{ boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)' }}
          className="relative"
        >
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="w-full px-4 py-3 bg-white/70 backdrop-blur-sm border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all duration-200"
            placeholder="Add any additional thoughts or reflections..."
          />

          {/* Subtle decoration */}
          <div
            className="absolute -bottom-1 -right-1 w-12 h-12 rounded-br-lg opacity-10 pointer-events-none"
            style={{
              background: `radial-gradient(circle, ${
                moodCategory === 'happy' ? '#10B981' :
                moodCategory === 'calm' ? '#3B82F6' :
                moodCategory === 'energetic' ? '#F59E0B' :
                moodCategory === 'sad' ? '#6B7280' :
                moodCategory === 'anxious' ? '#8B5CF6' :
                moodCategory === 'angry' ? '#EF4444' : '#8B5CF6'
              } 0%, transparent 70%)`
            }}
          />
        </motion.div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <MoodAdaptiveElement
          type="custom"
          className="relative"
          animate={true}
        >
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <LoadingButton
              type="submit"
              isLoading={isSubmitting}
              loadingText="Saving..."
              disabled={isSubmitting}
              className="px-6 py-3 bg-primary text-white rounded-lg shadow-md hover:shadow-lg hover:bg-primary-dark transition-all duration-200"
              style={{
                backgroundColor: moodCategories[moodCategory].color,
              }}
            >
              {existingEntry ? 'Update Mood Entry' : 'Save Mood Entry'}
            </LoadingButton>
          </motion.div>
        </MoodAdaptiveElement>
      </div>
    </form>
  )
}
