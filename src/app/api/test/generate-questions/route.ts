import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Question } from '@/types/test';

// Cache for AI-generated questions to improve performance
const questionsCache = new Map<string, { questions: Question[], timestamp: number }>();
const CACHE_TTL = 1000 * 60 * 60; // 1 hour cache TTL

// Mock questions for testing
const mockQuestions: Question[] = [
  {
    id: 'ai-q1',
    text: 'I often find myself lost in thought about abstract concepts and ideas.',
    trait: 'openness',
    weight: 1,
    options: [
      { value: 1, text: 'Strongly Disagree' },
      { value: 2, text: 'Disagree' },
      { value: 3, text: 'Neutral' },
      { value: 4, text: 'Agree' },
      { value: 5, text: 'Strongly Agree' },
    ],
  },
  {
    id: 'ai-q2',
    text: 'I prefer to have a detailed plan before starting any project.',
    trait: 'conscientiousness',
    weight: 1,
    options: [
      { value: 1, text: 'Strongly Disagree' },
      { value: 2, text: 'Disagree' },
      { value: 3, text: 'Neutral' },
      { value: 4, text: 'Agree' },
      { value: 5, text: 'Strongly Agree' },
    ],
  },
  {
    id: 'ai-q3',
    text: 'I feel energized after spending time at social gatherings.',
    trait: 'extraversion',
    weight: 1,
    options: [
      { value: 1, text: 'Strongly Disagree' },
      { value: 2, text: 'Disagree' },
      { value: 3, text: 'Neutral' },
      { value: 4, text: 'Agree' },
      { value: 5, text: 'Strongly Agree' },
    ],
  },
  {
    id: 'ai-q4',
    text: 'I prioritize others\' needs over my own in most situations.',
    trait: 'agreeableness',
    weight: 1,
    options: [
      { value: 1, text: 'Strongly Disagree' },
      { value: 2, text: 'Disagree' },
      { value: 3, text: 'Neutral' },
      { value: 4, text: 'Agree' },
      { value: 5, text: 'Strongly Agree' },
    ],
  },
  {
    id: 'ai-q5',
    text: 'I tend to worry about things that might go wrong in the future.',
    trait: 'neuroticism',
    weight: 1,
    options: [
      { value: 1, text: 'Strongly Disagree' },
      { value: 2, text: 'Disagree' },
      { value: 3, text: 'Neutral' },
      { value: 4, text: 'Agree' },
      { value: 5, text: 'Strongly Agree' },
    ],
  },
  {
    id: 'ai-q6',
    text: 'I enjoy exploring new artistic and cultural experiences.',
    trait: 'openness',
    weight: 1,
    options: [
      { value: 1, text: 'Strongly Disagree' },
      { value: 2, text: 'Disagree' },
      { value: 3, text: 'Neutral' },
      { value: 4, text: 'Agree' },
      { value: 5, text: 'Strongly Agree' },
    ],
  },
  {
    id: 'ai-q7',
    text: 'I keep my belongings organized and know where everything is.',
    trait: 'conscientiousness',
    weight: 1,
    options: [
      { value: 1, text: 'Strongly Disagree' },
      { value: 2, text: 'Disagree' },
      { value: 3, text: 'Neutral' },
      { value: 4, text: 'Agree' },
      { value: 5, text: 'Strongly Agree' },
    ],
  },
  {
    id: 'ai-q8',
    text: 'I find it easy to introduce myself to strangers.',
    trait: 'extraversion',
    weight: 1,
    options: [
      { value: 1, text: 'Strongly Disagree' },
      { value: 2, text: 'Disagree' },
      { value: 3, text: 'Neutral' },
      { value: 4, text: 'Agree' },
      { value: 5, text: 'Strongly Agree' },
    ],
  },
  {
    id: 'ai-q9',
    text: 'I believe in giving people second chances.',
    trait: 'agreeableness',
    weight: 1,
    options: [
      { value: 1, text: 'Strongly Disagree' },
      { value: 2, text: 'Disagree' },
      { value: 3, text: 'Neutral' },
      { value: 4, text: 'Agree' },
      { value: 5, text: 'Strongly Agree' },
    ],
  },
  {
    id: 'ai-q10',
    text: 'I get frustrated easily when things don\'t go as planned.',
    trait: 'neuroticism',
    weight: 1,
    options: [
      { value: 1, text: 'Strongly Disagree' },
      { value: 2, text: 'Disagree' },
      { value: 3, text: 'Neutral' },
      { value: 4, text: 'Agree' },
      { value: 5, text: 'Strongly Agree' },
    ],
  },
  {
    id: 'ai-q11',
    text: 'I enjoy thinking about philosophical questions.',
    trait: 'openness',
    weight: 1,
    options: [
      { value: 1, text: 'Strongly Disagree' },
      { value: 2, text: 'Disagree' },
      { value: 3, text: 'Neutral' },
      { value: 4, text: 'Agree' },
      { value: 5, text: 'Strongly Agree' },
    ],
  },
  {
    id: 'ai-q12',
    text: 'I follow through on commitments I make.',
    trait: 'conscientiousness',
    weight: 1,
    options: [
      { value: 1, text: 'Strongly Disagree' },
      { value: 2, text: 'Disagree' },
      { value: 3, text: 'Neutral' },
      { value: 4, text: 'Agree' },
      { value: 5, text: 'Strongly Agree' },
    ],
  },
  {
    id: 'ai-q13',
    text: 'I prefer being the center of attention in social situations.',
    trait: 'extraversion',
    weight: 1,
    options: [
      { value: 1, text: 'Strongly Disagree' },
      { value: 2, text: 'Disagree' },
      { value: 3, text: 'Neutral' },
      { value: 4, text: 'Agree' },
      { value: 5, text: 'Strongly Agree' },
    ],
  },
  {
    id: 'ai-q14',
    text: 'I go out of my way to make others feel comfortable.',
    trait: 'agreeableness',
    weight: 1,
    options: [
      { value: 1, text: 'Strongly Disagree' },
      { value: 2, text: 'Disagree' },
      { value: 3, text: 'Neutral' },
      { value: 4, text: 'Agree' },
      { value: 5, text: 'Strongly Agree' },
    ],
  },
  {
    id: 'ai-q15',
    text: 'I often feel overwhelmed by my responsibilities.',
    trait: 'neuroticism',
    weight: 1,
    options: [
      { value: 1, text: 'Strongly Disagree' },
      { value: 2, text: 'Disagree' },
      { value: 3, text: 'Neutral' },
      { value: 4, text: 'Agree' },
      { value: 5, text: 'Strongly Agree' },
    ],
  },
];

