import { notFound } from 'next/navigation'
import { getSharedResult, incrementSharedResultViewCount } from '@/lib/db-utils'
import SharedResultsView from './SharedResultsView'

interface SharedResultsPageProps {
  params: {
    shareId: string
  }
}

export default async function SharedResultsPage({ params }: SharedResultsPageProps) {
  const { shareId } = params

  // Find the shared result using optimized query
  const sharedResult = await getSharedResult(shareId)

  // If not found or expired, show 404
  if (!sharedResult || (sharedResult.expiresAt && sharedResult.expiresAt < new Date())) {
    notFound()
  }

  // Increment view count using optimized query
  const updatedViewCount = await incrementSharedResultViewCount(sharedResult.id)

  const traits = sharedResult.testResult.traits as { [key: string]: number }
  const insights = sharedResult.testResult.insights as string[]

  return (
    <SharedResultsView
      traits={traits}
      insights={insights}
      completedAt={sharedResult.testResult.completedAt}
      viewCount={updatedViewCount.viewCount}
    />
  )
}
