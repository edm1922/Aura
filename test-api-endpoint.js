// Test script for the API endpoint

const apiUrl = 'http://localhost:3000/api/test/mock-questions';

async function testApiEndpoint() {
  try {
    console.log(`Testing API endpoint: ${apiUrl}`);

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ count: 3 }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API request failed with status ${response.status}: ${errorText}`);
    }

    const data = await response.json();

    console.log('\n=== API Endpoint Test Results ===\n');

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
      console.log('---');
    });

    console.log('\nTest completed successfully!');
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

// Check if fetch is available
if (typeof fetch !== 'function') {
  console.log('Fetch API not available, importing node-fetch...');
  // This is a CommonJS module
  const nodeFetch = require('node-fetch');
  global.fetch = nodeFetch;
}

// Run the test
testApiEndpoint();
