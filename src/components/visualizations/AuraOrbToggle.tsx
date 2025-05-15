'use client'

import { useState, useEffect, Suspense } from 'react'
import dynamic from 'next/dynamic'
import { motion } from 'framer-motion'

// Dynamically import the 3D orb component to avoid SSR issues
const AuraOrb3D = dynamic(() => import('./AuraOrb3D'), { ssr: false })

interface AuraOrbToggleProps {
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
  showToggle?: boolean
  defaultMode?: string
}

export default function AuraOrbToggle({
  traits = {},
  size = 'md',
  animated = true,
  className = '',
  showToggle = false, // Default to false since we don't need toggle anymore
  defaultMode = '3d', // Default to 3D mode
}: AuraOrbToggleProps) {
  const [isClient, setIsClient] = useState(false)
  const [isLowPerformance, setIsLowPerformance] = useState(false)

  // Check if we're on the client side and detect low performance devices
  useEffect(() => {
    setIsClient(true)

    // Simple performance detection
    const isLowEnd =
      // Check if it's a mobile device
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
      // Or if it's a low-end device (rough estimate based on hardware concurrency)
      (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4)

    setIsLowPerformance(isLowEnd ? true : false)
  }, [])

  // If we're on the server or haven't determined performance yet, render nothing
  if (!isClient) {
    return null
  }

  return (
    <div className={`relative ${className}`}>
      {/* Always render the 3D orb */}
      <div className="relative">
        <Suspense fallback={
          <div className="flex items-center justify-center"
               style={{
                 width: size === 'sm' ? '120px' : size === 'md' ? '200px' : size === 'lg' ? '300px' : '400px',
                 height: size === 'sm' ? '120px' : size === 'md' ? '200px' : size === 'lg' ? '300px' : '400px'
               }}>
            <div className="animate-pulse text-sm text-gray-500">Loading 3D...</div>
          </div>
        }>
          <AuraOrb3D
            traits={traits}
            size={size}
            animated={animated}
            interactive={true}
          />
        </Suspense>
      </div>

      {/* Warning for low performance devices - less intrusive in shared view */}
      {isLowPerformance && (
        <div className="absolute bottom-2 left-2 right-2 flex items-center justify-center bg-black/30 backdrop-blur-sm rounded-lg p-2">
          <div className="text-white text-center">
            <p className="text-xs">3D view may affect performance on this device.</p>
          </div>
        </div>
      )}
    </div>
  )
}
