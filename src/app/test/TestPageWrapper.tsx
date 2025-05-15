'use client'

import { Question } from '@/types/test'
import TestInterface from '@/components/test/TestInterface'
import Navigation from '@/components/Navigation'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'

interface TestPageWrapperProps {
  fallbackQuestions: Question[]
  useAI?: boolean
}

export default function TestPageWrapper({ fallbackQuestions, useAI = false }: TestPageWrapperProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [questions, setQuestions] = useState<Question[]>(fallbackQuestions)
  const [isLoading, setIsLoading] = useState(useAI)
  const [isAIGenerated, setIsAIGenerated] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch AI-generated questions when component mounts
  useEffect(() => {
    if (useAI) {
      const getQuestions = async () => {
        setIsLoading(true);
        setError(null);

        try {
          const response = await fetch('/api/test/generate-questions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ count: 10 }),
          });

          if (!response.ok) {
            throw new Error('Failed to generate AI questions');
          }

          const data = await response.json();

          if (data.questions && data.questions.length > 0) {
            setQuestions(data.questions);
            setIsAIGenerated(true);
          } else {
            // If no questions returned, use fallback
            setQuestions(fallbackQuestions);
            setError('Could not generate AI questions, using standard questions instead');
          }
        } catch (error) {
          console.error('Error fetching AI questions:', error);
          setQuestions(fallbackQuestions);
          setError('Could not generate AI questions, using standard questions instead');
        } finally {
          setIsLoading(false);
        }
      };

      getQuestions();
    }
  }, [useAI, fallbackQuestions]);

  const handleTestComplete = async (answers: any[], traitScores: { [key: string]: number }) => {
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/test/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ answers, traitScores }),
      })

      if (!response.ok) {
        throw new Error('Failed to submit test results')
      }

      const { testId } = await response.json()
      router.push(`/results/${testId}`)
    } catch (error) {
      console.error('Error submitting test:', error)
      // TODO: Add error handling UI
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="container mx-auto py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-center items-center mb-8">
            <h1 className="text-3xl font-bold text-center">Personality Test</h1>
            {isAIGenerated && (
              <motion.div
                className="ml-3 px-3 py-1 bg-gradient-to-r from-purple-500 to-indigo-600 text-white text-xs font-medium rounded-full"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                AI Generated
              </motion.div>
            )}
          </div>

          {error && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-md">
              {error}
            </div>
          )}

          {isLoading ? (
            <div className="flex flex-col items-center justify-center p-12 bg-white rounded-lg shadow-sm">
              <div className="w-16 h-16 border-4 border-gray-200 border-t-purple-500 rounded-full animate-spin mb-4"></div>
              <p className="text-lg text-gray-600">Generating personalized questions...</p>
              <p className="text-sm text-gray-500 mt-2">This may take a few moments</p>
            </div>
          ) : (
            <TestInterface
              questions={questions}
              onComplete={handleTestComplete}
            />
          )}

          {isSubmitting && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <div className="flex items-center">
                  <div className="w-8 h-8 border-4 border-gray-200 border-t-purple-500 rounded-full animate-spin mr-3"></div>
                  <p className="text-lg">Submitting your results...</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}