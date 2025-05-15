import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';
import { deepseekApi } from '@/lib/deepseek';
import { getQuestions } from '@/lib/questions';

// Cache for adaptive test responses to improve performance
const adaptiveCache = new Map<string, { questions: any[], timestamp: number }>();
const CACHE_TTL = 1000 * 60 * 60; // 1 hour cache TTL

// Create a direct Prisma client instance for this route
const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  console.log('Adaptive test API route called');
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      console.log('Unauthorized request to adaptive test API');
      return NextResponse.json(
        { error: 'You must be signed in to get adaptive test questions' },
        { status: 401 }
      );
    }

    const { currentAnswers, currentQuestionIndex } = await request.json();

    if (!currentAnswers || currentQuestionIndex === undefined) {
      console.log('Missing required fields in adaptive test API request');
      return NextResponse.json(
        { error: 'Current answers and question index are required' },
        { status: 400 }
      );
    }

    console.log(`Adaptive test: Processing request for question ${currentQuestionIndex + 1} with ${currentAnswers.length} answers`);

    try {
      // Get previous test results for this user
      const previousTests = await prisma.testResult.findMany({
        where: {
          userId: session.user.id,
        },
        orderBy: {
          completedAt: 'desc',
        },
        take: 3,
        select: {
          traits: true,
          answers: true,
        },
      });

      // Get all available questions
      const allQuestions = getQuestions();

      // Determine next questions based on current answers and previous tests
      const nextQuestions = await determineNextQuestions(
        currentAnswers,
        currentQuestionIndex,
        previousTests,
        allQuestions
      );

      console.log(`Adaptive test: Returning ${nextQuestions.length} adaptive questions`);
      return NextResponse.json({
        nextQuestions,
        isAdaptive: true,
        success: true
      });
    } catch (dbError) {
      console.error('Database error fetching data for adaptive test:', dbError);

      // Return standard questions as fallback
      const allQuestions = getQuestions();
      const remainingQuestions = allQuestions.slice(currentQuestionIndex + 1);

      console.log('Adaptive test: Returning fallback questions due to database error');
      return NextResponse.json({
        nextQuestions: remainingQuestions.slice(0, 3),
        isAdaptive: false,
        error: 'Database error, using standard questions'
      });
    }
  } catch (error) {
    console.error('Error generating adaptive test questions:', error);

    // Return standard questions as fallback
    const allQuestions = getQuestions();
    const remainingQuestions = allQuestions.slice(currentQuestionIndex + 1 || 0);

    console.log('Adaptive test: Returning fallback questions due to general error');
    return NextResponse.json({
      error: 'Failed to generate adaptive test questions',
      nextQuestions: remainingQuestions.slice(0, 3),
      isAdaptive: false,
      success: false
    });
  }
}

