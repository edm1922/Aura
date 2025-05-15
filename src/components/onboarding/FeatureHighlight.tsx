'use client'

import { useState, useEffect, useRef, ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { XMarkIcon } from '@heroicons/react/24/outline'

interface FeatureHighlightProps {
  targetId: string
  title: string
  description: string
  position?: 'top' | 'right' | 'bottom' | 'left'
  onDismiss?: () => void
  isVisible: boolean
  children?: ReactNode
}

export default function FeatureHighlight({
  targetId,
  title,
  description,
  position = 'bottom',
  onDismiss,
  isVisible,
  children,
}: FeatureHighlightProps) {
  const [coords, setCoords] = useState({ x: 0, y: 0, width: 0, height: 0 })
  const tooltipRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isVisible) return

    const updatePosition = () => {
      const targetElement = document.getElementById(targetId)
      if (!targetElement) return

      const rect = targetElement.getBoundingClientRect()
      setCoords({
        x: rect.left + window.scrollX,
        y: rect.top + window.scrollY,
        width: rect.width,
        height: rect.height,
      })
    }

    updatePosition()
    window.addEventListener('resize', updatePosition)
    window.addEventListener('scroll', updatePosition)

    return () => {
      window.removeEventListener('resize', updatePosition)
      window.removeEventListener('scroll', updatePosition)
    }
  }, [targetId, isVisible])

  if (!isVisible) return null

  const getTooltipPosition = () => {
    if (!tooltipRef.current) {
      return { top: 0, left: 0 }
    }

    const tooltipRect = tooltipRef.current.getBoundingClientRect()
    const tooltipWidth = tooltipRect.width
    const tooltipHeight = tooltipRect.height

    switch (position) {
      case 'top':
        return {
          top: coords.y - tooltipHeight - 10,
          left: coords.x + coords.width / 2 - tooltipWidth / 2,
        }
      case 'right':
        return {
          top: coords.y + coords.height / 2 - tooltipHeight / 2,
          left: coords.x + coords.width + 10,
        }
      case 'left':
        return {
          top: coords.y + coords.height / 2 - tooltipHeight / 2,
          left: coords.x - tooltipWidth - 10,
        }
      case 'bottom':
      default:
        return {
          top: coords.y + coords.height + 10,
          left: coords.x + coords.width / 2 - tooltipWidth / 2,
        }
    }
  }

  const tooltipPosition = getTooltipPosition()

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 pointer-events-none">
        {/* Highlight overlay */}
        <div className="absolute inset-0 bg-black/50 pointer-events-auto">
          <div
            className="absolute bg-transparent"
            style={{
              top: coords.y - 4,
              left: coords.x - 4,
              width: coords.width + 8,
              height: coords.height + 8,
              boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)',
              borderRadius: '4px',
            }}
          />
        </div>

        {/* Tooltip */}
        <motion.div
          ref={tooltipRef}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="absolute bg-white rounded-lg shadow-lg p-4 max-w-xs pointer-events-auto"
          style={{
            top: tooltipPosition.top,
            left: tooltipPosition.left,
          }}
        >
          <button
            onClick={onDismiss}
            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
            aria-label="Dismiss feature highlight"
          >
            <XMarkIcon className="h-4 w-4" />
          </button>

          <h3 className="text-sm font-medium text-gray-900 mb-1">{title}</h3>
          <p className="text-xs text-gray-600">{description}</p>

          {children && <div className="mt-3">{children}</div>}
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
