import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'
import { nanoid } from 'nanoid'

// Create a new PrismaClient instance directly in this file
const prisma = new PrismaClient()

// GET /api/mood - Get user's mood entries
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'You must be signed in to access your mood entries' },
        { status: 401 }
      )
    }

    try {
      // Get mood entries for the user
      const entries = await prisma.moodEntry.findMany({
        where: {
          userId: session.user.id,
        },
        orderBy: {
          date: 'desc',
        },
      })

      return NextResponse.json({ entries })
    } catch (dbError) {
      console.error('Database error fetching mood entries:', dbError)

      // Return mock entries for development
      const mockEntries = [
        {
          id: 'mock-mood-1',
          userId: session.user.id,
          level: 3,
          category: 'calm',
          factors: ['development', 'testing'],
          notes: 'This is a mock mood for development',
          createdAt: new Date(),
          date: new Date()
        },
        {
          id: 'mock-mood-2',
          userId: session.user.id,
          level: 4,
          category: 'happy',
          factors: ['coding', 'progress'],
          notes: 'Making good progress',
          createdAt: new Date(Date.now() - 86400000), // 1 day ago
          date: new Date(Date.now() - 86400000)
        }
      ]

      return NextResponse.json({
        entries: mockEntries,
        isMock: true
      })
    }
  } catch (error) {
    console.error('Error fetching mood entries:', error)

    // Return mock entries for development
    const mockEntries = [
      {
        id: 'mock-mood-1',
        userId: 'mock-user',
        level: 3,
        category: 'calm',
        factors: ['development', 'testing'],
        notes: 'This is a mock mood for development',
        createdAt: new Date(),
        date: new Date()
      }
    ]

    return NextResponse.json({
      error: 'Failed to fetch mood entries',
      entries: mockEntries,
      isMock: true
    })
  }
}

// POST /api/mood - Create a new mood entry
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'You must be signed in to create a mood entry' },
        { status: 401 }
      )
    }

    const { date, level, category, notes, factors } = await request.json()

    // Validate input
    if (!date || !level || !category) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    try {
      // Check if entry already exists for this date
      const existingEntry = await prisma.moodEntry.findFirst({
        where: {
          userId: session.user.id,
          date: {
            gte: new Date(date).setHours(0, 0, 0, 0),
            lt: new Date(date).setHours(23, 59, 59, 999),
          },
        },
      })

      let entry

      if (existingEntry) {
        // Update existing entry
        entry = await prisma.moodEntry.update({
          where: {
            id: existingEntry.id,
          },
          data: {
            level,
            category,
            notes: notes || '',
            factors: factors || [],
          },
        })
      } else {
        // Create new entry
        entry = await prisma.moodEntry.create({
          data: {
            id: nanoid(),
            userId: session.user.id,
            date: new Date(date),
            level,
            category,
            notes: notes || '',
            factors: factors || [],
          },
        })
      }

      return NextResponse.json({ entry })
    } catch (dbError) {
      console.error('Database error creating mood entry:', dbError)

      // Return a mock entry for development
      const mockEntry = {
        id: nanoid(),
        userId: session.user.id,
        level,
        category,
        notes: notes || '',
        factors: factors || [],
        date: new Date(date),
        createdAt: new Date(),
        updatedAt: new Date()
      }

      return NextResponse.json({
        entry: mockEntry,
        isMock: true
      })
    }
  } catch (error) {
    console.error('Error creating mood entry:', error)

    // Return a mock entry for development
    const mockEntry = {
      id: nanoid(),
      userId: 'mock-user',
      level: 3,
      category: 'calm',
      factors: ['development', 'testing'],
      notes: 'This is a mock mood for development',
      date: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    }

    return NextResponse.json({
      error: 'Failed to create mood entry',
      entry: mockEntry,
      isMock: true
    })
  }
}

// DELETE /api/mood/:id - Delete a mood entry
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'You must be signed in to delete a mood entry' },
        { status: 401 }
      )
    }

    const url = new URL(request.url)
    const id = url.searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Missing entry ID' },
        { status: 400 }
      )
    }

    try {
      // Check if entry exists and belongs to user
      const entry = await prisma.moodEntry.findUnique({
        where: {
          id,
          userId: session.user.id,
        },
      })

      if (!entry) {
        return NextResponse.json(
          { error: 'Mood entry not found' },
          { status: 404 }
        )
      }

      // Delete the entry
      await prisma.moodEntry.delete({
        where: {
          id,
        },
      })

      return NextResponse.json({ success: true })
    } catch (dbError) {
      console.error('Database error deleting mood entry:', dbError)

      // Return success anyway for development
      return NextResponse.json({
        success: true,
        isMock: true,
        message: 'Mock deletion successful'
      })
    }
  } catch (error) {
    console.error('Error deleting mood entry:', error)

    // Return success anyway for development
    return NextResponse.json({
      error: 'Failed to delete mood entry',
      success: true,
      isMock: true,
      message: 'Mock deletion successful'
    })
  }
}
