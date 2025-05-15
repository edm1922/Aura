import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

// Create a direct Prisma client instance for this route
const prisma = new PrismaClient()

interface MetricPayload {
  name: string
  value: number
  tags?: Record<string, string>
  timestamp: number
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json() as MetricPayload
    
    // Validate the payload
    if (!payload.name || typeof payload.value !== 'number') {
      return NextResponse.json(
        { error: 'Invalid metric payload' },
        { status: 400 }
      )
    }
    
    // Store the metric in the database
    try {
      await prisma.performanceMetric.create({
        data: {
          name: payload.name,
          value: payload.value,
          tags: payload.tags ? JSON.stringify(payload.tags) : '{}',
          timestamp: new Date(payload.timestamp || Date.now()),
        },
      })
      
      return NextResponse.json({ success: true })
    } catch (dbError) {
      console.error('Database error storing metric:', dbError)
      
      // Log the metric to console as fallback
      console.log(`📊 Metric: ${payload.name} = ${payload.value}`, payload.tags || {})
      
      return NextResponse.json(
        { error: 'Failed to store metric', success: true },
        { status: 200 } // Return 200 even on DB error to not affect user experience
      )
    }
  } catch (error) {
    console.error('Error processing metric:', error)
    return NextResponse.json(
      { error: 'Failed to process metric' },
      { status: 500 }
    )
  }
}
