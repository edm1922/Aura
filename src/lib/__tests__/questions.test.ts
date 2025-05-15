import { questions, getRandomQuestions, calculateTraitScores } from '../questions'

describe('Questions Library', () => {
  describe('questions array', () => {
    it('should contain questions with required properties', () => {
      expect(questions.length).toBeGreaterThan(0)
      
      questions.forEach(question => {
        expect(question).toHaveProperty('id')
        expect(question).toHaveProperty('text')
        expect(question).toHaveProperty('trait')
        expect(question).toHaveProperty('weight')
        expect(question).toHaveProperty('options')
        expect(Array.isArray(question.options)).toBe(true)
        expect(question.options.length).toBeGreaterThan(0)
        
        question.options.forEach(option => {
          expect(option).toHaveProperty('value')
          expect(option).toHaveProperty('text')
          expect(typeof option.value).toBe('number')
          expect(typeof option.text).toBe('string')
        })
      })
    })
    
    it('should have valid trait categories', () => {
      const validTraits = ['openness', 'conscientiousness', 'extraversion', 'agreeableness', 'neuroticism']
      
      questions.forEach(question => {
        expect(validTraits).toContain(question.trait)
      })
    })
  })
  
  describe('getRandomQuestions', () => {
    it('should return the requested number of questions', () => {
      const count = 5
      const result = getRandomQuestions(count)
      
      expect(result).toHaveLength(count)
    })
    
    it('should return all questions if count is greater than available questions', () => {
      const count = questions.length + 10
      const result = getRandomQuestions(count)
      
      expect(result).toHaveLength(questions.length)
    })
    
    it('should return random questions (not always the same order)', () => {
      // This test might occasionally fail due to randomness, but it's unlikely
      const result1 = getRandomQuestions(questions.length)
      const result2 = getRandomQuestions(questions.length)
      
      // Check if the order is different (at least one question is in a different position)
      let isDifferent = false
      for (let i = 0; i < questions.length; i++) {
        if (result1[i].id !== result2[i].id) {
          isDifferent = true
          break
        }
      }
      
      expect(isDifferent).toBe(true)
    })
  })
  
  describe('calculateTraitScores', () => {
    it('should calculate trait scores correctly', () => {
      const answers = [
        { questionId: 'q1', value: 5 }, // openness
        { questionId: 'q2', value: 4 }, // conscientiousness
        { questionId: 'q3', value: 3 }, // extraversion
        { questionId: 'q4', value: 2 }, // agreeableness
        { questionId: 'q5', value: 1 }, // neuroticism
      ]
      
      const scores = calculateTraitScores(answers)
      
      expect(scores).toHaveProperty('openness')
      expect(scores).toHaveProperty('conscientiousness')
      expect(scores).toHaveProperty('extraversion')
      expect(scores).toHaveProperty('agreeableness')
      expect(scores).toHaveProperty('neuroticism')
      
      // Check specific values based on the test data
      expect(scores.openness).toBe(5)
      expect(scores.conscientiousness).toBe(4)
      expect(scores.extraversion).toBe(3)
      expect(scores.agreeableness).toBe(2)
      expect(scores.neuroticism).toBe(1)
    })
    
    it('should handle empty answers', () => {
      const scores = calculateTraitScores([])
      
      expect(scores.openness).toBe(0)
      expect(scores.conscientiousness).toBe(0)
      expect(scores.extraversion).toBe(0)
      expect(scores.agreeableness).toBe(0)
      expect(scores.neuroticism).toBe(0)
    })
    
    it('should handle questions with weights', () => {
      // Create a test answer for a question with weight 2
      const testQuestion = questions.find(q => q.id === 'q1')
      const originalWeight = testQuestion ? testQuestion.weight : 1
      
      if (testQuestion) {
        testQuestion.weight = 2
        
        const answers = [
          { questionId: 'q1', value: 3 }, // openness with weight 2
        ]
        
        const scores = calculateTraitScores(answers)
        
        // The score should be value * weight = 3 * 2 = 6, but divided by count = 1, so 6
        expect(scores.openness).toBe(6)
        
        // Reset the weight for other tests
        testQuestion.weight = originalWeight
      }
    })
  })
})
