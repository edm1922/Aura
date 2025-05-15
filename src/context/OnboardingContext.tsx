'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface OnboardingContextType {
  hasCompletedOnboarding: boolean
  setHasCompletedOnboarding: (value: boolean) => void
  currentStep: number
  setCurrentStep: (step: number) => void
  totalSteps: number
  showOnboarding: boolean
  startOnboarding: () => void
  completeOnboarding: () => void
  dismissOnboarding: () => void
  nextStep: () => void
  prevStep: () => void
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined)

const ONBOARDING_STORAGE_KEY = 'aura-onboarding-completed'
const TOTAL_ONBOARDING_STEPS = 4

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(true) // Default to true to avoid flash
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = TOTAL_ONBOARDING_STEPS

  // Check local storage on mount
  useEffect(() => {
    const storedValue = localStorage.getItem(ONBOARDING_STORAGE_KEY)
    const hasCompleted = storedValue === 'true'
    setHasCompletedOnboarding(hasCompleted)
  }, [])

  const startOnboarding = () => {
    setCurrentStep(1)
    setShowOnboarding(true)
  }

  const completeOnboarding = () => {
    localStorage.setItem(ONBOARDING_STORAGE_KEY, 'true')
    setHasCompletedOnboarding(true)
    setShowOnboarding(false)
  }

  const dismissOnboarding = () => {
    setShowOnboarding(false)
  }

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    } else {
      completeOnboarding()
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  return (
    <OnboardingContext.Provider
      value={{
        hasCompletedOnboarding,
        setHasCompletedOnboarding,
        currentStep,
        setCurrentStep,
        totalSteps,
        showOnboarding,
        startOnboarding,
        completeOnboarding,
        dismissOnboarding,
        nextStep,
        prevStep,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  )
}

export function useOnboarding() {
  const context = useContext(OnboardingContext)
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider')
  }
  return context
}
