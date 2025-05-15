import { handleApiError, formatError, ErrorMessages } from '../errorHandling'

describe('Error Handling Utilities', () => {
  describe('handleApiError', () => {
    it('should extract error message from JSON response', async () => {
      const mockResponse = {
        json: jest.fn().mockResolvedValue({ error: 'Test error message' }),
        status: 400,
        statusText: 'Bad Request',
      } as unknown as Response
      
      const result = await handleApiError(mockResponse)
      expect(result).toBe('Test error message')
      expect(mockResponse.json).toHaveBeenCalled()
    })
    
    it('should use status code when no error message is present', async () => {
      const mockResponse = {
        json: jest.fn().mockResolvedValue({}),
        status: 404,
        statusText: 'Not Found',
      } as unknown as Response
      
      const result = await handleApiError(mockResponse)
      expect(result).toBe('Error: 404 Not Found')
      expect(mockResponse.json).toHaveBeenCalled()
    })
    
    it('should handle JSON parsing errors', async () => {
      const mockResponse = {
        json: jest.fn().mockRejectedValue(new Error('Invalid JSON')),
        status: 500,
        statusText: 'Internal Server Error',
      } as unknown as Response
      
      const result = await handleApiError(mockResponse)
      expect(result).toBe('Error: 500 Internal Server Error')
      expect(mockResponse.json).toHaveBeenCalled()
    })
  })
  
  describe('formatError', () => {
    it('should format Error objects', () => {
      const error = new Error('Test error')
      const result = formatError(error)
      expect(result).toBe('Test error')
    })
    
    it('should format string errors', () => {
      const error = 'String error message'
      const result = formatError(error)
      expect(result).toBe('String error message')
    })
    
    it('should handle unknown error types', () => {
      const error = { custom: 'error' }
      const result = formatError(error)
      expect(result).toBe('An unexpected error occurred')
    })
    
    it('should handle null or undefined errors', () => {
      expect(formatError(null)).toBe('An unexpected error occurred')
      expect(formatError(undefined)).toBe('An unexpected error occurred')
    })
  })
  
  describe('ErrorMessages', () => {
    it('should contain all required error message constants', () => {
      expect(ErrorMessages).toHaveProperty('NETWORK')
      expect(ErrorMessages).toHaveProperty('UNAUTHORIZED')
      expect(ErrorMessages).toHaveProperty('NOT_FOUND')
      expect(ErrorMessages).toHaveProperty('SERVER')
      expect(ErrorMessages).toHaveProperty('VALIDATION')
      expect(ErrorMessages).toHaveProperty('DEFAULT')
      
      // Check that all messages are strings
      Object.values(ErrorMessages).forEach(message => {
        expect(typeof message).toBe('string')
        expect(message.length).toBeGreaterThan(0)
      })
    })
  })
})
