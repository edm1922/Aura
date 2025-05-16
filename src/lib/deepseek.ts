// No longer using eventsource-parser due to TypeScript compatibility issues

export interface DeepSeekMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface DeepSeekCompletionOptions {
  model?: string;
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
}

export class DeepSeekAPI {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.baseUrl = 'https://api.deepseek.com/v1';
  }

  async createCompletion(
    messages: DeepSeekMessage[],
    options: DeepSeekCompletionOptions = {}
  ): Promise<string> {
    const {
      model = 'deepseek-chat',
      temperature = 0.7,
      max_tokens = 1000,
      stream = false
    } = options;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout - reduced from 30s

    try {
      console.log(`DeepSeek API: Making request to ${this.baseUrl}/chat/completions`);
      const startTime = Date.now();

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model,
          messages,
          temperature,
          max_tokens,
          stream
        }),
        signal: controller.signal
      });

      const responseTime = Date.now() - startTime;
      console.log(`DeepSeek API: Response received in ${responseTime}ms`);

      clearTimeout(timeoutId);

      if (!response.ok) {
        const error = await response.json();
        console.error(`DeepSeek API error: ${JSON.stringify(error)}`);
        throw new Error(`DeepSeek API error: ${error.error?.message || JSON.stringify(error)}`);
      }

      if (stream) {
        return this.handleStream(response);
      } else {
        console.log(`DeepSeek API: Parsing JSON response`);
        const jsonStartTime = Date.now();
        const data = await response.json();
        console.log(`DeepSeek API: JSON parsed in ${Date.now() - jsonStartTime}ms`);

        // Get the response content
        const content = data.choices[0].message.content;

        // Check if this is a request that expects JSON (like the adaptive test)
        const isJsonRequest = messages.some(msg =>
          (msg.role === 'system' || msg.role === 'user') &&
          (msg.content.includes('JSON array') || msg.content.includes('Return ONLY'))
        );

        if (isJsonRequest) {
          console.log('DeepSeek API: This appears to be a JSON request, checking response format');

          // Try to parse the entire response as JSON
          try {
            const trimmedContent = content.trim();
            JSON.parse(trimmedContent);
            console.log('DeepSeek API: Response is valid JSON, returning as-is');
            return trimmedContent;
          } catch (e) {
            console.log('DeepSeek API: Response is not valid JSON, looking for JSON in the response');

            // Try to extract JSON from the response
            const jsonMatch = content.match(/\[[\s\S]*\]/);
            if (jsonMatch) {
              console.log('DeepSeek API: Found JSON array in response, returning that');
              return jsonMatch[0];
            }

            console.log('DeepSeek API: No JSON found in response, returning full content');
          }
        }

        return content;
      }
    } catch (error: unknown) {
      clearTimeout(timeoutId);
      // Safely access error properties with type checking
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`DeepSeek API error: ${errorMessage}`);

      // For timeout errors, return a fallback response instead of throwing
      if (error instanceof Error && error.name === 'AbortError') {
        console.warn('DeepSeek API request timed out, returning fallback response');
        return "AI personalization timed out. Your test will continue with standard questions.";
      }

      // For other errors, also return a fallback response
      console.warn('DeepSeek API error, returning fallback response');
      return "AI personalization failed. Your test will continue with standard questions.";
    }
  }

  private async handleStream(response: Response): Promise<string> {
    // For simplicity, let's just read the entire response and parse it
    // This avoids the eventsource-parser TypeScript issues
    const data = await response.json();

    // Get the response content
    if (data && data.choices && data.choices[0] && data.choices[0].message) {
      return data.choices[0].message.content || '';
    }

    return "Failed to parse streaming response";
  }

  async generatePersonalityInsights(
    traitScores: Record<string, number>,
    answers: any[]
  ): Promise<string[]> {
    // Format the trait scores for better readability in the prompt
    const formattedTraits = Object.entries(traitScores)
      .map(([trait, score]) => `${trait}: ${score.toFixed(2)}`)
      .join('\n');

    // Create a summary of answers for context
    const answerSummary = answers
      .map((a, i) => `Q${i+1}: ${a.questionText} - Answer: ${a.answerText}`)
      .join('\n');

    const messages: DeepSeekMessage[] = [
      {
        role: 'system',
        content: `You are an expert personality analyst. Your task is to generate insightful, personalized analysis based on personality test results.
        Focus on providing actionable insights, strengths, potential growth areas, and how these traits might manifest in different life situations.
        Provide 5 distinct insights, each 2-3 sentences long. Make them specific, personalized, and psychologically sound.`
      },
      {
        role: 'user',
        content: `Here are the personality trait scores from a test:

        ${formattedTraits}

        And here's a summary of some of their answers:

        ${answerSummary}

        Based on this information, generate 5 insightful observations about this person's personality, strengths, potential growth areas, and how these traits might manifest in different situations.`
      }
    ];

    const response = await this.createCompletion(messages, {
      temperature: 0.7,
      max_tokens: 1000
    });

    // Split the response into separate insights
    const insights = response
      .split(/\d+\./)  // Split by numbered list format
      .filter(text => text.trim().length > 0)  // Remove empty entries
      .map(text => text.trim());  // Clean up whitespace

    return insights;
  }

  async generatePersonalityQuestions(
    count: number = 10,
    previousAnswers: any[] = [],
    traits: Record<string, number> = {}
  ): Promise<any[]> {
    // Format previous answers if available
    const formattedAnswers = previousAnswers.length > 0
      ? previousAnswers
          .map((a, i) => `Q${i+1}: ${a.questionText} - Answer: ${a.answerText}`)
          .join('\n')
      : 'No previous answers available.';

    // Format trait scores if available
    const formattedTraits = Object.keys(traits).length > 0
      ? Object.entries(traits)
          .map(([trait, score]) => `${trait}: ${score.toFixed(2)}`)
          .join('\n')
      : 'No trait scores available yet.';

    const messages: DeepSeekMessage[] = [
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

        ${previousAnswers.length > 0 ? 'Here are the previous answers from this user:' : ''}
        ${formattedAnswers}

        ${Object.keys(traits).length > 0 ? 'Here are their current trait scores:' : ''}
        ${formattedTraits}

        ${previousAnswers.length > 0 || Object.keys(traits).length > 0
          ? 'Please tailor the new questions to explore areas that need more clarity based on these responses.'
          : 'Please create a balanced set of questions covering all five traits.'}

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
      const response = await this.createCompletion(messages, {
        temperature: 0.7,
        max_tokens: 1500
      });

      console.log('Generate questions response:', response.substring(0, 100) + '...');

      // Try to parse the response directly first
      let questionsData;
      try {
        // Try to parse the entire response as JSON
        questionsData = JSON.parse(response.trim());
        console.log('Successfully parsed entire response as JSON array');
      } catch (directParseError) {
        console.log('Could not parse entire response as JSON, trying to extract JSON array');

        // Extract JSON array from response
        const jsonMatch = response.match(/\[[\s\S]*\]/);
        if (!jsonMatch) {
          throw new Error('Failed to parse questions from AI response');
        }

        questionsData = JSON.parse(jsonMatch[0]);
        console.log('Successfully extracted and parsed JSON array from response');
      }

      // Format and validate questions
      return questionsData.map((q: any, index: number) => ({
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
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error generating AI questions:', errorMessage);
      // Return mock questions as fallback
      return this.getMockQuestions(count);
    }
  }

  protected getMockQuestions(count: number): any[] {
    const mockQuestions = [
      {
        id: 'ai-q1',
        text: 'I often find myself lost in thought about abstract concepts and ideas.',
        trait: 'openness',
        weight: 1,
      },
      {
        id: 'ai-q2',
        text: 'I prefer to have a detailed plan before starting any project.',
        trait: 'conscientiousness',
        weight: 1,
      },
      {
        id: 'ai-q3',
        text: 'I feel energized after spending time at social gatherings.',
        trait: 'extraversion',
        weight: 1,
      },
      {
        id: 'ai-q4',
        text: 'I prioritize others\' needs over my own in most situations.',
        trait: 'agreeableness',
        weight: 1,
      },
      {
        id: 'ai-q5',
        text: 'I tend to worry about things that might go wrong in the future.',
        trait: 'neuroticism',
        weight: 1,
      },
      {
        id: 'ai-q6',
        text: 'I enjoy exploring new artistic and cultural experiences.',
        trait: 'openness',
        weight: 1,
      },
      {
        id: 'ai-q7',
        text: 'I keep my belongings organized and know where everything is.',
        trait: 'conscientiousness',
        weight: 1,
      },
      {
        id: 'ai-q8',
        text: 'I find it easy to introduce myself to strangers.',
        trait: 'extraversion',
        weight: 1,
      },
      {
        id: 'ai-q9',
        text: 'I believe in giving people second chances.',
        trait: 'agreeableness',
        weight: 1,
      },
      {
        id: 'ai-q10',
        text: 'I get frustrated easily when things don\'t go as planned.',
        trait: 'neuroticism',
        weight: 1,
      },
      {
        id: 'ai-q11',
        text: 'I enjoy thinking about philosophical questions.',
        trait: 'openness',
        weight: 1,
      },
      {
        id: 'ai-q12',
        text: 'I follow through on commitments I make.',
        trait: 'conscientiousness',
        weight: 1,
      },
      {
        id: 'ai-q13',
        text: 'I prefer being the center of attention in social situations.',
        trait: 'extraversion',
        weight: 1,
      },
      {
        id: 'ai-q14',
        text: 'I go out of my way to make others feel comfortable.',
        trait: 'agreeableness',
        weight: 1,
      },
      {
        id: 'ai-q15',
        text: 'I often feel overwhelmed by my responsibilities.',
        trait: 'neuroticism',
        weight: 1,
      },
    ];

    // Add standard options to each question
    const questionsWithOptions = mockQuestions.map(q => ({
      ...q,
      options: [
        { value: 1, text: 'Strongly Disagree' },
        { value: 2, text: 'Disagree' },
        { value: 3, text: 'Neutral' },
        { value: 4, text: 'Agree' },
        { value: 5, text: 'Strongly Agree' },
      ],
    }));

    // Return requested number of questions
    return questionsWithOptions.slice(0, count);
  }
}

// Create a singleton instance with the API key
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || 'sk-5d534c441ee24bd88cf4c642908d4c18';

// Create a mock API for development if the API key is not available or invalid
class MockDeepSeekAPI extends DeepSeekAPI {
  async createCompletion(
    messages: DeepSeekMessage[],
    options: DeepSeekCompletionOptions = {}
  ): Promise<string> {
    console.log('Using mock DeepSeek API');
    return `
1. You show a strong balance between analytical thinking and emotional intelligence, allowing you to approach problems from multiple angles while maintaining empathy for others involved.

2. Your responses indicate a preference for structured environments, but you also demonstrate adaptability when faced with unexpected changes or challenges.

3. You tend to be introspective and value self-improvement, which helps you continuously grow but may sometimes lead to overthinking or being too self-critical.

4. In social situations, you strike a balance between listening and contributing, making you an effective communicator who can both understand others' perspectives and clearly express your own.

5. Your decision-making process combines logical analysis with consideration of how choices affect people, leading to well-rounded decisions that account for both practical outcomes and human factors.
    `;
  }

  async generatePersonalityInsights(
    traitScores: Record<string, number>,
    answers: any[]
  ): Promise<string[]> {
    console.log('Using mock personality insights generation');
    return [
      "You show a strong balance between analytical thinking and emotional intelligence, allowing you to approach problems from multiple angles while maintaining empathy for others involved.",
      "Your responses indicate a preference for structured environments, but you also demonstrate adaptability when faced with unexpected changes or challenges.",
      "You tend to be introspective and value self-improvement, which helps you continuously grow but may sometimes lead to overthinking or being too self-critical.",
      "In social situations, you strike a balance between listening and contributing, making you an effective communicator who can both understand others' perspectives and clearly express your own.",
      "Your decision-making process combines logical analysis with consideration of how choices affect people, leading to well-rounded decisions that account for both practical outcomes and human factors."
    ];
  }

  // Override the base class method to use mock data
  async generatePersonalityQuestions(
    count: number = 10,
    previousAnswers: any[] = [],
    traits: Record<string, number> = {}
  ): Promise<any[]> {
    console.log('Using mock personality questions generation');
    return this.getMockQuestions(count);
  }

  protected getMockQuestions(count: number): any[] {
    const mockQuestions = [
      {
        id: 'ai-q1',
        text: 'I often find myself lost in thought about abstract concepts and ideas.',
        trait: 'openness',
        weight: 1,
      },
      {
        id: 'ai-q2',
        text: 'I prefer to have a detailed plan before starting any project.',
        trait: 'conscientiousness',
        weight: 1,
      },
      {
        id: 'ai-q3',
        text: 'I feel energized after spending time at social gatherings.',
        trait: 'extraversion',
        weight: 1,
      },
      {
        id: 'ai-q4',
        text: 'I prioritize others\' needs over my own in most situations.',
        trait: 'agreeableness',
        weight: 1,
      },
      {
        id: 'ai-q5',
        text: 'I tend to worry about things that might go wrong in the future.',
        trait: 'neuroticism',
        weight: 1,
      },
      {
        id: 'ai-q6',
        text: 'I enjoy exploring new artistic and cultural experiences.',
        trait: 'openness',
        weight: 1,
      },
      {
        id: 'ai-q7',
        text: 'I keep my belongings organized and know where everything is.',
        trait: 'conscientiousness',
        weight: 1,
      },
      {
        id: 'ai-q8',
        text: 'I find it easy to introduce myself to strangers.',
        trait: 'extraversion',
        weight: 1,
      },
      {
        id: 'ai-q9',
        text: 'I believe in giving people second chances.',
        trait: 'agreeableness',
        weight: 1,
      },
      {
        id: 'ai-q10',
        text: 'I get frustrated easily when things don\'t go as planned.',
        trait: 'neuroticism',
        weight: 1,
      },
      {
        id: 'ai-q11',
        text: 'I enjoy thinking about philosophical questions.',
        trait: 'openness',
        weight: 1,
      },
      {
        id: 'ai-q12',
        text: 'I follow through on commitments I make.',
        trait: 'conscientiousness',
        weight: 1,
      },
      {
        id: 'ai-q13',
        text: 'I prefer being the center of attention in social situations.',
        trait: 'extraversion',
        weight: 1,
      },
      {
        id: 'ai-q14',
        text: 'I go out of my way to make others feel comfortable.',
        trait: 'agreeableness',
        weight: 1,
      },
      {
        id: 'ai-q15',
        text: 'I often feel overwhelmed by my responsibilities.',
        trait: 'neuroticism',
        weight: 1,
      },
    ];

    // Add standard options to each question
    const questionsWithOptions = mockQuestions.map(q => ({
      ...q,
      options: [
        { value: 1, text: 'Strongly Disagree' },
        { value: 2, text: 'Disagree' },
        { value: 3, text: 'Neutral' },
        { value: 4, text: 'Agree' },
        { value: 5, text: 'Strongly Agree' },
      ],
    }));

    // Return requested number of questions
    return questionsWithOptions.slice(0, count);
  }
}

// Use the real API in production, mock in development or if API key is invalid
export const deepseekApi = DEEPSEEK_API_KEY && DEEPSEEK_API_KEY.startsWith('sk-')
  ? new DeepSeekAPI(DEEPSEEK_API_KEY)
  : new MockDeepSeekAPI(DEEPSEEK_API_KEY);
