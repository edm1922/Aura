'use client'

import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useOnboarding } from '@/context/OnboardingContext'
import OnboardingProgress from '@/components/onboarding/OnboardingProgress'
import OnboardingTip from '@/components/onboarding/OnboardingTip'
import PageTransition from '@/components/animations/PageTransition'
import AuraDisplay from '@/components/visualizations/AuraDisplay'
import PersonalizedGreeting from '@/components/dashboard/PersonalizedGreeting'
import DailyAffirmation from '@/components/dashboard/DailyAffirmation'
import SoundscapePlayer from '@/components/audio/SoundscapePlayer'
import MoodTracker from '@/components/mood/MoodTracker'
import AuraProgress from '@/components/progress/AuraProgress'
import PersonalRecommendations from '@/components/recommendations/PersonalRecommendations'
import GlassCard, { GlassCardHeader, GlassCardTitle, GlassCardContent, GlassCardFooter } from '@/components/ui/GlassCard'
import Button from '@/components/ui/Button'
import { BeakerIcon, ClockIcon, UserCircleIcon } from '@heroicons/react/24/outline'

export default function DashboardClient() {
  const { data: session } = useSession()
  const { hasCompletedOnboarding, startOnboarding } = useOnboarding()
  const [latestTestTraits, setLatestTestTraits] = useState<any>(null)
  const [isLoadingTraits, setIsLoadingTraits] = useState(true)

  // Fetch the user's latest test results with timeout and error handling
  useEffect(() => {
    const fetchLatestTestResult = async () => {
      if (!session?.user?.id) {
        setIsLoadingTraits(false)
        return
      }

      try {
        setIsLoadingTraits(true)

        // Create a timeout promise to prevent hanging requests
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Request timeout')), 5000)
        })

        // Fetch with timeout
        const fetchPromise = fetch('/api/test/latest')
        const response = await Promise.race([fetchPromise, timeoutPromise]) as Response

        if (response.ok) {
          const data = await response.json()
          if (data.traits) {
            setLatestTestTraits(data.traits)
          }
        } else {
          // Handle error responses
          console.error('Error response from API:', response.status, response.statusText)

          // Use mock data as fallback for better user experience
          const mockTraits = {
            openness: 3.5,
            conscientiousness: 3.2,
            extraversion: 2.8,
            agreeableness: 3.7,
            neuroticism: 2.5
          }

          // Only use mock data in development
          if (process.env.NODE_ENV === 'development') {
            console.info('Using mock traits data as fallback')
            setLatestTestTraits(mockTraits)
          }
        }
      } catch (error) {
        console.error('Error fetching latest test result:', error)

        // Don't block the UI on errors - allow the dashboard to load without traits
        // This prevents the entire dashboard from becoming unresponsive
      } finally {
        setIsLoadingTraits(false)
      }
    }

    // Add a small delay before fetching to prevent multiple simultaneous API calls
    const timer = setTimeout(() => {
      fetchLatestTestResult()
    }, 100)

    return () => clearTimeout(timer)
  }, [session?.user?.id])

  // Show the onboarding tour if the user hasn't completed it
  useEffect(() => {
    if (!hasCompletedOnboarding) {
      // Wait a bit before showing the tour to ensure the page is fully loaded
      const timer = setTimeout(() => {
        startOnboarding()
      }, 1500)

      return () => clearTimeout(timer)
    }
  }, [hasCompletedOnboarding, startOnboarding])

  return (
    <PageTransition>
      <div className="px-4 py-6 sm:px-0">
        <GlassCard className="backdrop-blur-md">
          <PersonalizedGreeting
            userName={session?.user?.name || 'User'}
            traits={latestTestTraits}
          />
        </GlassCard>

        {!hasCompletedOnboarding && (
          <div className="mt-6">
            <OnboardingTip
              id="dashboard-welcome"
              title="Welcome to your dashboard!"
              content="This is where you can start new tests, view your history, and manage your profile. Complete the tasks below to get started."
            />
          </div>
        )}

        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-4">
          <div className="lg:col-span-3">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {/* Start New Test Card */}
              <GlassCard hoverEffect id="start-test-card">
                <GlassCardHeader>
                  <div className="flex items-center">
                    <div className="p-2 rounded-full bg-primary/10 mr-3">
                      <BeakerIcon className="h-5 w-5 text-primary" />
                    </div>
                    <GlassCardTitle>Start New Test</GlassCardTitle>
                  </div>
                </GlassCardHeader>
                <GlassCardContent>
                  <p className="text-sm text-text-light">
                    Take a new personality assessment to gain fresh insights.
                  </p>
                </GlassCardContent>
                <GlassCardFooter>
                  <Link href="/test" className="block w-full">
                    <Button
                      variant="primary"
                      fullWidth
                      glowEffect
                    >
                      Begin Test
                    </Button>
                  </Link>
                </GlassCardFooter>
              </GlassCard>

              {/* View History Card */}
              <GlassCard hoverEffect>
                <GlassCardHeader>
                  <div className="flex items-center">
                    <div className="p-2 rounded-full bg-accent/10 mr-3">
                      <ClockIcon className="h-5 w-5 text-accent" />
                    </div>
                    <GlassCardTitle>Test History</GlassCardTitle>
                  </div>
                </GlassCardHeader>
                <GlassCardContent>
                  <p className="text-sm text-text-light">
                    Review your previous test results and track your progress.
                  </p>
                </GlassCardContent>
                <GlassCardFooter>
                  <Link href="/test/history" className="block w-full">
                    <Button
                      variant="outline"
                      fullWidth
                    >
                      View History
                    </Button>
                  </Link>
                </GlassCardFooter>
              </GlassCard>

              {/* Profile Card */}
              <GlassCard hoverEffect>
                <GlassCardHeader>
                  <div className="flex items-center">
                    <div className="p-2 rounded-full bg-accent-alt/10 mr-3">
                      <UserCircleIcon className="h-5 w-5 text-accent-alt" />
                    </div>
                    <GlassCardTitle>Your Profile</GlassCardTitle>
                  </div>
                </GlassCardHeader>
                <GlassCardContent>
                  <p className="text-sm text-text-light">
                    Manage your account settings and personal information.
                  </p>
                </GlassCardContent>
                <GlassCardFooter>
                  <Link href="/profile" className="block w-full">
                    <Button
                      variant="outline"
                      fullWidth
                    >
                      Edit Profile
                    </Button>
                  </Link>
                </GlassCardFooter>
              </GlassCard>
            </div>

            {/* Aura Visualization - Only show if user has taken a test */}
            {latestTestTraits && (
              <div className="mt-6">
                <AuraDisplay
                  traits={latestTestTraits}
                  userName={session?.user?.name || 'User'}
                />
              </div>
            )}

            {/* Mood Tracker - Only show if user has taken a test */}
            {latestTestTraits && session?.user?.id && (
              <div className="mt-6">
                <MoodTracker
                  userId={session.user.id}
                  traits={latestTestTraits}
                />
              </div>
            )}

            {/* Personalized Recommendations - Only show if user has taken a test */}
            {latestTestTraits && session?.user?.id && (
              <div className="mt-6">
                <PersonalRecommendations />
              </div>
            )}

            {/* No Test Results Message */}
            {!isLoadingTraits && !latestTestTraits && (
              <GlassCard className="mt-6 text-center animate-pulse-slow" glowEffect>
                <GlassCardContent>
                  <h3 className="text-xl font-serif font-medium text-primary-dark mb-2">
                    Your Aura Awaits
                  </h3>
                  <p className="text-text-light mb-6">
                    Take your first personality test to see your unique aura visualization!
                  </p>
                  <div className="flex justify-center">
                    <Link href="/test">
                      <Button
                        variant="primary"
                        size="lg"
                        glowEffect
                      >
                        Start Test Now
                      </Button>
                    </Link>
                  </div>
                </GlassCardContent>
              </GlassCard>
            )}
          </div>

          {/* Sidebar: Onboarding Progress, Aura Info, or Daily Affirmation */}
          <div className="lg:col-span-1 space-y-6">
            {/* Onboarding Progress (only if not completed) */}
            {!hasCompletedOnboarding && (
              <OnboardingProgress />
            )}

            {/* Aura Info (only if test results exist) */}
            {hasCompletedOnboarding && latestTestTraits && (
              <GlassCard>
                <GlassCardHeader>
                  <GlassCardTitle>About Your Aura</GlassCardTitle>
                </GlassCardHeader>
                <GlassCardContent>
                  <p className="text-sm text-text-light mb-3">
                    Your aura visualization is a unique representation of your personality traits.
                  </p>
                  <ul className="text-sm space-y-2">
                    <li className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-primary mr-2"></div>
                      <span className="text-primary font-medium">Purple hues</span>
                      <span className="text-text-light ml-1">reflect openness to experience</span>
                    </li>
                    <li className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-secondary mr-2"></div>
                      <span className="text-secondary font-medium">Green tones</span>
                      <span className="text-text-light ml-1">show conscientiousness</span>
                    </li>
                    <li className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-accent mr-2"></div>
                      <span className="text-accent font-medium">Blue colors</span>
                      <span className="text-text-light ml-1">represent extraversion</span>
                    </li>
                    <li className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-accent-alt mr-2"></div>
                      <span className="text-accent-alt font-medium">Gold/yellow</span>
                      <span className="text-text-light ml-1">indicates agreeableness</span>
                    </li>
                    <li className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                      <span className="text-red-500 font-medium">Red intensity</span>
                      <span className="text-text-light ml-1">shows emotional sensitivity</span>
                    </li>
                  </ul>
                </GlassCardContent>
                <GlassCardFooter>
                  <p className="text-sm text-text-light text-center italic">
                    Take another test anytime to see how your aura might change!
                  </p>
                </GlassCardFooter>
              </GlassCard>
            )}

            {/* Daily Affirmation (only if test results exist) */}
            {latestTestTraits && (
              <DailyAffirmation traits={latestTestTraits} />
            )}

            {/* Soundscape Player (only if test results exist) */}
            {latestTestTraits && (
              <SoundscapePlayer traits={latestTestTraits} className="mt-6" />
            )}

            {/* Aura Progress (only if user is logged in) */}
            {session?.user?.id && (
              <AuraProgress userId={session.user.id} className="mt-6" />
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  )
}
