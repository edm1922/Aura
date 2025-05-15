// Script to test the DeepSeek API for adaptive test questions
// Run with: node test-adaptive-api.js

import fetch from 'node-fetch';
import dotenv from 'dotenv';
import { performance } from 'perf_hooks';

// Load environment variables
dotenv.config();

// DeepSeek API key - use the one from .env or fallback to the hardcoded one
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || 'sk-5d534c441ee24bd88cf4c642908d4c18';

// Test data
const previousAnswers = [
  {
    questionText: "I enjoy spending time with large groups of people.",
    answerText: "Agree",
    answerValue: 4
  },
  {
    questionText: "I prefer to have a detailed plan before starting any project.",
    answerText: "Strongly Agree",
    answerValue: 5
  },
  {
    questionText: "I often find myself lost in thought about abstract concepts.",
    answerText: "Neutral",
    answerValue: 3
  }
];

const traits = {
  openness: 0.65,
  conscientiousness: 0.8,
  extraversion: 0.7,
  agreeableness: 0.5,
  neuroticism: 0.3
};

async function testAdaptiveQuestions() {
  console.log('Testing DeepSeek API for adaptive questions...');
  console.log('API Key:', DEEPSEEK_API_KEY.substring(0, 5) + '...');
  
  // Format previous answers
  const formattedAnswers = previousAnswers
    .map((a, i) => `Q${i+1}: ${a.questionText} - Answer: ${a.answerText}`)
    .join('\n');

  // Format trait scores
  const formattedTraits = Object.entries(traits)
    .map(([trait, score]) => `${trait}: ${score.toFixed(2)}`)
    .join('\n');

  const messages = [
    {
      role: 'system',
      content: `You are an expert in personality psychology and psychometric testing.
      Your task is to generate insightful, probing questions for a personality test based on the Big Five personality traits:

      1. Openness to Experience: Curiosity, creativity, and preference for variety vs. consistency and routine
      2. Conscientiousness: Organization, responsibility, and self-discipline vs. spontaneity and flexibility
      3. Extraversion: Sociability, assertiveness, and energy from external stimulation vs. solitude and internal processing
      4. Agreeableness: Compassion, cooperation, and trust vs. skepticism and prioritizing self-interest
      5. Neuroticism: Emotional sensitivity, anxiety, and stress response vs. emotional stability and resilience

      For each question, provide:
      1. A clear, concise question text that probes one specific trait
      2. The trait it primarily measures (one of: openness, conscientiousness, extraversion, agreeableness, neuroticism)
      3. A weight value of 1 (standard importance)

      Format your response as a valid JSON array of question objects.`
    },
    {
      role: 'user',
      content: `Please generate 3 unique personality test questions.

      Here are the previous answers from this user:
      ${formattedAnswers}

      Here are their current trait scores:
      ${formattedTraits}

      Please tailor the new questions to explore areas that need more clarity based on these responses.

      Return ONLY a valid JSON array of question objects with the following structure:
      [
        {
          "text": "Question text here",
          "trait": "one of: openness, conscientiousness, extraversion, agreeableness, neuroticism",
          "weight": 1
        }
      ]`
    }
  ];

  try {
    console.log('\nSending request to DeepSeek API...');
    const startTime = performance.now();
    
    // Create a timeout promise
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Request timed out after 20 seconds')), 20000);
    });
    
    // Make the API call with timeout
    const fetchPromise = fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: messages,
        temperature: 0.7,
        max_tokens: 1500
      })
    });
    
    // Race the fetch against the timeout
    const response = await Promise.race([fetchPromise, timeoutPromise]);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`API request failed: ${JSON.stringify(errorData)}`);
    }
    
    const data = await response.json();
    const endTime = performance.now();
    
    console.log(`\nResponse received in ${((endTime - startTime) / 1000).toFixed(2)} seconds`);
    
    const content = data.choices[0].message.content;
    console.log('\nRaw response:');
    console.log(content);
    
    // Try to extract JSON
    try {
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const questionsData = JSON.parse(jsonMatch[0]);
        console.log('\nParsed questions:');
        console.log(JSON.stringify(questionsData, null, 2));
      } else {
        console.log('\nCould not extract JSON from response');
      }
    } catch (parseError) {
      console.error('\nError parsing response as JSON:', parseError);
    }
    
  } catch (error) {
    console.error('\nTest failed:', error.message);
  }
}

// Run the test
testAdaptiveQuestions();
