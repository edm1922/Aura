// Simple script to test the AI question generation API

import fetch from 'node-fetch';

async function testAIQuestionGeneration() {
  try {
    console.log('Testing AI question generation...');

    // Make a request to the API endpoint
    const response = await fetch('http://localhost:3000/api/test/generate-questions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ count: 5 }), // Request 5 questions for a quicker test
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();

    console.log('\n=== AI Question Generation Test Results ===\n');

    if (data.error) {
      console.error('Error:', data.error);
      return;
    }

    if (!data.questions || data.questions.length === 0) {
      console.error('No questions were generated');
      return;
    }

    console.log(`Successfully generated ${data.questions.length} questions:\n`);

    // Display the generated questions
    data.questions.forEach((question, index) => {
      console.log(`Question ${index + 1}: ${question.text}`);
      console.log(`Trait: ${question.trait}`);
      console.log(`Weight: ${question.weight}`);
      console.log('Options:', question.options.map(o => `${o.value}: ${o.text}`).join(', '));
      console.log('---');
    });

    console.log('\nTest completed successfully!');
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

// Run the test
testAIQuestionGeneration();
