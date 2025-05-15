import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createTestResult } from '@/lib/db-utils'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'You must be signed in to submit a test' },
        { status: 401 }
      )
    }

    const { answers, traitScores } = await request.json()

    // Validate the request data
    if (!Array.isArray(answers) || !traitScores || typeof traitScores !== 'object') {
      return NextResponse.json(
        { error: 'Invalid request data' },
        { status: 400 }
      )
    }

    // Generate initial insights
    const initialInsights = generateInsights(traitScores)

    // Create test result in the database using optimized function
    const testResult = await createTestResult(
      session.user.id,
      answers,
      traitScores,
      initialInsights
    )

    return NextResponse.json({
      success: true,
      testId: testResult.id
    })
  } catch (error) {
    console.error('Error submitting test:', error)
    return NextResponse.json(
      { error: 'Failed to submit test' },
      { status: 500 }
    )
  }
}

function generateInsights(traitScores: { [key: string]: number }): string[] {
  const insights: string[] = []

  // Generate insights based on trait scores
  if (traitScores.openness > 4) {
    insights.push('You show a high level of openness to new experiences, indicating creativity and intellectual curiosity.')
  } else if (traitScores.openness < 2) {
    insights.push('You tend to prefer routine and familiar situations, valuing tradition and conventional approaches.')
  }

  if (traitScores.conscientiousness > 4) {
    insights.push('Your high conscientiousness suggests you are organized, responsible, and goal-oriented.')
  } else if (traitScores.conscientiousness < 2) {
    insights.push('You may prefer a more flexible and spontaneous approach to life, valuing freedom over structure.')
  }

  if (traitScores.extraversion > 4) {
    insights.push('Your high extraversion indicates you are energized by social interactions and enjoy being around others.')
  } else if (traitScores.extraversion < 2) {
    insights.push('You tend to be more reserved and may prefer solitary activities or small group settings.')
  }

  if (traitScores.agreeableness > 4) {
    insights.push('Your high agreeableness suggests you are compassionate, cooperative, and value harmony in relationships.')
  } else if (traitScores.agreeableness < 2) {
    insights.push('You may be more direct and competitive, prioritizing personal goals over social harmony.')
  }

  if (traitScores.neuroticism > 4) {
    insights.push('You may experience emotions more intensely and be more sensitive to stress and negative situations.')
  } else if (traitScores.neuroticism < 2) {
    insights.push('You tend to be emotionally stable and resilient, handling stress and challenges with composure.')
  }

  return insights
}