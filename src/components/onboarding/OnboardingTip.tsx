'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { LightBulbIcon, XMarkIcon } from '@heroicons/react/24/outline'

interface OnboardingTipProps {
  id: string
  title: string
  content: string
  dismissible?: boolean
}

export default function OnboardingTip({
  id,
  title,
  content,
  dismissible = true,
}: OnboardingTipProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Check if this tip has been dismissed before
    const dismissed = localStorage.getItem(`tip-${id}-dismissed`) === 'true'
    if (!dismissed) {
      setIsVisible(true)
    }
  }, [id])

  const handleDismiss = () => {
    setIsVisible(false)
    if (dismissible) {
      localStorage.setItem(`tip-${id}-dismissed`, 'true')
    }
  }

  if (!isVisible) {
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-4"
    >
      <div className="flex">
        <div className="flex-shrink-0">
          <LightBulbIcon className="h-5 w-5 text-blue-600" />
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-blue-800">{title}</h3>
          <div className="mt-1 text-sm text-blue-700">
            <p>{content}</p>
          </div>
        </div>
        {dismissible && (
          <div className="ml-auto pl-3">
            <div className="-mx-1.5 -my-1.5">
              <button
                onClick={handleDismiss}
                className="inline-flex rounded-md p-1.5 text-blue-500 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 focus:ring-offset-blue-50"
              >
                <span className="sr-only">Dismiss</span>
                <XMarkIcon className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}
