import { NextRequest, NextResponse } from 'next/server';
import { deepseekApi } from '@/lib/deepseek';
import { Question } from '@/types/test';

// Cache for AI-generated questions to improve performance
const questionsCache = new Map<string, { questions: Question[], timestamp: number }>();
const CACHE_TTL = 1000 * 60 * 60; // 1 hour cache TTL

export async function POST(request: NextRequest) {
  try {
    const { count = 3, useCache = true } = await request.json();

    // Validate count
    if (typeof count !== 'number' || count < 1 || count > 30) {
      return NextResponse.json(
        { error: 'Count must be a number between 1 and 30' },
        { status: 400 }
      );
    }

    // Generate a cache key based on count
    const cacheKey = `mock-${count}`;

    // Check cache if enabled
    if (useCache) {
      const cachedData = questionsCache.get(cacheKey);
      if (cachedData && Date.now() - cachedData.timestamp < CACHE_TTL) {
        console.log('Using cached AI-generated questions');
        return NextResponse.json({ questions: cachedData.questions });
      }
    }

    try {
      // Generate questions using DeepSeek API
      const questions = await deepseekApi.generatePersonalityQuestions(count);

      // Cache the generated questions
      questionsCache.set(cacheKey, {
        questions,
        timestamp: Date.now(),
      });

      return NextResponse.json({ questions });
    } catch (error) {
      console.error('Error generating AI questions:', error);
      
      // Return mock questions as fallback
      const mockQuestions = await deepseekApi.generatePersonalityQuestions(count);
      return NextResponse.json({ 
        questions: mockQuestions,
        isAI: false,
        error: 'Failed to generate AI questions, using fallback questions'
      });
    }
  } catch (error) {
    console.error('Error in mock-questions API route:', error);
    return NextResponse.json(
      { error: 'Failed to generate test questions' },
      { status: 500 }
    );
  }
}
