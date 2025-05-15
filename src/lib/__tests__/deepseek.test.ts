import { DeepSeekAPI, DeepSeekMessage } from '../deepseek'

// Mock the global fetch function
global.fetch = jest.fn()

describe('DeepSeekAPI', () => {
  let api: DeepSeekAPI
  
  beforeEach(() => {
    // Reset the mock before each test
    jest.resetAllMocks()
    api = new DeepSeekAPI('test-api-key')
  })
  
  describe('createCompletion', () => {
    it('should make a request to the DeepSeek API with correct parameters', async () => {
      // Mock successful response
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          choices: [{ message: { content: 'Test response' } }]
        })
      }
      
      // Set up the fetch mock
      ;(global.fetch as jest.Mock).mockResolvedValue(mockResponse)
      
      // Test messages
      const messages: DeepSeekMessage[] = [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: 'Hello!' }
      ]
      
      // Call the method
      const result = await api.createCompletion(messages, {
        temperature: 0.5,
        max_tokens: 500
      })
      
      // Check the result
      expect(result).toBe('Test response')
      
      // Verify fetch was called correctly
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.deepseek.com/v1/chat/completions',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer test-api-key'
          },
          body: JSON.stringify({
            model: 'deepseek-chat',
            messages,
            temperature: 0.5,
            max_tokens: 500,
            stream: false
          })
        }
      )
    })
    
    it('should handle API errors', async () => {
      // Mock error response
      const mockResponse = {
        ok: false,
        json: jest.fn().mockResolvedValue({
          error: { message: 'API error' }
        })
      }
      
      // Set up the fetch mock
      ;(global.fetch as jest.Mock).mockResolvedValue(mockResponse)
      
      // Test messages
      const messages: DeepSeekMessage[] = [
        { role: 'user', content: 'Hello!' }
      ]
      
      // Call the method and expect it to throw
      await expect(api.createCompletion(messages))
        .rejects
        .toThrow('DeepSeek API error: API error')
    })
  })
  
  describe('generatePersonalityInsights', () => {
    it('should call createCompletion with formatted trait scores and answers', async () => {
      // Mock the createCompletion method
      api.createCompletion = jest.fn().mockResolvedValue(
        '1. First insight\n2. Second insight\n3. Third insight'
      )
      
      // Test data
      const traitScores = {
        openness: 4.2,
        conscientiousness: 3.5,
        extraversion: 2.8,
        agreeableness: 4.0,
        neuroticism: 1.5
      }
      
      const answers = [
        { questionText: 'Question 1', answerText: 'Answer 1', answerValue: 4 },
        { questionText: 'Question 2', answerText: 'Answer 2', answerValue: 3 }
      ]
      
      // Call the method
      const insights = await api.generatePersonalityInsights(traitScores, answers)
      
      // Check that createCompletion was called with the right arguments
      expect(api.createCompletion).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            role: 'system',
            content: expect.stringContaining('expert personality analyst')
          }),
          expect.objectContaining({
            role: 'user',
            content: expect.stringContaining('openness: 4.20')
          })
        ]),
        expect.objectContaining({
          temperature: 0.7,
          max_tokens: 1000
        })
      )
      
      // Check that the insights were processed correctly
      expect(insights).toHaveLength(3)
      expect(insights[0]).toBe('First insight')
      expect(insights[1]).toBe('Second insight')
      expect(insights[2]).toBe('Third insight')
    })
  })
})
