import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

// Create a direct Prisma client instance for this route
const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    // Check if user is authenticated
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    // Get the error ID from the request
    const { errorId } = await request.json()
    
    if (!errorId) {
      return NextResponse.json(
        { error: 'Error ID is required' },
        { status: 400 }
      )
    }
    
    // Update the error in the database
    try {
      const updatedError = await prisma.errorLog.update({
        where: { id: errorId },
        data: {
          resolved: true,
          resolvedAt: new Date(),
        },
      })
      
      return NextResponse.json({
        success: true,
        error: updatedError,
      })
    } catch (dbError) {
      console.error('Database error updating error:', dbError)
      
      return NextResponse.json(
        { error: 'Failed to update error' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error resolving error:', error)
    return NextResponse.json(
      { error: 'Failed to resolve error' },
      { status: 500 }
    )
  }
}
