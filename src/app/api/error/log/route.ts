import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

// Create a direct Prisma client instance for this route
const prisma = new PrismaClient()

interface ErrorPayload {
  message: string
  stack?: string
  context?: string
  severity: 'error' | 'warning' | 'info'
  url?: string
  userAgent?: string
  timestamp: string
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json() as ErrorPayload
    
    // Validate the payload
    if (!payload.message) {
      return NextResponse.json(
        { error: 'Invalid error payload' },
        { status: 400 }
      )
    }
    
    // Get the current user if available
    const session = await getServerSession(authOptions)
    const userId = session?.user?.id
    
    // Store the error in the database
    try {
      await prisma.errorLog.create({
        data: {
          userId,
          message: payload.message,
          stack: payload.stack,
          context: payload.context,
          severity: payload.severity,
          url: payload.url,
          userAgent: payload.userAgent,
          timestamp: new Date(payload.timestamp || Date.now()),
        },
      })
      
      return NextResponse.json({ success: true })
    } catch (dbError) {
      console.error('Database error storing error log:', dbError)
      
      // Log the error to console as fallback
      console.error(`🚨 Error: ${payload.message}`, {
        userId,
        stack: payload.stack,
        context: payload.context,
        severity: payload.severity,
        url: payload.url,
      })
      
      return NextResponse.json(
        { error: 'Failed to store error log', success: true },
        { status: 200 } // Return 200 even on DB error to not affect user experience
      )
    }
  } catch (error) {
    console.error('Error processing error log:', error)
    return NextResponse.json(
      { error: 'Failed to process error log' },
      { status: 500 }
    )
  }
}
