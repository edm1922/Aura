'use client'

import { useEffect, Suspense } from 'react'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import OnboardingTour from './OnboardingTour'
import WelcomeBanner from './WelcomeBanner'
import { useOnboarding } from '@/context/OnboardingContext'

// Inner component that uses usePathname
function OnboardingContainerInner() {
  const { data: session } = useSession()
  const pathname = usePathname()
  const { hasCompletedOnboarding, setHasCompletedOnboarding } = useOnboarding()

  // Check if user has completed onboarding when they log in
  useEffect(() => {
    if (session?.user) {
      // In a real app, you might want to fetch this from the user's profile in the database
      const storedValue = localStorage.getItem('aura-onboarding-completed')
      setHasCompletedOnboarding(storedValue === 'true')
    }
  }, [session, setHasCompletedOnboarding])

  // Only show onboarding components on main pages
  const shouldShowOnboarding = [
    '/',
    '/dashboard',
    '/test',
    '/test/new',
    '/history',
    '/profile',
  ].includes(pathname)

  if (!shouldShowOnboarding || !session?.user) {
    return null
  }

  return (
    <>
      <OnboardingTour />
      <WelcomeBanner />
    </>
  )
}

// Wrapper component with Suspense boundary
export default function OnboardingContainer() {
  return (
    <Suspense fallback={null}>
      <OnboardingContainerInner />
    </Suspense>
  )
}
