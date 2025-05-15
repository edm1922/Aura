import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getTestResult, getExistingSharedResult, createSharedResult } from '@/lib/db-utils';
import { nanoid } from 'nanoid';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'You must be signed in to share results' },
        { status: 401 }
      );
    }

    const { testId } = await request.json();

    if (!testId) {
      return NextResponse.json(
        { error: 'Test ID is required' },
        { status: 400 }
      );
    }

    // Verify the test result belongs to the user using optimized query
    const testResult = await getTestResult(testId, session.user.id);

    if (!testResult) {
      return NextResponse.json(
        { error: 'Test result not found' },
        { status: 404 }
      );
    }

    // Check if a share link already exists using optimized query
    const existingShare = await getExistingSharedResult(testId);

    if (existingShare) {
      return NextResponse.json({
        shareId: existingShare.shareId
      });
    }

    // Generate a unique share ID
    const shareId = nanoid(10);

    // Create a new shared result with 30-day expiration using optimized query
    const sharedResult = await createSharedResult(testId, shareId, 30);

    return NextResponse.json({
      shareId: sharedResult.shareId
    });
  } catch (error) {
    console.error('Error sharing test result:', error);
    return NextResponse.json(
      { error: 'Failed to share test result' },
      { status: 500 }
    );
  }
}
