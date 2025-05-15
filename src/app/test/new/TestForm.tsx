'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useNotification } from '@/context/NotificationContext'
import LoadingButton from '@/components/LoadingButton'
import PageTransition from '@/components/animations/PageTransition'
import FadeIn from '@/components/animations/FadeIn'

// Sample questions for the personality test
const questions = [
  {
    id: 1,
    text: 'I enjoy spending time with large groups of people.',
    trait: 'extraversion',
  },
  {
    id: 2,
    text: 'I prefer to plan things in advance rather than be spontaneous.',
    trait: 'conscientiousness',
  },
  {
    id: 3,
    text: 'I often worry about things that might go wrong.',
    trait: 'neuroticism',
  },
  {
    id: 4,
    text: 'I am interested in learning about different cultures and ideas.',
    trait: 'openness',
  },
  {
    id: 5,
    text: 'I tend to be sympathetic to others\' problems.',
    trait: 'agreeableness',
  },
  {
    id: 6,
    text: 'I find it easy to start conversations with strangers.',
    trait: 'extraversion',
  },
  {
    id: 7,
    text: 'I keep my belongings neat and organized.',
    trait: 'conscientiousness',
  },
  {
    id: 8,
    text: 'I get stressed easily.',
    trait: 'neuroticism',
  },
  {
    id: 9,
    text: 'I enjoy trying new and creative activities.',
    trait: 'openness',
  },
  {
    id: 10,
    text: 'I am generally trusting of others.',
    trait: 'agreeableness',
  },
]

export default function TestForm() {
  const { data: session } = useSession()
  const router = useRouter()
  const { showNotification } = useNotification()
  
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleAnswer = (value: number) => {
    setAnswers({ ...answers, [currentQuestion]: value })
    
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    }
  }

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  const calculateTraitScores = () => {
    const traitScores: Record<string, number> = {
      extraversion: 0,
      conscientiousness: 0,
      neuroticism: 0,
      openness: 0,
      agreeableness: 0,
    }
    
    const traitCounts: Record<string, number> = {
      extraversion: 0,
      conscientiousness: 0,
      neuroticism: 0,
      openness: 0,
      agreeableness: 0,
    }

    // Calculate average score for each trait
    Object.entries(answers).forEach(([questionIndex, value]) => {
      const index = parseInt(questionIndex)
      const question = questions[index]
      traitScores[question.trait] += value
      traitCounts[question.trait]++
    })

    // Calculate average for each trait
    Object.keys(traitScores).forEach(trait => {
      if (traitCounts[trait] > 0) {
        traitScores[trait] = traitScores[trait] / traitCounts[trait]
      }
    })

    return traitScores
  }

  const handleSubmit = async () => {
    if (Object.keys(answers).length < questions.length) {
      showNotification('error', 'Please answer all questions before submitting')
      return
    }

    setIsSubmitting(true)

    try {
      const traitScores = calculateTraitScores()
      
      const response = await fetch('/api/test/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          answers: Object.entries(answers).map(([questionIndex, value]) => ({
            questionId: questions[parseInt(questionIndex)].id,
            questionText: questions[parseInt(questionIndex)].text,
            answerValue: value,
            answerText: getAnswerText(value),
          })),
          traitScores,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to submit test')
      }

      const data = await response.json()
      showNotification('success', 'Test completed successfully!')
      router.push(`/results/${data.testId}`)
    } catch (error) {
      console.error('Error submitting test:', error)
      showNotification('error', 'Failed to submit test. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getAnswerText = (value: number) => {
    switch (value) {
      case 1: return 'Strongly Disagree'
      case 2: return 'Disagree'
      case 3: return 'Neutral'
      case 4: return 'Agree'
      case 5: return 'Strongly Agree'
      default: return ''
    }
  }

  const question = questions[currentQuestion]
  const progress = ((currentQuestion + 1) / questions.length) * 100

  return (
    <PageTransition>
      <div>
        {/* Progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-2.5 mb-6">
          <div
            className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        
        <div className="text-sm text-gray-500 mb-2">
          Question {currentQuestion + 1} of {questions.length}
        </div>

        <FadeIn key={currentQuestion}>
          <div className="mb-8">
            <h2 className="text-xl font-medium text-gray-900 mb-6">{question.text}</h2>
            
            <div className="grid grid-cols-5 gap-2 text-center text-sm">
              <div>Strongly Disagree</div>
              <div>Disagree</div>
              <div>Neutral</div>
              <div>Agree</div>
              <div>Strongly Agree</div>
            </div>
            
            <div className="grid grid-cols-5 gap-2 mt-2">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  onClick={() => handleAnswer(value)}
                  className={`py-3 rounded-md transition-colors ${
                    answers[currentQuestion] === value
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                  }`}
                >
                  {value}
                </button>
              ))}
            </div>
          </div>
        </FadeIn>

        <div className="flex justify-between mt-8">
          <button
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
            className={`px-4 py-2 rounded-md ${
              currentQuestion === 0
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            Previous
          </button>
          
          {currentQuestion === questions.length - 1 ? (
            <LoadingButton
              onClick={handleSubmit}
              isLoading={isSubmitting}
              loadingText="Submitting..."
              disabled={Object.keys(answers).length < questions.length}
            >
              Submit
            </LoadingButton>
          ) : (
            <button
              onClick={() => setCurrentQuestion(currentQuestion + 1)}
              disabled={answers[currentQuestion] === undefined}
              className={`px-4 py-2 rounded-md ${
                answers[currentQuestion] === undefined
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              Next
            </button>
          )}
        </div>
      </div>
    </PageTransition>
  )
}
