'use client'

import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { useOnboarding } from '@/context/OnboardingContext'

const steps = [
  {
    title: 'Welcome to Aura',
    description: 'Discover your personality traits through our AI-powered assessment.',
    image: '/images/onboarding/welcome.svg',
  },
  {
    title: 'Take the Test',
    description: 'Answer a series of questions to help us understand your personality traits.',
    image: '/images/onboarding/test.svg',
  },
  {
    title: 'Get Insights',
    description: 'Receive AI-generated insights about your personality based on your responses.',
    image: '/images/onboarding/insights.svg',
  },
  {
    title: 'Share Your Results',
    description: 'Share your personality profile with friends and compare your traits.',
    image: '/images/onboarding/share.svg',
  },
]

export default function OnboardingTour() {
  const {
    showOnboarding,
    currentStep,
    totalSteps,
    nextStep,
    prevStep,
    dismissOnboarding,
    completeOnboarding,
  } = useOnboarding()

  // Handle escape key to dismiss
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        dismissOnboarding()
      }
    }

    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [dismissOnboarding])

  if (!showOnboarding) return null

  const step = steps[currentStep - 1]

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4"
        >
          {/* Close button */}
          <button
            onClick={dismissOnboarding}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            aria-label="Close onboarding"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>

          {/* Image */}
          <div className="p-6 pb-0">
            <div className="flex justify-center">
              <img
                src={step.image}
                alt={step.title}
                className="h-48 object-contain"
                onError={(e) => {
                  // Fallback if image doesn't exist
                  e.currentTarget.src = 'https://placehold.co/400x300/e2e8f0/64748b?text=Step+' + currentStep
                }}
              />
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">{step.title}</h3>
            <p className="text-gray-600">{step.description}</p>

            {/* Progress dots */}
            <div className="flex justify-center mt-6 mb-4 space-x-2">
              {Array.from({ length: totalSteps }).map((_, index) => (
                <div
                  key={index}
                  className={`h-2 w-2 rounded-full ${
                    index + 1 === currentStep ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>

            {/* Navigation buttons */}
            <div className="flex justify-between mt-4">
              <button
                onClick={prevStep}
                disabled={currentStep === 1}
                className={`px-4 py-2 rounded-md ${
                  currentStep === 1
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Back
              </button>
              <button
                onClick={nextStep}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                {currentStep === totalSteps ? 'Get Started' : 'Next'}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
