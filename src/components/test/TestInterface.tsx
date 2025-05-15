'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Question, TestAnswer } from '@/types/test'
import { calculateTraitScores } from '@/lib/questions'
import { useSession } from 'next-auth/react'
import LoadingSpinner from '@/components/animations/LoadingSpinner'

interface TestInterfaceProps {
  questions: Question[]
  onComplete: (answers: TestAnswer[], traitScores: { [key: string]: number }) => void
  adaptiveMode?: boolean
}

export default function TestInterface({
  questions,
  onComplete,
  adaptiveMode = true
}: TestInterfaceProps) {
  const { data: session } = useSession()
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<TestAnswer[]>([])
  const [selectedValue, setSelectedValue] = useState<number | null>(null)
  const [adaptiveQuestions, setAdaptiveQuestions] = useState<Question[]>([])
  const [isLoadingNextQuestions, setIsLoadingNextQuestions] = useState(false)
  const [isAdaptive, setIsAdaptive] = useState(adaptiveMode)
  const [error, setError] = useState<string | null>(null)

  // Get the current question, either from adaptive questions or standard questions
  const getCurrentQuestion = () => {
    if (isAdaptive && currentQuestionIndex > 5 && adaptiveQuestions.length > 0) {
      const adaptiveIndex = currentQuestionIndex - 6

      // Log which question we're showing
      if (adaptiveIndex >= 0 && adaptiveIndex < adaptiveQuestions.length) {
        console.log(`Showing adaptive question ${adaptiveIndex + 1} of ${adaptiveQuestions.length}`)
        return adaptiveQuestions[adaptiveIndex]
      } else {
        console.log(`Adaptive index ${adaptiveIndex} out of range, using standard question`)
        return questions[currentQuestionIndex]
      }
    }

    console.log(`Showing standard question ${currentQuestionIndex + 1}`)
    return questions[currentQuestionIndex]
  }

  const currentQuestionData = getCurrentQuestion()
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100

  const handleAnswer = (value: number) => {
    setSelectedValue(value)
  }

  // Function to fetch adaptive questions
  const fetchAdaptiveQuestions = useCallback(async () => {
    if (!session?.user || !isAdaptive) {
      console.log('Skipping adaptive questions fetch:', {
        hasSession: !!session?.user,
        isAdaptive
      })
      return
    }

    console.log('Starting adaptive questions fetch at question', currentQuestionIndex + 1)
    setIsLoadingNextQuestions(true)
    setError(null)

    // Prepare the current answers with question text for the AI
    const currentAnswersWithText = answers.map(answer => {
      const question = questions.find(q => q.id === answer.questionId)
      return {
        ...answer,
        questionText: question?.text || '',
        answerText: question?.options.find(o => o.value === answer.value)?.text || '',
        answerValue: answer.value
      }
    })

    // Add a timeout to the fetch request
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // Reduced to 10 seconds timeout

    // Add a separate timeout to automatically advance if loading takes too long
    const advanceTimeoutId = setTimeout(() => {
      console.log('Auto-advance timeout reached, moving to next question')
      if (currentQuestionIndex === 5 && isLoadingNextQuestions) {
        setIsLoadingNextQuestions(false)
        setCurrentQuestionIndex(currentQuestionIndex + 1)
        // Don't set error if we're just auto-advancing - the API might still return valid results
        // We'll only show an error if the fetch actually fails
      }
    }, 8000) // 8 seconds timeout for auto-advance (increased from 5s to give API more time)

    try {
      // Only proceed if we're still on question 6
      if (currentQuestionIndex !== 5) {
        console.log('No longer on question 6, aborting adaptive questions fetch')
        clearTimeout(timeoutId)
        clearTimeout(advanceTimeoutId)
        return
      }

      const response = await fetch('/api/test/adaptive', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentAnswers: currentAnswersWithText,
          currentQuestionIndex
        }),
        signal: controller.signal
      })

      clearTimeout(timeoutId) // Clear the timeout if fetch completes

      if (!response.ok) {
        throw new Error('Failed to fetch adaptive questions')
      }

      const data = await response.json()

      // Only log once to avoid console spam
      console.log('Adaptive questions API response received')

      // Only process the response if we're still on question 6
      if (currentQuestionIndex === 5) {
        if (data.nextQuestions && data.nextQuestions.length > 0) {
          console.log('Received adaptive questions successfully:', data.nextQuestions.length)

          // Check if the questions are unique (not duplicates)
          const questionTexts = data.nextQuestions.map((q: Question) => q.text);
          // Use Array.filter for uniqueness instead of Set spread
          const uniqueQuestionTexts = questionTexts.filter((text: string, index: number, self: string[]) =>
            self.indexOf(text) === index
          );

          if (uniqueQuestionTexts.length < questionTexts.length) {
            console.log('Warning: Received duplicate questions from API');

            // If we have duplicate questions, try to replace them with different questions
            const uniqueQuestions = [];
            const usedTexts = new Set();

            // First, add all unique questions
            for (const question of data.nextQuestions) {
              if (!usedTexts.has(question.text)) {
                uniqueQuestions.push(question);
                usedTexts.add(question.text);
              }
            }

            // If we need more questions, get them from the standard questions
            if (uniqueQuestions.length < 3) {
              console.log('Adding standard questions to replace duplicates');
              const standardQuestions = questions.slice(currentQuestionIndex + 1);

              for (const question of standardQuestions) {
                if (uniqueQuestions.length >= 3) break;
                if (!usedTexts.has(question.text)) {
                  uniqueQuestions.push(question);
                  usedTexts.add(question.text);
                }
              }
            }

            // Use the de-duplicated questions
            setAdaptiveQuestions(uniqueQuestions);
          } else {
            // No duplicates, use the questions as-is
            setAdaptiveQuestions(data.nextQuestions);
          }

          // Set adaptive mode based on API response
          setIsAdaptive(data.isAdaptive !== false && data.success !== false)

          // Clear any error message since we got valid questions
          setError(null)

          // Clear the advance timeout since we got a response
          clearTimeout(advanceTimeoutId)

          // Automatically advance to the next question after a short delay
          setTimeout(() => {
            if (currentQuestionIndex === 5) {
              setIsLoadingNextQuestions(false)
              setCurrentQuestionIndex(currentQuestionIndex + 1)
            }
          }, 1500) // 1.5 second delay before advancing
        } else {
          console.log('No adaptive questions returned, disabling adaptive mode')
          setIsAdaptive(false)

          // Check if there's an error message in the response
          if (data.error) {
            setError(`Personalization unavailable: ${data.error}`)
          } else {
            setError('Personalization unavailable: No adaptive questions returned. Continuing with standard test.')
          }

          clearTimeout(advanceTimeoutId)
          setIsLoadingNextQuestions(false)
        }
      } else {
        console.log('No longer on question 6, discarding adaptive questions response')
        clearTimeout(advanceTimeoutId)
      }
    } catch (error) {
      clearTimeout(timeoutId) // Make sure to clear the timeout
      clearTimeout(advanceTimeoutId) // Clear the advance timeout

      const err = error as Error;
      if (err.name === 'AbortError') {
        console.error('Adaptive questions request timed out')
        setError('Request timed out. Continuing with standard test.')
      } else {
        console.error('Error fetching adaptive questions:', err)
        setError('Failed to fetch adaptive questions. Continuing with standard test.')
      }

      // Only disable adaptive mode if we're still on question 6
      // This prevents disabling it if we've already received valid questions
      if (currentQuestionIndex === 5) {
        setIsAdaptive(false)
      }

      // Automatically advance to the next question after error
      if (currentQuestionIndex === 5) {
        setTimeout(() => {
          setIsLoadingNextQuestions(false)
          setCurrentQuestionIndex(currentQuestionIndex + 1)
        }, 1000) // 1 second delay before advancing after error
      }
    } finally {
      // This will run if we didn't auto-advance in the try/catch blocks
      if (currentQuestionIndex !== 5) {
        setIsLoadingNextQuestions(false)
      }
    }
  }, [currentQuestionIndex, isAdaptive, session, answers, questions, setIsLoadingNextQuestions, setAdaptiveQuestions, setIsAdaptive, setError, setCurrentQuestionIndex])

  // Ref to track if we've already triggered adaptive questions for the current question
  const hasTriggeredAdaptiveRef = useRef(false);

  // Effect to fetch adaptive questions when needed
  useEffect(() => {
    if (currentQuestionIndex === 5 && isAdaptive && session?.user && !isLoadingNextQuestions && !hasTriggeredAdaptiveRef.current) {
      console.log('Fetching adaptive questions at question 6')
      hasTriggeredAdaptiveRef.current = true;
      setIsLoadingNextQuestions(true);
      fetchAdaptiveQuestions();
    }

    // Reset the ref when we move away from question 6
    if (currentQuestionIndex !== 5) {
      hasTriggeredAdaptiveRef.current = false;
    }
  }, [currentQuestionIndex, isAdaptive, session, isLoadingNextQuestions, fetchAdaptiveQuestions])

  // Effect to update UI when adaptive questions are loaded
  useEffect(() => {
    if (adaptiveQuestions.length > 0 && currentQuestionIndex >= 6) {
      console.log('Adaptive questions loaded, setting adaptive mode active')
      setIsAdaptive(true)
    }
  }, [adaptiveQuestions, currentQuestionIndex])

  // Effect to reset loading state when moving away from question 6
  useEffect(() => {
    if (currentQuestionIndex !== 5 && isLoadingNextQuestions) {
      console.log('No longer on question 6, resetting loading state')
      setIsLoadingNextQuestions(false)
    }

    // Cleanup function to reset loading state when component unmounts
    return () => {
      if (isLoadingNextQuestions) {
        console.log('Component unmounting, resetting loading state')
        setIsLoadingNextQuestions(false)
      }
    }
  }, [currentQuestionIndex, isLoadingNextQuestions])

  const handleNext = async () => {
    if (selectedValue === null) return

    const newAnswers = [
      ...answers,
      {
        questionId: currentQuestionData.id,
        value: selectedValue,
        trait: currentQuestionData.trait,
        // Add additional fields for adaptive processing
        questionText: currentQuestionData.text,
        answerText: currentQuestionData.options.find(o => o.value === selectedValue)?.text || '',
      },
    ]

    setAnswers(newAnswers)
    setSelectedValue(null)

    if (currentQuestionIndex === questions.length - 1) {
      const traitScores = calculateTraitScores(newAnswers)
      onComplete(newAnswers, traitScores)
    } else {
      // If we're at question 5 and adaptive mode is on, trigger adaptive questions
      if (currentQuestionIndex === 5 && isAdaptive && session?.user) {
        // If we're not already loading, start loading
        if (!isLoadingNextQuestions) {
          setIsLoadingNextQuestions(true)

          // The fetchAdaptiveQuestions function will handle auto-advancing
          // to the next question after a timeout or when questions are loaded
          fetchAdaptiveQuestions()

          // Return early to prevent the normal advancement
          return
        }

        // If we're already loading, don't do anything - the auto-advance will handle it
        return
      }

      // If we're moving from question 6 to 7, make sure loading is done
      if (currentQuestionIndex === 5) {
        setIsLoadingNextQuestions(false)
      }

      setCurrentQuestionIndex(currentQuestionIndex + 1)
    }
  }

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
      setSelectedValue(answers[currentQuestionIndex - 1]?.value || null)
      setAnswers(answers.slice(0, -1))
    }
  }



  return (
    <div className="max-w-2xl mx-auto p-6">
      {/* Progress bar */}
      <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
        <div
          className={`h-2.5 rounded-full transition-all duration-300 ${
            isAdaptive ? 'bg-purple-600' : 'bg-blue-600'
          }`}
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      {/* Adaptive mode indicator */}
      {isAdaptive && currentQuestionIndex >= 5 && !isLoadingNextQuestions && (
        <div className="flex items-center justify-center mb-4 text-sm bg-purple-50 border border-purple-100 rounded-full px-3 py-1 text-purple-700 w-fit mx-auto">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
          </svg>
          <span className="font-medium">Adaptive Mode Active</span>
        </div>
      )}

      {/* Loading indicator - only show at question 6 */}
      {isLoadingNextQuestions && currentQuestionIndex === 5 && (
        <div className="flex flex-col items-center justify-center mb-6 text-purple-700 bg-purple-50 p-4 rounded-lg border border-purple-100">
          <div className="flex items-center mb-3">
            <LoadingSpinner size="sm" color="primary" className="text-purple-600" />
            <span className="ml-3 font-medium">Personalizing your test experience...</span>
          </div>
          <p className="text-sm text-purple-600 mb-3 text-center max-w-md">
            Our AI is analyzing your previous answers to select the most relevant questions for you.
            This may take a few moments.
          </p>
          <button
            onClick={() => {
              setIsLoadingNextQuestions(false)
              setIsAdaptive(false)
              setError('AI personalization skipped. Your test will continue with standard questions.')
              // Move to the next question
              setCurrentQuestionIndex(currentQuestionIndex + 1)
            }}
            className="text-xs bg-white text-purple-700 px-3 py-1 rounded-full border border-purple-200 hover:bg-purple-100 transition-colors"
          >
            Skip personalization
          </button>
        </div>
      )}

      {/* Error message - only show when there's an actual error */}
      {error && !isLoadingNextQuestions && (
        <div className="bg-amber-50 border border-amber-300 text-amber-800 px-4 py-3 rounded-lg mb-4 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <div>
            <span className="font-medium">Personalization unavailable: </span>
            {error}
          </div>
        </div>
      )}

      {/* Question */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">
          Question {currentQuestionIndex + 1} of {questions.length}
        </h2>
        <p className="text-lg text-gray-700">{currentQuestionData.text}</p>
      </div>

      {/* Answer options */}
      <div className="space-y-4 mb-8">
        {currentQuestionData.options.map((option) => (
          <button
            key={option.value}
            onClick={() => handleAnswer(option.value)}
            className={`w-full p-4 text-left rounded-lg border transition-colors ${
              selectedValue === option.value
                ? isAdaptive
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
            }`}
          >
            {option.text}
          </button>
        ))}
      </div>

      {/* Navigation buttons */}
      <div className="flex justify-between">
        <button
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0}
          className={`px-6 py-2 rounded-lg ${
            currentQuestionIndex === 0
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Previous
        </button>
        <button
          onClick={handleNext}
          disabled={selectedValue === null || isLoadingNextQuestions}
          className={`px-6 py-2 rounded-lg ${
            selectedValue === null || isLoadingNextQuestions
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : isAdaptive
                ? 'bg-purple-600 text-white hover:bg-purple-700'
                : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {currentQuestionIndex === questions.length - 1 ? 'Complete' : 'Next'}
        </button>
      </div>
    </div>
  )
}