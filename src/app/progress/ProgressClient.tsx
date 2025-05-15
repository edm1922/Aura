'use client'

import { useState, useEffect } from 'react'
import { useNotification } from '@/context/NotificationContext'
import PageTransition from '@/components/animations/PageTransition'
import FadeIn from '@/components/animations/FadeIn'
import AuraProgress from '@/components/progress/AuraProgress'
import AchievementsGrid from '@/components/progress/AchievementsGrid'
import { UserProgress } from '@/lib/progressTracker'
import { SparklesIcon, TrophyIcon } from '@heroicons/react/24/outline'

interface ProgressClientProps {
  userId: string
  traits: Record<string, number> | null
}

export default function ProgressClient({ userId, traits }: ProgressClientProps) {
  const { showNotification } = useNotification()
  const [progress, setProgress] = useState<UserProgress | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  
  // Fetch user progress
  useEffect(() => {
    const fetchUserProgress = async () => {
      try {
        setIsLoading(true)
        const response = await fetch('/api/progress')
        
        if (response.ok) {
          const data = await response.json()
          setProgress(data.progress)
        } else {
          showNotification('error', 'Failed to fetch progress data')
        }
      } catch (error) {
        console.error('Error fetching progress:', error)
        showNotification('error', 'An error occurred while loading your progress')
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchUserProgress()
  }, [userId, showNotification])
  
  return (
    <PageTransition>
      <div className="px-4 py-6 sm:px-0">
        <FadeIn>
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <SparklesIcon className="h-6 w-6 mr-2 text-primary" />
              Your Aura Journey
            </h1>
          </div>
        </FadeIn>
        
        {isLoading ? (
          <div className="flex justify-center items-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Progress Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Aura Progress */}
              <div className="md:col-span-1">
                <FadeIn delay={0.1}>
                  <AuraProgress userId={userId} />
                </FadeIn>
              </div>
              
              {/* Level Benefits */}
              <div className="md:col-span-2">
                <FadeIn delay={0.2}>
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-lg font-medium text-gray-900 flex items-center mb-4">
                      <TrophyIcon className="h-5 w-5 mr-2 text-primary" />
                      Aura Growth Benefits
                    </h2>
                    
                    <div className="space-y-4">
                      <div className="p-4 border border-green-100 rounded-md bg-green-50">
                        <h3 className="text-sm font-medium text-green-800 mb-2">
                          Why grow your aura?
                        </h3>
                        <p className="text-sm text-green-700">
                          As you use the app, complete tests, track your mood, and engage with insights, 
                          your aura grows stronger. A stronger aura unlocks new features, personalized 
                          experiences, and deeper insights into your personality.
                        </p>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="p-4 border border-gray-200 rounded-md">
                          <h3 className="text-sm font-medium text-gray-800 mb-2">
                            Level 1-5 Benefits
                          </h3>
                          <ul className="text-sm text-gray-600 space-y-1">
                            <li>• Basic personality insights</li>
                            <li>• Aura visualization</li>
                            <li>• Mood tracking</li>
                            <li>• Test history</li>
                          </ul>
                        </div>
                        
                        <div className="p-4 border border-gray-200 rounded-md">
                          <h3 className="text-sm font-medium text-gray-800 mb-2">
                            Level 6-10 Benefits
                          </h3>
                          <ul className="text-sm text-gray-600 space-y-1">
                            <li>• Advanced personality insights</li>
                            <li>• Personalized recommendations</li>
                            <li>• Trait comparison</li>
                            <li>• Enhanced aura visualization</li>
                          </ul>
                        </div>
                        
                        <div className="p-4 border border-gray-200 rounded-md">
                          <h3 className="text-sm font-medium text-gray-800 mb-2">
                            Level 11-15 Benefits
                          </h3>
                          <ul className="text-sm text-gray-600 space-y-1">
                            <li>• Deep personality analysis</li>
                            <li>• Trait improvement suggestions</li>
                            <li>• Personalized growth plan</li>
                            <li>• Advanced mood analytics</li>
                          </ul>
                        </div>
                        
                        <div className="p-4 border border-gray-200 rounded-md">
                          <h3 className="text-sm font-medium text-gray-800 mb-2">
                            Level 16-20 Benefits
                          </h3>
                          <ul className="text-sm text-gray-600 space-y-1">
                            <li>• Expert-level personality insights</li>
                            <li>• Exclusive aura themes</li>
                            <li>• Predictive mood analysis</li>
                            <li>• Personalized coaching</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </FadeIn>
              </div>
            </div>
            
            {/* Achievements */}
            {progress && (
              <FadeIn delay={0.3}>
                <AchievementsGrid achievements={progress.achievements} />
              </FadeIn>
            )}
          </div>
        )}
      </div>
    </PageTransition>
  )
}
