import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import {
  UserProgress,
  availableAchievements,
  calculateLevel,
  calculateNextLevelExperience,
  initializeUserProgress
} from '@/lib/progressTracker'

// GET /api/progress - Get user's progress
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'You must be signed in to access your progress' },
        { status: 401 }
      )
    }

    // Get user progress from database
    let userProgress = await prisma.userProgress.findUnique({
      where: {
        userId: session.user.id,
      },
    })

    // If no progress exists, create initial progress
    if (!userProgress) {
      // Get user stats
      const testResults = await prisma.testResult.count({
        where: {
          userId: session.user.id,
          completedAt: {
            lt: new Date(2100, 0, 1), // Any date in the future
          },
        },
      })

      const moodEntries = await prisma.moodEntry.count({
        where: {
          userId: session.user.id,
        },
      })

      const insightsCount = await prisma.testResult.count({
        where: {
          userId: session.user.id,
          insights: {
            isEmpty: false,
          },
        },
      })

      // Calculate days active (unique days with activity)
      const testDays = await prisma.testResult.findMany({
        where: {
          userId: session.user.id,
        },
        select: {
          createdAt: true,
        },
      })

      const moodDays = await prisma.moodEntry.findMany({
        where: {
          userId: session.user.id,
        },
        select: {
          date: true,
        },
      })

      const uniqueDays = new Set([
        ...testDays.map(t => t.createdAt.toDateString()),
        ...moodDays.map(m => new Date(m.date).toDateString()),
      ])

      // Initialize progress
      const initialProgress = initializeUserProgress()

      // Update stats
      initialProgress.stats.testsCompleted = testResults
      initialProgress.stats.moodEntriesLogged = moodEntries
      initialProgress.stats.insightsGenerated = insightsCount || 0
      initialProgress.stats.daysActive = uniqueDays.size

      // Calculate experience
      const experience =
        testResults * 100 + // 100 XP per test
        moodEntries * 10 +  // 10 XP per mood entry
        (insightsCount || 0) * 25 + // 25 XP per insight
        uniqueDays.size * 5 // 5 XP per active day

      initialProgress.experience = experience
      initialProgress.level = calculateLevel(experience)
      initialProgress.nextLevelExperience = calculateNextLevelExperience(initialProgress.level)

      // Check for achievements
      const achievements = [...availableAchievements]

      // First test achievement
      if (testResults > 0) {
        const firstTestAchievement = achievements.find(a => a.id === 'first-test')
        if (firstTestAchievement) {
          firstTestAchievement.unlockedAt = new Date()
        }
      }

      // Test explorer achievement
      if (testResults >= 5) {
        const testExplorerAchievement = achievements.find(a => a.id === 'test-explorer')
        if (testExplorerAchievement) {
          testExplorerAchievement.unlockedAt = new Date()
        }
      } else if (testResults > 0) {
        const testExplorerAchievement = achievements.find(a => a.id === 'test-explorer')
        if (testExplorerAchievement) {
          testExplorerAchievement.progress = testResults
        }
      }

      // Test master achievement
      if (testResults >= 10) {
        const testMasterAchievement = achievements.find(a => a.id === 'test-master')
        if (testMasterAchievement) {
          testMasterAchievement.unlockedAt = new Date()
        }
      } else if (testResults > 0) {
        const testMasterAchievement = achievements.find(a => a.id === 'test-master')
        if (testMasterAchievement) {
          testMasterAchievement.progress = testResults
        }
      }

      // Mood tracker achievement
      if (moodEntries > 0) {
        const moodTrackerAchievement = achievements.find(a => a.id === 'mood-tracker')
        if (moodTrackerAchievement) {
          moodTrackerAchievement.unlockedAt = new Date()
        }
      }

      // Mood master achievement
      if (moodEntries >= 30) {
        const moodMasterAchievement = achievements.find(a => a.id === 'mood-master')
        if (moodMasterAchievement) {
          moodMasterAchievement.unlockedAt = new Date()
        }
      } else if (moodEntries > 0) {
        const moodMasterAchievement = achievements.find(a => a.id === 'mood-master')
        if (moodMasterAchievement) {
          moodMasterAchievement.progress = moodEntries
        }
      }

      // First insight achievement
      if (insightsCount > 0) {
        const firstInsightAchievement = achievements.find(a => a.id === 'first-insight')
        if (firstInsightAchievement) {
          firstInsightAchievement.unlockedAt = new Date()
        }
      }

      initialProgress.achievements = achievements

      // Save to database
      userProgress = await prisma.userProgress.create({
        data: {
          userId: session.user.id,
          progress: initialProgress as any,
        },
      })
    }

    return NextResponse.json({ progress: userProgress.progress })
  } catch (error) {
    console.error('Error fetching user progress:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user progress' },
      { status: 500 }
    )
  }
}

// PUT /api/progress - Update user's progress
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'You must be signed in to update your progress' },
        { status: 401 }
      )
    }

    const { progress } = await request.json()

    // Validate input
    if (!progress) {
      return NextResponse.json(
        { error: 'Missing progress data' },
        { status: 400 }
      )
    }

    // Update user progress
    const updatedProgress = await prisma.userProgress.upsert({
      where: {
        userId: session.user.id,
      },
      update: {
        progress: progress as any,
      },
      create: {
        userId: session.user.id,
        progress: progress as any,
      },
    })

    return NextResponse.json({ progress: updatedProgress.progress })
  } catch (error) {
    console.error('Error updating user progress:', error)
    return NextResponse.json(
      { error: 'Failed to update user progress' },
      { status: 500 }
    )
  }
}
