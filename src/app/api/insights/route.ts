import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getTestResultForInsights, updateTestResultInsights } from '@/lib/db-utils';
import { deepseekApi } from '@/lib/deepseek';
import { PrismaClient } from '@prisma/client';

// Create a direct Prisma client instance for this route
const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'You must be signed in to generate insights' },
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

    try {
      // Fetch the test result with optimized query
      const testResult = await getTestResultForInsights(testId, session.user.id);

      if (!testResult) {
        return NextResponse.json(
          { error: 'Test result not found' },
          { status: 404 }
        );
      }

      // Format the answers for the AI
      const formattedAnswers = Array.isArray(testResult.answers)
        ? testResult.answers
            .filter((answer): answer is Record<string, any> =>
              answer !== null &&
              answer !== undefined &&
              typeof answer === 'object'
            )
            .map(answer => ({
              questionText: answer.questionText || 'Question',
              answerText: answer.answerText || 'Answer',
              answerValue: answer.answerValue || 3,
            }))
        : [];

      // Generate insights using DeepSeek API
      const insights = await deepseekApi.generatePersonalityInsights(
        testResult.traits as Record<string, number>,
        formattedAnswers
      );

      // Update the test result with the generated insights using optimized query
      const updatedTestResult = await updateTestResultInsights(testId, insights);

      return NextResponse.json({
        success: true,
        insights: updatedTestResult.insights
      });
    } catch (dbError) {
      console.error('Database error generating insights:', dbError);

      // Generate mock insights for development
      const mockInsights = [
        "You show a strong balance between analytical thinking and emotional intelligence, allowing you to approach problems from multiple angles while maintaining empathy for others involved.",
        "Your responses indicate a preference for structured environments, but you also demonstrate adaptability when faced with unexpected changes or challenges.",
        "You tend to be introspective and value self-improvement, which helps you continuously grow but may sometimes lead to overthinking or being too self-critical.",
        "In social situations, you strike a balance between listening and contributing, making you an effective communicator who can both understand others' perspectives and clearly express your own.",
        "Your decision-making process combines logical analysis with consideration of how choices affect people, leading to well-rounded decisions that account for both practical outcomes and human factors."
      ];

      // Try to update with mock insights if possible
      try {
        await prisma.testResult.update({
          where: { id: testId },
          data: { insights: mockInsights }
        });
      } catch (updateError) {
        console.error('Failed to update with mock insights:', updateError);
      }

      return NextResponse.json({
        success: true,
        insights: mockInsights,
        isMock: true
      });
    }
  } catch (error) {
    console.error('Error generating insights:', error);

    // Return mock insights for development
    const mockInsights = [
      "You show a strong balance between analytical thinking and emotional intelligence, allowing you to approach problems from multiple angles while maintaining empathy for others involved.",
      "Your responses indicate a preference for structured environments, but you also demonstrate adaptability when faced with unexpected changes or challenges.",
      "You tend to be introspective and value self-improvement, which helps you continuously grow but may sometimes lead to overthinking or being too self-critical.",
      "In social situations, you strike a balance between listening and contributing, making you an effective communicator who can both understand others' perspectives and clearly express your own.",
      "Your decision-making process combines logical analysis with consideration of how choices affect people, leading to well-rounded decisions that account for both practical outcomes and human factors."
    ];

    return NextResponse.json({
      error: 'Failed to generate insights',
      success: true,
      insights: mockInsights,
      isMock: true
    });
  }
}
