import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma, { withTimeout } from '@/lib/prisma';
import { deepseekApi } from '@/lib/deepseek';

// Set timeout values for database operations
const DB_TIMEOUT_MS = 5000; // 5 seconds
const API_TIMEOUT_MS = 15000; // 15 seconds

// Cache for recommendations to improve performance
const recommendationsCache = new Map<string, { recommendations: any, timestamp: number }>();
const CACHE_TTL = 1000 * 60 * 60; // 1 hour cache TTL

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'You must be signed in to get recommendations' },
        { status: 401 }
      );
    }

    try {
      // Get the user's latest test result with timeout
      const latestTestResultPromise = prisma.testResult.findFirst({
        where: {
          userId: session.user.id,
        },
        orderBy: {
          completedAt: 'desc',
        },
        select: {
          traits: true,
        },
      });

      const latestTestResult = await withTimeout(
        latestTestResultPromise,
        DB_TIMEOUT_MS,
        { traits: {} } // Fallback empty traits if timeout
      );

      // Get the user's latest mood entries with timeout
      const latestMoodEntriesPromise = prisma.moodEntry.findMany({
        where: {
          userId: session.user.id,
        },
        orderBy: {
          date: 'desc',
        },
        take: 5,
        select: {
          level: true,
          category: true,
          date: true,
        },
      });

      const latestMoodEntries = await withTimeout(
        latestMoodEntriesPromise,
        DB_TIMEOUT_MS,
        [] // Fallback empty array if timeout
      );

      // Create a timeout promise for the entire recommendation generation
      const recommendationsPromise = generateRecommendations(
        latestTestResult?.traits as Record<string, number> || {},
        latestMoodEntries
      );

      // Use timeout for the entire recommendation generation process
      const recommendations = await withTimeout(
        recommendationsPromise,
        API_TIMEOUT_MS,
        getMockRecommendations() // Use mock recommendations as fallback
      );

      // Create response with recommendations
      const response = NextResponse.json({ recommendations });

      // Add cache control headers directly to the response object
      response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
      response.headers.set('Pragma', 'no-cache');
      response.headers.set('Expires', '0');

      return response;
    } catch (error) {
      const dbError = error as Error;
      console.error('Database error fetching data for recommendations:', dbError);

      // Return mock recommendations for development
      const mockRecommendations = getMockRecommendations();

      return NextResponse.json({
        recommendations: mockRecommendations,
        isMock: true,
        error: process.env.NODE_ENV === 'development' ? dbError.message : 'Database error'
      });
    }
  } catch (error) {
    console.error('Error generating recommendations:', error);

    // Return mock recommendations for development
    const mockRecommendations = getMockRecommendations();

    return NextResponse.json({
      error: 'Failed to generate recommendations',
      recommendations: mockRecommendations,
      isMock: true
    });
  }
}

// Define the type for recommendations categories at the top level
type RecommendationCategories = {
  activities: string[];
  content: string[];
  personalGrowth: string[];
};