// Function to get a random subset of questions
function getRandomQuestions(count: number): Question[] {
  const shuffled = [...mockQuestions].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'You must be signed in to generate test questions' },
        { status: 401 }
      );
    }

    const { count = 10, useCache = true } = await request.json();

    // Validate count
    if (typeof count !== 'number' || count < 1 || count > 30) {
      return NextResponse.json(
        { error: 'Count must be a number between 1 and 30' },
        { status: 400 }
      );
    }

    // Generate a cache key based on user ID and count
    const cacheKey = `${session.user.id}-${count}`;

    // Check cache if enabled
    if (useCache) {
      const cachedData = questionsCache.get(cacheKey);
      if (cachedData && Date.now() - cachedData.timestamp < CACHE_TTL) {
        console.log('Using cached AI-generated questions');
        return NextResponse.json({ questions: cachedData.questions });
      }
    }

    // Generate random questions (simulating AI generation)
    const questions = getRandomQuestions(count);

    // Cache the generated questions
    questionsCache.set(cacheKey, {
      questions,
      timestamp: Date.now(),
    });

    return NextResponse.json({
      questions,
      isAI: true // Pretend these are AI-generated
    });
  } catch (error) {
    console.error('Error in generate-questions API route:', error);
    return NextResponse.json(
      { error: 'Failed to generate test questions' },
      { status: 500 }
    );
  }
}
