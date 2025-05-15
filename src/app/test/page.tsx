import { getRandomQuestions } from '@/lib/questions'
import TestPageWrapper from './TestPageWrapper'

// Use server-side rendering to ensure we have the questions ready
export const dynamic = 'force-dynamic'

export default function TestPage() {
  // We'll fetch AI questions in the client component
  // This is just a fallback in case the API call fails
  const fallbackQuestions = getRandomQuestions(10)
  return <TestPageWrapper fallbackQuestions={fallbackQuestions} useAI={true} />
}