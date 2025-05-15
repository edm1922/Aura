import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSession } from 'next-auth/react'
import { useTheme } from '@/context/ThemeContext'
import { useMoodAdaptive } from '@/context/MoodAdaptiveContext'
import LoadingSpinner from '@/components/animations/LoadingSpinner'
import MoodAdaptiveElement from '@/components/ui/MoodAdaptiveElement'

type Recommendation = {
  activities: string[]
  content: string[]
  personalGrowth: string[]
}

export default function PersonalRecommendations() {
  const { data: session } = useSession()
  const { theme } = useTheme()
  const { currentMood, moodTheme } = useMoodAdaptive()
  const [recommendations, setRecommendations] = useState<Recommendation | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('activities')

  useEffect(() => {
    // Only fetch recommendations if the user is logged in
    if (session?.user) {
      // Add a small delay to prevent too many simultaneous API calls
      const timer = setTimeout(() => {
        fetchRecommendations()
      }, 500)

      return () => clearTimeout(timer)
    } else {
      setIsLoading(false)
    }
  }, [session, currentMood])

  const fetchRecommendations = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Create a timeout promise to prevent hanging requests
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout')), 5000)
      })

      // Fetch with timeout
      const fetchPromise = fetch('/api/recommendations')
      const response = await Promise.race([fetchPromise, timeoutPromise]) as Response

      if (!response.ok) {
        throw new Error(`Failed to fetch recommendations: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      setRecommendations(data.recommendations)
    } catch (err) {
      console.error('Error fetching recommendations:', err)
      setError('Unable to load recommendations. Please try again later.')

      // Use mock data in development for better UX
      if (process.env.NODE_ENV === 'development') {
        console.info('Using mock recommendations as fallback')
        setRecommendations({
          activities: [
            'Take a 10-minute mindfulness meditation break',
            'Go for a short walk outside to clear your mind',
            'Try a quick journaling session to organize your thoughts'
          ],
          content: [
            'Read "Atomic Habits" by James Clear for practical self-improvement',
            'Listen to the "Ten Percent Happier" podcast for mindfulness tips',
            'Check out "The School of Life" YouTube channel for philosophical insights'
          ],
          personalGrowth: [
            'Practice setting one small, achievable goal each day',
            'Experiment with the "two-minute rule" for small tasks',
            'Try the "pomodoro technique" to improve focus and productivity'
          ]
        })
        setError(null)
      }
    } finally {
      setIsLoading(false)
    }
  }

  if (!session?.user) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Personalized Recommendations</h2>
        <p className="text-gray-600">Please sign in to view your personalized recommendations.</p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-md flex justify-center items-center min-h-[300px]">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Personalized Recommendations</h2>
        <p className="text-red-500">{error}</p>
        <button
          onClick={fetchRecommendations}
          className="mt-4 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
        >
          Try Again
        </button>
      </div>
    )
  }

  if (!recommendations) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Personalized Recommendations</h2>
        <p className="text-gray-600">No recommendations available yet. Complete a personality test and log your mood to get personalized recommendations.</p>
      </div>
    )
  }

  const tabContent = {
    activities: {
      title: 'Recommended Activities',
      icon: '🌟',
      items: recommendations.activities || []
    },
    content: {
      title: 'Content Recommendations',
      icon: '📚',
      items: recommendations.content || []
    },
    personalGrowth: {
      title: 'Personal Growth Tips',
      icon: '🌱',
      items: recommendations.personalGrowth || []
    }
  }

  return (
    <MoodAdaptiveElement type="card" className="p-6 rounded-lg shadow-md">
      <div className="flex items-center mb-4">
        <h2 className="text-xl font-semibold">Personalized Recommendations</h2>
        <button
          onClick={fetchRecommendations}
          className="ml-auto p-2 text-primary hover:text-primary-dark transition-colors"
          aria-label="Refresh recommendations"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b mb-4">
        {Object.entries(tabContent).map(([key, { title, icon }]) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`px-4 py-2 mr-2 rounded-t-lg transition-colors ${
              activeTab === key
                ? 'border-b-2 border-primary text-primary font-medium'
                : 'text-gray-600 hover:text-primary'
            }`}
          >
            <span className="mr-1">{icon}</span> {title}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
        >
          <ul className="space-y-3">
            {tabContent[activeTab as keyof typeof tabContent].items.map((item, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start"
              >
                <MoodAdaptiveElement type="text" className="text-lg mr-2">•</MoodAdaptiveElement>
                <span>{item}</span>
              </motion.li>
            ))}
          </ul>
        </motion.div>
      </AnimatePresence>
    </MoodAdaptiveElement>
  )
}