async function generateRecommendations(
  traits: Record<string, number>,
  moodEntries: any[]
): Promise<RecommendationCategories> {
  try {
    // Check if we have enough data to generate meaningful recommendations
    const hasTraits = Object.keys(traits).length > 0;
    const hasMoods = moodEntries.length > 0;

    // If we don't have enough data, return mock recommendations
    if (!hasTraits && !hasMoods) {
      console.log('Insufficient data for recommendations, using mock data');
      return getMockRecommendations();
    }

    // Create a cache key based on the input data
    const traitsKey = Object.entries(traits)
      .map(([trait, score]) => `${trait}:${score.toFixed(1)}`)
      .sort()
      .join(',');

    const moodsKey = moodEntries
      .slice(0, 3) // Only use the most recent 3 moods for the cache key
      .map(mood => `${mood.level}:${mood.category}`)
      .join(',');

    const cacheKey = `recommendations-${traitsKey}-${moodsKey}`;

    // Check cache first
    const cachedData = recommendationsCache.get(cacheKey);
    if (cachedData && Date.now() - cachedData.timestamp < CACHE_TTL) {
      console.log('Recommendations: Using cached recommendations');
      return cachedData.recommendations;
    }

    // Format the trait scores for better readability in the prompt
    const formattedTraits = Object.entries(traits)
      .map(([trait, score]) => `${trait}: ${score.toFixed(2)}`)
      .join('\n');

    // Format the mood entries for better readability in the prompt
    const formattedMoods = moodEntries
      .map(mood => {
        try {
          return `Date: ${new Date(mood.date).toLocaleDateString()}, Level: ${mood.level}, Category: ${mood.category}`;
        } catch (e) {
          // Handle invalid date or other parsing errors
          return `Level: ${mood.level || 'unknown'}, Category: ${mood.category || 'unknown'}`;
        }
      })
      .join('\n');

    const messages = [
      {
        role: 'system' as const,
        content: `You are an expert personality analyst and wellness coach. Your task is to generate personalized recommendations based on personality traits and recent mood data.
        Focus on providing actionable recommendations in three categories:
        1. Activities that might improve the user's mood
        2. Content recommendations (books, articles, videos, etc.)
        3. Personal growth tips

        Provide 2-3 recommendations for each category, each 1-2 sentences long. Make them specific, personalized, and psychologically sound.

        Format your response with clear section headers:

        Activities:
        1. [activity recommendation]
        2. [activity recommendation]
        3. [activity recommendation]

        Content:
        1. [content recommendation]
        2. [content recommendation]
        3. [content recommendation]

        Personal Growth:
        1. [personal growth tip]
        2. [personal growth tip]
        3. [personal growth tip]`
      },
      {
        role: 'user' as const,
        content: `Here are the personality trait scores from a test:

        ${formattedTraits || 'No personality test data available yet.'}

        And here are the recent mood entries:

        ${formattedMoods || 'No mood data available yet.'}

        Based on this information, generate personalized recommendations for activities, content, and personal growth tips.`
      }
    ];

    // Make the API call
    console.log('Recommendations: Requesting from DeepSeek API');
    const startTime = Date.now();

    try {
      const response = await deepseekApi.createCompletion(messages, {
        temperature: 0.7,
        max_tokens: 1000
      });

      console.log(`Recommendations: DeepSeek API response received in ${Date.now() - startTime}ms`);
      console.log(`Recommendations: Response length: ${response.length} characters`);

      // Use the RecommendationCategories type defined at the top level

      // Parse the response into categories
      const categories: RecommendationCategories = {
        activities: [],
        content: [],
        personalGrowth: []
      };

      // Improved parsing logic with better error handling
      try {
        const sections = response.split(/Activities:|Content:|Personal Growth:/i);

        if (sections.length >= 4) {
          categories.activities = extractRecommendations(sections[1]);
          categories.content = extractRecommendations(sections[2]);
          categories.personalGrowth = extractRecommendations(sections[3]);
        } else {
          // Try alternative parsing approach
          const activityMatch = response.match(/Activities:[\s\S]*?(?=Content:|Personal Growth:|$)/i);
          const contentMatch = response.match(/Content:[\s\S]*?(?=Activities:|Personal Growth:|$)/i);
          const growthMatch = response.match(/Personal Growth:[\s\S]*?(?=Activities:|Content:|$)/i);

          if (activityMatch) categories.activities = extractRecommendations(activityMatch[0]);
          if (contentMatch) categories.content = extractRecommendations(contentMatch[0]);
          if (growthMatch) categories.personalGrowth = extractRecommendations(growthMatch[0]);
        }

        // Ensure we have at least some recommendations in each category
        if (categories.activities.length === 0) categories.activities = getMockRecommendations().activities.slice(0, 1);
        if (categories.content.length === 0) categories.content = getMockRecommendations().content.slice(0, 1);
        if (categories.personalGrowth.length === 0) categories.personalGrowth = getMockRecommendations().personalGrowth.slice(0, 1);
      } catch (parseError) {
        console.error('Error parsing AI response:', parseError);

        // Fallback to simple parsing
        const allRecs = extractRecommendations(response);
        const third = Math.ceil(allRecs.length / 3);

        categories.activities = allRecs.slice(0, third);
        categories.content = allRecs.slice(third, third * 2);
        categories.personalGrowth = allRecs.slice(third * 2);

        // If parsing completely failed, use mock data
        if (categories.activities.length === 0 && categories.content.length === 0 && categories.personalGrowth.length === 0) {
          return getMockRecommendations();
        }
      }

      // Cache the result
      recommendationsCache.set(cacheKey, {
        recommendations: categories,
        timestamp: Date.now()
      });

      return categories;
    } catch (apiError) {
      console.error('DeepSeek API error:', apiError);
      console.log('Recommendations: Using mock recommendations due to API error');
      return getMockRecommendations();
    }
  } catch (error) {
    console.error('Error generating AI recommendations:', error);
    return getMockRecommendations();
  }
}

function extractRecommendations(text: string): string[] {
  return text
    .split(/\d+\./)
    .map(item => item.trim())
    .filter(item => item.length > 10);
}

function getMockRecommendations(): RecommendationCategories {
  return {
    activities: [
      "Try a 10-minute mindfulness meditation to center yourself and reduce stress.",
      "Schedule a short walk in nature, which research shows can significantly improve mood and mental clarity.",
      "Consider journaling for 5 minutes before bed to process emotions and clear your mind."
    ],
    content: [
      "Read 'Atomic Habits' by James Clear for practical strategies on building positive routines.",
      "Listen to the 'Ten Percent Happier' podcast for accessible mindfulness techniques.",
      "Watch TED talks on positive psychology to gain new perspectives on well-being."
    ],
    personalGrowth: [
      "Practice setting one small, achievable goal each day to build confidence and momentum.",
      "Experiment with the 'two-minute rule' - if something takes less than two minutes, do it immediately.",
      "Consider developing a simple gratitude practice by noting three positive things each evening."
    ]
  };
}
