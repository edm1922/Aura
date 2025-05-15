'use client'

import Link from 'next/link'
import { EyeIcon } from '@heroicons/react/24/outline'
import PageTransition from '@/components/animations/PageTransition'
import FadeIn from '@/components/animations/FadeIn'
import StaggeredList from '@/components/animations/StaggeredList'
import SharedAuraDisplay from '@/components/visualizations/SharedAuraDisplay'
import SoundscapePlayer from '@/components/audio/SoundscapePlayer'

interface SharedResultsViewProps {
  traits: { [key: string]: number }
  insights: string[]
  completedAt: Date
  viewCount: number
}

export default function SharedResultsView({
  traits,
  insights,
  completedAt,
  viewCount,
}: SharedResultsViewProps) {
  return (
    <PageTransition>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <h1 className="text-xl font-semibold text-gray-800">Personality Test Results</h1>
            <div className="flex items-center text-sm text-gray-500">
              <EyeIcon className="h-4 w-4 mr-1" />
              <span>{viewCount} {viewCount === 1 ? 'view' : 'views'}</span>
            </div>
          </div>
        </header>

        <main className="container mx-auto py-8 px-4">
          <div className="max-w-4xl mx-auto">
            <FadeIn>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
                <p className="text-blue-800">
                  These are shared personality test results. Want to discover your own personality traits?
                  <Link href="/" className="font-medium ml-1 underline">
                    Take the test now
                  </Link>
                </p>
              </div>
            </FadeIn>

            {/* Aura Visualization and Trait Scores */}
            <FadeIn delay={0.1}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                {/* Aura Visualization */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-semibold mb-4">Personality Aura</h2>
                  <SharedAuraDisplay traits={traits} />
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
            {insights && insights.length > 0 && (
              <FadeIn delay={0.2}>
                <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                  <h2 className="text-xl font-semibold mb-4">Personality Insights</h2>
                  <StaggeredList className="space-y-4">
                    {insights.map((insight, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        <div className="flex-shrink-0 w-2 h-2 mt-2 rounded-full bg-blue-600"></div>
                        <p className="text-gray-700">{insight}</p>
                      </div>
                    ))}
                  </StaggeredList>
                </div>
              </FadeIn>
            )}

            {/* Soundscape Player */}
            <FadeIn delay={0.3}>
              <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <SoundscapePlayer traits={traits} />
              </div>
            </FadeIn>

            {/* Test Completion Date */}
            <FadeIn delay={0.4}>
              <div className="text-center text-gray-600">
                Test completed on {new Date(completedAt).toLocaleDateString()}
              </div>
            </FadeIn>

            {/* Call to Action */}
            <FadeIn delay={0.4}>
              <div className="mt-8 text-center">
                <Link
                  href="/auth/signup"
                  className="inline-block px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create Your Own Personality Profile
                </Link>
              </div>
            </FadeIn>
          </div>
        </main>
      </div>
    </PageTransition>
  )
}
