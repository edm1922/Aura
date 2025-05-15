// Simple script to test the DeepSeek API directly
// Run with: node test-deepseek.js

const fetch = require('node-fetch');
const { performance } = require('perf_hooks');

// DeepSeek API key - use the one from .env or fallback to the hardcoded one
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || 'sk-5d534c441ee24bd88cf4c642908d4c18';

async function testDeepSeekAPI() {
  console.log('Testing DeepSeek API response time...');
  
  // Simple test message
  const messages = [
    {
      role: 'system',
      content: 'You are a helpful assistant.'
    },
    {
      role: 'user',
      content: 'Generate 3 personality test questions about conscientiousness.'
    }
  ];

  try {
    console.log('\nSending request to DeepSeek API...');
    const startTime = performance.now();
    
    // Make the API call
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: messages,
        temperature: 0.7,
        max_tokens: 500
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`API request failed: ${JSON.stringify(errorData)}`);
    }
    
    const data = await response.json();
    const endTime = performance.now();
    
    console.log(`\nResponse received in ${((endTime - startTime) / 1000).toFixed(2)} seconds`);
    console.log('\nResponse content:');
    console.log(data.choices[0].message.content);
    
  } catch (error) {
    console.error('\nTest failed:', error.message);
  }
}

// Run the test
testDeepSeekAPI();
