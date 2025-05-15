import { notFound, redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getTestResult } from '@/lib/db-utils'
import ResultsPageClient from './ResultsPageClient'

interface ResultsPageProps {
  params: {
    testId: string
  }
}

export default async function ResultsPage({ params }: ResultsPageProps) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    redirect('/auth/signin?callbackUrl=/results/' + params.testId)
  }

  // Use the cached and optimized query function
  const testResult = await getTestResult(params.testId, session.user.id)

  if (!testResult || !testResult.completedAt) {
    notFound()
  }

  const traits = testResult.traits as { [key: string]: number }
  const insights = testResult.insights as string[]

  return (
    <ResultsPageClient
      traits={traits}
      insights={insights}
      completedAt={testResult.completedAt}
    />
  )
}