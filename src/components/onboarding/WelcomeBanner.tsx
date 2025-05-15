'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { useOnboarding } from '@/context/OnboardingContext'
import { useSession } from 'next-auth/react'

export default function WelcomeBanner() {
  const [isVisible, setIsVisible] = useState(false)
  const [hasBeenDismissed, setHasBeenDismissed] = useState(false)
  const { startOnboarding } = useOnboarding()
  const { data: session } = useSession()

  useEffect(() => {
    // Check if the banner has been dismissed before
    const dismissed = localStorage.getItem('welcome-banner-dismissed') === 'true'
    setHasBeenDismissed(dismissed)

    // Only show the banner if the user is logged in and hasn't dismissed it
    if (session?.user && !dismissed) {
      // Delay showing the banner for a better UX
      const timer = setTimeout(() => {
        setIsVisible(true)
      }, 1000)

      return () => clearTimeout(timer)
    }
  }, [session])

  const handleDismiss = () => {
    setIsVisible(false)
    localStorage.setItem('welcome-banner-dismissed', 'true')
    setHasBeenDismissed(true)
  }

  const handleStartTour = () => {
    handleDismiss()
    startOnboarding()
  }

  if (!isVisible || hasBeenDismissed || !session?.user) {
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="fixed top-4 left-1/2 transform -translate-x-1/2 z-40 w-full max-w-md"
    >
      <div className="bg-white rounded-lg shadow-lg border border-blue-100 p-4 mx-4">
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
          aria-label="Dismiss welcome banner"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>

        <div className="flex items-center">
          <div className="flex-shrink-0 bg-blue-100 rounded-full p-2">
            <svg
              className="h-6 w-6 text-blue-600"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div className="ml-3 flex-1">
            <h3 className="text-sm font-medium text-gray-900">Welcome to Aura!</h3>
            <p className="mt-1 text-sm text-gray-500">
              Would you like a quick tour to learn how to use the app?
            </p>
            <div className="mt-2">
              <button
                onClick={handleStartTour}
                className="text-sm font-medium text-blue-600 hover:text-blue-500"
              >
                Take the tour
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
