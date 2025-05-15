import prisma from './prisma'
import { Prisma } from '@prisma/client'
import { cache } from 'react'

/**
 * Cached function to get a test result by ID
 * This uses React's cache function to deduplicate requests within the same render
 */
export const getTestResult = cache(async (testId: string, userId: string) => {
  return prisma.testResult.findUnique({
    where: {
      id: testId,
      userId,
    },
  })
})

/**
 * Get a test result with optimized select fields
 * Only fetches the fields that are needed
 */
export async function getTestResultWithFields(testId: string, userId: string, fields: string[]) {
  const select = fields.reduce((acc, field) => {
    acc[field] = true
    return acc
  }, {} as Record<string, boolean>)

  return prisma.testResult.findUnique({
    where: {
      id: testId,
      userId,
    },
    select,
  })
}

/**
 * Get user's test history with pagination
 */
export async function getUserTestHistory(
  userId: string,
  page = 1,
  pageSize = 10,
  orderBy: 'asc' | 'desc' = 'desc'
) {
  const skip = (page - 1) * pageSize

  const [results, total] = await Promise.all([
    prisma.testResult.findMany({
      where: {
        userId,
      },
      orderBy: {
        completedAt: orderBy,
      },
      skip,
      take: pageSize,
      select: {
        id: true,
        completedAt: true,
        traits: true,
        insights: true,
      },
    }),
    prisma.testResult.count({
      where: {
        userId,
      },
    }),
  ])

  return {
    results,
    pagination: {
      total,
      pages: Math.ceil(total / pageSize),
      page,
      pageSize,
    },
  }
}

/**
 * Get shared result with optimized query
 */
export async function getSharedResult(shareId: string) {
  return prisma.sharedResult.findUnique({
    where: {
      shareId,
    },
    include: {
      testResult: {
        select: {
          traits: true,
          insights: true,
          completedAt: true,
        },
      },
    },
  })
}

/**
 * Increment shared result view count with optimized query
 */
export async function incrementSharedResultViewCount(id: string) {
  return prisma.sharedResult.update({
    where: {
      id,
    },
    data: {
      viewCount: {
        increment: 1,
      },
    },
    select: {
      viewCount: true,
    },
  })
}

/**
 * Get test result with answers for AI insights generation
 */
export async function getTestResultForInsights(testId: string, userId: string) {
  return prisma.testResult.findUnique({
    where: {
      id: testId,
      userId,
    },
    select: {
      id: true,
      traits: true,
      answers: true,
    },
  })
}

/**
 * Update test result insights
 */
export async function updateTestResultInsights(testId: string, insights: string[]) {
  return prisma.testResult.update({
    where: {
      id: testId,
    },
    data: {
      insights,
    },
    select: {
      insights: true,
    },
  })
}

/**
 * Transaction to create a test result
 */
export async function createTestResult(
  userId: string,
  answers: any[],
  traitScores: Record<string, number>,
  insights: string[] = []
) {
  return prisma.testResult.create({
    data: {
      userId,
      answers,
      traits: traitScores,
      insights,
      completedAt: new Date(),
    },
  })
}

/**
 * Transaction to create a shared result
 */
export async function createSharedResult(
  testResultId: string,
  shareId: string,
  expiresInDays = 30
) {
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + expiresInDays)

  return prisma.sharedResult.create({
    data: {
      shareId,
      testResultId,
      expiresAt,
    },
  })
}

/**
 * Check if a shared result already exists for a test
 */
export async function getExistingSharedResult(testResultId: string) {
  return prisma.sharedResult.findFirst({
    where: {
      testResultId,
    },
    select: {
      shareId: true,
    },
  })
}

/**
 * Delete expired shared results (can be run as a scheduled job)
 */
export async function deleteExpiredSharedResults() {
  const now = new Date()

  return prisma.sharedResult.deleteMany({
    where: {
      expiresAt: {
        lt: now,
      },
    },
  })
}