async function determineNextQuestions(
  currentAnswers: any[],
  currentQuestionIndex: number,
  previousTests: any[],
  allQuestions: any[]
) {
  try {
    // Get remaining questions
    const remainingQuestions = allQuestions.slice(currentQuestionIndex + 1);

    // If we're near the end of the test, just return the remaining questions
    if (remainingQuestions.length <= 5) {
      return remainingQuestions;
    }

    // Create a cache key based on current state and answers
    // Include a hash of the answers to ensure unique cache keys for different answer patterns
    const answerHash = currentAnswers
      .map(a => `${a.questionId}:${a.value}`)
      .join('|');
    const cacheKey = `adaptive-${currentQuestionIndex}-${answerHash}`;

    // Check cache first, but limit how many times we log this
    const cachedData = adaptiveCache.get(cacheKey);
    if (cachedData && Date.now() - cachedData.timestamp < CACHE_TTL) {
      // Only log this message once per minute to avoid console spam
      const now = Date.now();
      const lastLogTime = global.lastAdaptiveCacheLogTime || 0;
      if (now - lastLogTime > 60000) {
        console.log('Adaptive test: Using cached questions');
        global.lastAdaptiveCacheLogTime = now;
      }
      return cachedData.questions;
    }

    // Format the current answers for the AI
    const formattedCurrentAnswers = currentAnswers
      .map((answer, index) => `Q${index + 1}: ${answer.questionText} - Answer: ${answer.answerText} (Value: ${answer.answerValue})`)
      .join('\n');

    // Format previous test traits for the AI
    const formattedPreviousTraits = previousTests
      .map((test, testIndex) => {
        const traits = Object.entries(test.traits as Record<string, number>)
          .map(([trait, score]) => `${trait}: ${score.toFixed(2)}`)
          .join(', ');
        return `Test ${testIndex + 1}: ${traits}`;
      })
      .join('\n');

    // Prepare the questions for the AI to choose from
    const formattedRemainingQuestions = remainingQuestions
      .map((q, index) => `${index + 1}. ${q.text} (Trait: ${q.trait})`)
      .join('\n');

    const messages = [
      {
        role: 'system',
        content: `You are an expert in psychometric testing and adaptive assessments. Your task is to select the most informative next questions for a personality test based on the user's current answers and previous test results.

        You should select questions that will:
        1. Provide the most information about traits that are currently uncertain
        2. Confirm or challenge patterns seen in previous test results
        3. Explore areas that seem most relevant to this specific user

        IMPORTANT: You must return ONLY a JSON array of numbers representing the indices of the questions you select. For example: [2, 7, 12]
        Do not include any explanations, text, or other content in your response - ONLY the JSON array.`
      },
      {
        role: 'user',
        content: `Here are the user's current answers in this test:

        ${formattedCurrentAnswers || 'No answers provided yet.'}

        Here are the trait scores from previous tests:

        ${formattedPreviousTraits || 'No previous test data available.'}

        Here are the remaining questions to choose from:

        ${formattedRemainingQuestions}

        Select the indices of the 3 most informative questions for this user.

        IMPORTANT: Return ONLY a JSON array of numbers. For example: [2, 7, 12]
        Do not include any explanations or other text in your response.`
      }
    ];

    console.log('Adaptive test: Requesting next questions from DeepSeek API');
    const startTime = Date.now();

    try {
      const response = await deepseekApi.createCompletion(messages, {
        temperature: 0.3,
        max_tokens: 100
      });

      console.log(`Adaptive test: DeepSeek API response received in ${Date.now() - startTime}ms`);
      console.log(`Adaptive test: Raw response: ${response.substring(0, 100)}...`);

      // Check if the response contains a timeout or error message
      if (response.includes("timed out") || response.includes("Error processing")) {
        console.log('Adaptive test: Received error response from DeepSeek API, using fallback questions');
        const nextQuestions = remainingQuestions.slice(0, 3);
        return nextQuestions;
      }

      // If we got this far, we have a valid response from DeepSeek
      console.log('Adaptive test: Valid response received from DeepSeek API');

      // Parse the response to get the selected question indices
      console.log('Full DeepSeek API response:', response);
      let selectedIndices = [];

      // First, try to parse the entire response as a JSON array
      try {
        const trimmedResponse = response.trim();
        const parsed = JSON.parse(trimmedResponse);
        if (Array.isArray(parsed) && parsed.every(item => typeof item === 'number')) {
          console.log('Successfully parsed entire response as JSON array');
          selectedIndices = parsed.map(index => index - 1); // Convert to 0-based indices
        }
      } catch (directParseError) {
        console.log('Could not parse entire response as JSON array:', directParseError.message);

        // Next, try to extract a JSON array from the response
        try {
          // Look for anything that looks like a JSON array
          const jsonMatch = response.match(/\[[\s\S]*?\]/);
          if (jsonMatch) {
            console.log('Found JSON array in response:', jsonMatch[0]);
            // Try to parse as JSON array of numbers
            const parsed = JSON.parse(jsonMatch[0]);
            if (Array.isArray(parsed) && parsed.every(item => typeof item === 'number')) {
              console.log('Successfully parsed extracted JSON array');
              selectedIndices = parsed.map(index => index - 1); // Convert to 0-based indices
            } else {
              console.log('Extracted JSON is not an array of numbers:', parsed);
            }
          } else {
            console.log('No JSON array pattern found in response');
          }
        } catch (extractParseError) {
          console.log('Error parsing extracted JSON from response:', extractParseError.message);
        }

        // If JSON parsing failed, try to extract numbers using regex
        if (selectedIndices.length === 0) {
          console.log('Trying to extract numbers using regex');

          // First, look for numbers that appear to be part of a list
          const numberListMatch = response.match(/\d+(?:\s*,\s*\d+)+/);
          if (numberListMatch) {
            console.log('Found number list pattern:', numberListMatch[0]);
            selectedIndices = numberListMatch[0]
              .split(',')
              .map(index => parseInt(index.trim()))
              .filter(index => !isNaN(index) && index > 0 && index <= remainingQuestions.length)
              .map(index => index - 1); // Convert to 0-based indices
          }

          // If that didn't work, just extract all numbers
          if (selectedIndices.length === 0) {
            console.log('Extracting all numbers from response');
            const allNumbers = response.match(/\d+/g);
            if (allNumbers) {
              selectedIndices = allNumbers
                .map(index => parseInt(index))
                .filter(index => !isNaN(index) && index > 0 && index <= remainingQuestions.length)
                .map(index => index - 1) // Convert to 0-based indices
                .slice(0, 3); // Take at most 3
            }
          }
        }
      }

      // If we still couldn't parse any valid indices, use a smarter fallback
      if (selectedIndices.length === 0) {
        console.log('No valid indices found, using intelligent fallback selection');

        // Instead of just taking the first 3 questions, select questions for different traits
        const traitCounts = {};
        const selectedQuestionIndices = [];

        // Count questions by trait
        remainingQuestions.forEach((q, index) => {
          traitCounts[q.trait] = (traitCounts[q.trait] || 0) + 1;
        });

        // Get traits sorted by question count (to prioritize underrepresented traits)
        const traitsByCount = Object.keys(traitCounts).sort((a, b) => traitCounts[a] - traitCounts[b]);

        // Select one question for each of the top 3 traits (or fewer if there are fewer traits)
        for (let i = 0; i < Math.min(3, traitsByCount.length); i++) {
          const trait = traitsByCount[i];
          // Find the first question for this trait
          const questionIndex = remainingQuestions.findIndex((q, idx) => q.trait === trait && !selectedQuestionIndices.includes(idx));
          if (questionIndex !== -1) {
            selectedQuestionIndices.push(questionIndex);
          }
        }

        // If we still need more questions, add some from the remaining questions
        while (selectedQuestionIndices.length < 3 && selectedQuestionIndices.length < remainingQuestions.length) {
          // Find a question we haven't selected yet
          const questionIndex = remainingQuestions.findIndex((q, idx) => !selectedQuestionIndices.includes(idx));
          if (questionIndex !== -1) {
            selectedQuestionIndices.push(questionIndex);
          } else {
            break; // No more questions available
          }
        }

        // Use these indices
        selectedIndices = selectedQuestionIndices;
        console.log('Using fallback selection, selected indices:', selectedIndices);

        // If we still have no questions, just take the first 3
        if (selectedIndices.length === 0) {
          console.log('Fallback selection failed, using first 3 questions');
          const nextQuestions = remainingQuestions.slice(0, 3);
          return nextQuestions;
        }
      }

      // Take at most 3 questions
      selectedIndices = selectedIndices.slice(0, 3);

      // Log the selected indices
      console.log('Final selected question indices:', selectedIndices);

      // Get the selected questions
      const selectedQuestions = selectedIndices.map(index => remainingQuestions[index]);

      // Cache the result
      adaptiveCache.set(cacheKey, {
        questions: selectedQuestions,
        timestamp: Date.now()
      });

      return selectedQuestions;
    } catch (apiError) {
      console.error('DeepSeek API error:', apiError);
      console.log('Adaptive test: Using fallback questions due to API error');

      // Use a simple algorithm to select questions if the API fails
      const nextQuestions = remainingQuestions.slice(0, 3);
      return nextQuestions;
    }
  } catch (error) {
    console.error('Error determining adaptive questions:', error);

    // Return the next 3 questions in sequence as fallback
    return allQuestions.slice(currentQuestionIndex + 1, currentQuestionIndex + 4);
  }
}
