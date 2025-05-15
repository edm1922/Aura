// Script to test the DeepSeek API directly

import 'dotenv/config';
import { DeepSeekAPI } from '../src/lib/deepseek.js';

async function testDeepSeekAPI() {
  try {
    console.log('Testing DeepSeek API directly...');

    // Create an instance of the DeepSeekAPI
    const deepseekApi = new DeepSeekAPI();

    // Test generating questions
    console.log('\nGenerating personality questions...');
    const questions = await deepseekApi.generatePersonalityQuestions(3);

    console.log('\n=== DeepSeek API Test Results ===\n');

    if (!questions || questions.length === 0) {
      console.error('No questions were generated');
      return;
    }

    console.log(`Successfully generated ${questions.length} questions:\n`);

    // Display the generated questions
    questions.forEach((question, index) => {
      console.log(`Question ${index + 1}: ${question.text}`);
      console.log(`Trait: ${question.trait}`);
      console.log(`Weight: ${question.weight}`);
      console.log('---');
    });

    // Test generating insights
    console.log('\nGenerating personality insights...');
    const traitScores = {
      openness: 0.75,
      conscientiousness: 0.6,
      extraversion: 0.4,
      agreeableness: 0.8,
      neuroticism: 0.3
    };

    const answers = [
      { questionText: 'I enjoy trying new things', answerText: 'Agree', answerValue: 4 },
      { questionText: 'I prefer to plan ahead', answerText: 'Neutral', answerValue: 3 }
    ];

    const insights = await deepseekApi.generatePersonalityInsights(traitScores, answers);

    console.log('\nGenerated insights:');
    insights.forEach((insight, index) => {
      console.log(`\nInsight ${index + 1}: ${insight}`);
    });

    console.log('\nTest completed successfully!');
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Run the test
testDeepSeekAPI();
