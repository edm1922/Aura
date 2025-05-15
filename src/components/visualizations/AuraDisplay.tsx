'use client'

import { useState, useEffect } from 'react'
import AuraOrbToggle from './AuraOrbToggle'
import { motion } from 'framer-motion'

interface AuraDisplayProps {
  traits?: {
    openness?: number
    conscientiousness?: number
    extraversion?: number
    agreeableness?: number
    neuroticism?: number
  }
  userName?: string
  className?: string
}

export default function AuraDisplay({
  traits = {},
  userName = 'User',
  className = '',
}: AuraDisplayProps) {
  const [auraDescription, setAuraDescription] = useState('')
  const [auraTitle, setAuraTitle] = useState('')

  // Generate aura description based on traits
  useEffect(() => {
    const {
      openness = 3,
      conscientiousness = 3,
      extraversion = 3,
      agreeableness = 3,
      neuroticism = 3,
    } = traits

    // Determine dominant traits (top 2)
    const traitValues = [
      { name: 'openness', value: openness },
      { name: 'conscientiousness', value: conscientiousness },
      { name: 'extraversion', value: extraversion },
      { name: 'agreeableness', value: agreeableness },
      { name: 'neuroticism', value: neuroticism },
    ]

    const sortedTraits = [...traitValues].sort((a, b) => b.value - a.value)
    const dominantTraits = sortedTraits.slice(0, 2).map(t => t.name)

    // Generate aura title based on dominant traits
    let title = ''
    if (dominantTraits.includes('openness') && dominantTraits.includes('extraversion')) {
      title = 'Radiant Explorer'
    } else if (dominantTraits.includes('openness') && dominantTraits.includes('conscientiousness')) {
      title = 'Structured Innovator'
    } else if (dominantTraits.includes('openness') && dominantTraits.includes('agreeableness')) {
      title = 'Harmonious Visionary'
    } else if (dominantTraits.includes('openness') && dominantTraits.includes('neuroticism')) {
      title = 'Sensitive Creator'
    } else if (dominantTraits.includes('conscientiousness') && dominantTraits.includes('extraversion')) {
      title = 'Dynamic Achiever'
    } else if (dominantTraits.includes('conscientiousness') && dominantTraits.includes('agreeableness')) {
      title = 'Supportive Organizer'
    } else if (dominantTraits.includes('conscientiousness') && dominantTraits.includes('neuroticism')) {
      title = 'Careful Perfectionist'
    } else if (dominantTraits.includes('extraversion') && dominantTraits.includes('agreeableness')) {
      title = 'Social Harmonizer'
    } else if (dominantTraits.includes('extraversion') && dominantTraits.includes('neuroticism')) {
      title = 'Expressive Reactor'
    } else if (dominantTraits.includes('agreeableness') && dominantTraits.includes('neuroticism')) {
      title = 'Empathetic Sensor'
    } else {
      // Fallback for balanced traits
      title = 'Balanced Aura'
    }

    setAuraTitle(title)

    // Generate description based on overall trait profile
    let description = ''

    // Openness influence
    if (openness >= 4) {
      description += 'Your aura radiates with creative energy and curiosity. '
    } else if (openness <= 2) {
      description += 'Your aura shows a grounded, practical energy. '
    }

    // Conscientiousness influence
    if (conscientiousness >= 4) {
      description += 'It has a structured, organized pattern that reflects your disciplined nature. '
    } else if (conscientiousness <= 2) {
      description += 'It flows freely with spontaneous, flexible patterns. '
    }

    // Extraversion influence
    if (extraversion >= 4) {
      description += 'Your aura pulses outward with vibrant social energy. '
    } else if (extraversion <= 2) {
      description += 'It contains deep, reflective pools of introspective energy. '
    }

    // Agreeableness influence
    if (agreeableness >= 4) {
      description += 'Warm, harmonious tones reflect your compassionate spirit. '
    } else if (agreeableness <= 2) {
      description += 'Direct, focused energy shows your independent mindset. '
    }

    // Neuroticism influence
    if (neuroticism >= 4) {
      description += 'Sensitive ripples show your emotional responsiveness to the world around you.'
    } else if (neuroticism <= 2) {
      description += 'A stable, resilient core anchors your emotional experience.'
    }

    // If description is empty (all traits are moderate), provide a default
    if (!description) {
      description = 'Your aura shows a balanced blend of energies, with no single trait dominating your personality profile.'
    }

    setAuraDescription(description)
  }, [traits])

  return (
    <div className={`glass rounded-xl overflow-hidden ${className}`}>
      <div className="p-6 relative">
        {/* Background gradient effect */}
        <div
          className="absolute inset-0 opacity-10 -z-10"
          style={{
            background: `radial-gradient(circle at center,
              ${traits.openness ? `hsl(280, ${70 + traits.openness * 5}%, ${50 + traits.openness * 5}%)` : 'hsl(280, 80%, 60%)'} 0%,
              ${traits.conscientiousness ? `hsl(120, ${70 + traits.conscientiousness * 5}%, ${50 + traits.conscientiousness * 5}%)` : 'hsl(120, 80%, 60%)'} 35%,
              ${traits.extraversion ? `hsl(210, ${70 + traits.extraversion * 5}%, ${50 + traits.extraversion * 5}%)` : 'hsl(210, 80%, 60%)'} 70%,
              transparent 100%)`,
          }}
        />

        <h3 className="text-xl font-serif font-medium text-primary text-center mb-4">
          Your Aura Visualization
        </h3>

        <div className="flex flex-col items-center">
          {/* Aura Orb with enhanced animation */}
          <div className="relative">
            <AuraOrbToggle traits={traits} size="lg" animated={true} defaultMode="3d" showToggle={true} />
          </div>

          {/* Aura Title and Description */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="mt-6 text-center max-w-md"
          >
            <motion.h4
              className="text-2xl font-serif font-semibold"
              style={{ color: traits.openness ? `hsl(280, ${70 + traits.openness * 5}%, ${50 + traits.openness * 5}%)` : 'hsl(280, 80%, 60%)' }}
              animate={{
                color: [
                  traits.openness ? `hsl(280, ${70 + traits.openness * 5}%, ${50 + traits.openness * 5}%)` : 'hsl(280, 80%, 60%)',
                  traits.conscientiousness ? `hsl(120, ${70 + traits.conscientiousness * 5}%, ${50 + traits.conscientiousness * 5}%)` : 'hsl(120, 80%, 60%)',
                  traits.extraversion ? `hsl(210, ${70 + traits.extraversion * 5}%, ${50 + traits.extraversion * 5}%)` : 'hsl(210, 80%, 60%)',
                  traits.openness ? `hsl(280, ${70 + traits.openness * 5}%, ${50 + traits.openness * 5}%)` : 'hsl(280, 80%, 60%)',
                ]
              }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              {auraTitle}
            </motion.h4>

            <p className="mt-3 text-text-light leading-relaxed">
              {auraDescription}
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
