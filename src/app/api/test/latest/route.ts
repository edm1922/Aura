import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'You must be signed in to access this resource' },
        { status: 401 }
      )
    }

    // Get the user's latest test result
    const latestTestResult = await prisma.testResult.findFirst({
      where: {
        userId: session.user.id,
        completedAt: {
          lt: new Date(2100, 0, 1), // Any date in the future
        },
      },
      orderBy: {
        completedAt: 'desc',
      },
      select: {
        id: true,
        traits: true,
        completedAt: true,
      },
    })

    if (!latestTestResult) {
      return NextResponse.json(
        { message: 'No test results found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      id: latestTestResult.id,
      traits: latestTestResult.traits,
      completedAt: latestTestResult.completedAt,
    })
  } catch (error) {
    console.error('Error fetching latest test result:', error)
    return NextResponse.json(
      { error: 'Failed to fetch latest test result' },
      { status: 500 }
    )
  }
}
