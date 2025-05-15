// Simple test script for the DeepSeek API

const apiKey = process.env.DEEPSEEK_API_KEY || '';

if (!apiKey) {
  console.error('DEEPSEEK_API_KEY environment variable is not set');
  process.exit(1);
}

async function createCompletion(messages) {
  try {
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: messages,
        temperature: 0.7,
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`API request failed: ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error calling DeepSeek API:', error);
    return null;
  }
}

async function generatePersonalityQuestions(count = 3) {
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
      content: `Please generate ${count} unique personality test questions.
      
      Please create a balanced set of questions covering all five traits.
      
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
    const response = await createCompletion(messages);
    
    // Extract JSON array from response
    const jsonMatch = response.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('Failed to parse questions from AI response');
    }
    
    const questionsData = JSON.parse(jsonMatch[0]);
    
    // Format and validate questions
    return questionsData.map((q, index) => ({
      id: `ai-q${index + 1}`,
      text: q.text,
      trait: q.trait.toLowerCase(),
      weight: q.weight || 1,
      options: [
        { value: 1, text: 'Strongly Disagree' },
        { value: 2, text: 'Disagree' },
        { value: 3, text: 'Neutral' },
        { value: 4, text: 'Agree' },
        { value: 5, text: 'Strongly Agree' },
      ],
    }));
  } catch (error) {
    console.error('Error generating AI questions:', error);
    return [];
  }
}

// Run the test
async function runTest() {
  console.log('Testing DeepSeek API for generating personality questions...\n');
  
  const questions = await generatePersonalityQuestions(3);
  
  if (questions.length === 0) {
    console.log('Failed to generate questions.');
    return;
  }
  
  console.log(`Successfully generated ${questions.length} questions:\n`);
  
  questions.forEach((q, i) => {
    console.log(`Question ${i+1}: ${q.text}`);
    console.log(`Trait: ${q.trait}`);
    console.log(`Weight: ${q.weight}`);
    console.log('---');
  });
}

// Check if fetch is available
if (typeof fetch !== 'function') {
  console.log('Fetch API not available, importing node-fetch...');
  // This is a CommonJS module
  const nodeFetch = require('node-fetch');
  global.fetch = nodeFetch;
}

runTest();
