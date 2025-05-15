import { PrismaClient } from '@prisma/client'

// This approach is taken from the Prisma docs
// https://www.prisma.io/docs/guides/database/troubleshooting-orm/help-articles/nextjs-prisma-client-dev-practices

// Enhanced PrismaClient with better error handling and connection management
const createPrismaClient = () => {
  const client = new PrismaClient({
    log: ['error', 'warn'],
    // Add connection timeout to prevent hanging connections
    datasources: {
      db: {
        url: process.env.DATABASE_URL
      }
    },
  })

  // Add connection error handling
  client.$on('query', (e) => {
    // Add query timeout for long-running queries
    if (e.duration > 5000) {
      console.warn(`Slow query detected (${e.duration}ms):`, e.query)
    }
  })

  // Add connection error handling
  client.$on('error', (e) => {
    console.error('Prisma Client error:', e)
  })

  return client
}

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
let prisma: PrismaClient

// Add global error handler for unhandled promise rejections
if (typeof window === 'undefined') {
  process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason)
  })
}

if (process.env.NODE_ENV === 'production') {
  prisma = createPrismaClient()
} else {
  // In development, use a global variable to preserve the value
  // across module reloads caused by HMR (Hot Module Replacement).
  const g = global as unknown as { prisma?: PrismaClient }

  if (!g.prisma) {
    g.prisma = createPrismaClient()
  }

  prisma = g.prisma
}

// Add a wrapper function to handle database connection errors with timeouts
export async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number = 5000,
  fallback?: T
): Promise<T> {
  try {
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error(`Database operation timed out after ${timeoutMs}ms`)), timeoutMs)
    })

    return await Promise.race([promise, timeoutPromise]) as T
  } catch (error) {
    console.error('Database operation error:', error)
    if (fallback !== undefined) {
      return fallback
    }
    throw error
  }
}

// Export both default and named exports
export { prisma }
export default prisma