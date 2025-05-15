import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// GET /api/mood/latest - Get user's latest mood entry
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'You must be signed in to access your mood entries' },
        { status: 401 }
      )
    }

    // Return a mock mood entry for development
    // This is a temporary solution until the database connection is fixed
    const mockMood = {
      id: 'mock-mood',
      userId: session.user.id,
      level: 3,
      category: 'calm',
      factors: ['development', 'testing'],
      notes: 'This is a mock mood for development',
      createdAt: new Date(),
      date: new Date()
    }

    return NextResponse.json({
      mood: mockMood
    })
  } catch (error) {
    console.error('Error in mood latest route:', error)

    // Return a mock mood entry for development
    const mockMood = {
      id: 'mock-mood',
      userId: 'mock-user',
      level: 3,
      category: 'calm',
      factors: ['development', 'testing'],
      notes: 'This is a mock mood for development',
      createdAt: new Date(),
      date: new Date()
    }

    return NextResponse.json({
      error: 'Failed to process request',
      mood: mockMood
    })
  }
}
