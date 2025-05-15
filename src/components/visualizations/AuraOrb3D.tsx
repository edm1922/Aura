'use client'

import { useRef, useState, useEffect, Suspense } from 'react'
import dynamic from 'next/dynamic'
import { motion } from 'framer-motion'

// Dynamically import Three.js components to avoid SSR issues
const SimpleThreeOrb = dynamic(() => import('./SimpleThreeOrb'), { ssr: false })

interface AuraOrbProps {
  traits?: {
    openness?: number
    conscientiousness?: number
    extraversion?: number
    agreeableness?: number
    neuroticism?: number
  }
  size?: 'sm' | 'md' | 'lg' | 'xl'
  animated?: boolean
  className?: string
  interactive?: boolean
}

// Helper function to convert trait values to colors
const getTraitColor = (trait: number, baseHue: number, alpha: number = 1): string => {
  // Scale trait from 1-5 to 0-1
  const normalizedTrait = (trait - 1) / 4

  // Calculate hue, saturation, and lightness based on trait value
  const hue = baseHue + normalizedTrait * 30
  const saturation = 70 + normalizedTrait * 30
  const lightness = 50 + normalizedTrait * 10

  if (alpha < 1) {
    return `hsla(${hue}, ${saturation}%, ${lightness}%, ${alpha})`
  }
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`
}

// Main component
export default function AuraOrb3D({
  traits = {},
  size = 'md',
  animated = true,
  className = '',
  interactive = true,
}: AuraOrbProps) {
  // Size mapping
  const sizeMap = {
    sm: 120,
    md: 200,
    lg: 300,
    xl: 400,
  }

  const orbSize = sizeMap[size]

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className={`relative ${className}`}
      style={{ width: orbSize, height: orbSize }}
    >
      {/* Background glow effect */}
      <div
        className="absolute inset-0 rounded-full blur-xl opacity-30 animate-pulse-slow"
        style={{
          background: `radial-gradient(circle,
            ${getTraitColor(traits.openness || 3, 280, 0.8)} 0%,
            ${getTraitColor(traits.conscientiousness || 3, 120, 0.6)} 35%,
            ${getTraitColor(traits.extraversion || 3, 210, 0.4)} 70%,
            transparent 100%)`,
          transform: 'scale(1.2)',
          zIndex: -1,
        }}
      />

      {/* Canvas for the 3D orb */}
      <Suspense fallback={<div className="w-full h-full flex items-center justify-center">Loading 3D...</div>}>
        <SimpleThreeOrb
          traits={traits}
          animated={animated}
          interactive={interactive}
          size={orbSize}
        />
      </Suspense>
    </motion.div>
  )
}
