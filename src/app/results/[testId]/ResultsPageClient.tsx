'use client'

import { useState } from 'react'
import Navigation from '@/components/Navigation'
import { useParams } from 'next/navigation'
import ShareResultsButton from '@/components/ShareResultsButton'
import { useNotification } from '@/context/NotificationContext'
import { handleApiError, formatError } from '@/lib/errorHandling'
import PageTransition from '@/components/animations/PageTransition'
import FadeIn from '@/components/animations/FadeIn'
import StaggeredList from '@/components/animations/StaggeredList'
import LoadingSpinner from '@/components/animations/LoadingSpinner'
import AuraDisplay from '@/components/visualizations/AuraDisplay'
import SoundscapePlayer from '@/components/audio/SoundscapePlayer'

interface ResultsPageClientProps {
  traits: { [key: string]: number }
  insights: string[]
  completedAt: Date
}

export default function ResultsPageClient({ traits, insights = [], completedAt }: ResultsPageClientProps) {
  const params = useParams()
  const testId = params.testId as string

  const [isGenerating, setIsGenerating] = useState(false)
  const [localInsights, setLocalInsights] = useState<string[]>(insights)
  const { showNotification } = useNotification()

  const generateInsights = async () => {
    setIsGenerating(true)

    try {
      const response = await fetch('/api/insights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ testId }),
      })

      if (!response.ok) {
        const errorMessage = await handleApiError(response)
        throw new Error(errorMessage)
      }

      const data = await response.json()
      setLocalInsights(data.insights)
      showNotification('success', 'Personality insights generated successfully!')
    } catch (err) {
      const errorMessage = formatError(err)
      showNotification('error', `Failed to generate insights: ${errorMessage}`)
      console.error('Error generating insights:', err)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <main className="container mx-auto py-8">
          <div className="max-w-4xl mx-auto">
            <FadeIn>
              <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Your Personality Test Results</h1>
                <ShareResultsButton testId={testId} />
              </div>
            </FadeIn>

            {/* Aura Visualization */}
            <FadeIn delay={0.1}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div className="bg-white rounded-lg shadow-md p-6">
                  <AuraDisplay traits={traits} />
                </div>

                {/* Trait Scores */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-semibold mb-4">Trait Scores</h2>
                  <div className="space-y-4">
                    {Object.entries(traits).map(([trait, score], index) => (
                      <FadeIn key={trait} delay={0.1 + index * 0.05}>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="capitalize">{trait}</span>
                            <span className="font-medium">{score.toFixed(1)}/5</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div
                              className="bg-blue-600 h-2.5 rounded-full transition-all duration-1000"
                              style={{ width: `${(score / 5) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      </FadeIn>
                    ))}
                  </div>
                </div>
              </div>
            </FadeIn>

            {/* Insights */}
            <FadeIn delay={0.2}>
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Personality Insights</h2>
                  {localInsights.length === 0 && !isGenerating && (
                    <button
                      onClick={generateInsights}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                      disabled={isGenerating}
                    >
                      Generate Insights
                    </button>
                  )}
                </div>

                {isGenerating && (
                  <div className="flex justify-center items-center py-8">
                    <LoadingSpinner size="md" color="primary" />
                    <span className="ml-3 text-gray-600">Generating insights...</span>
                  </div>
                )}

                {!isGenerating && localInsights.length === 0 && (
                  <p className="text-gray-600 py-4">
                    No insights available yet. Click the button above to generate AI-powered insights based on your test results.
                  </p>
                )}

                {localInsights.length > 0 && (
                  <StaggeredList className="space-y-4">
                    {localInsights.map((insight, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        <div className="flex-shrink-0 w-2 h-2 mt-2 rounded-full bg-blue-600"></div>
                        <p className="text-gray-700">{insight}</p>
                      </div>
                    ))}
                  </StaggeredList>
                )}
              </div>
            </FadeIn>

            {/* Soundscape Player */}
            <FadeIn delay={0.3}>
              <div className="mt-8 mb-8">
                <SoundscapePlayer traits={traits} />
              </div>
            </FadeIn>

            {/* Test Completion Date */}
            <FadeIn delay={0.4}>
              <div className="mt-8 text-center text-gray-600">
                Test completed on {completedAt.toLocaleDateString()}
              </div>
            </FadeIn>
          </div>
        </main>
      </div>
    </PageTransition>
  )
}