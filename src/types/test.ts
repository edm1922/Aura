export type PersonalityTrait = {
  id: string
  name: string
  description: string
  category: 'openness' | 'conscientiousness' | 'extraversion' | 'agreeableness' | 'neuroticism'
}

export type Question = {
  id: string
  text: string
  trait: PersonalityTrait['category']
  weight: number
  options: {
    value: number
    text: string
  }[]
}

export type TestAnswer = {
  questionId: string
  value: number
  trait: PersonalityTrait['category']
}

export type TestResult = {
  id: string
  userId: string
  answers: TestAnswer[]
  traits: {
    [key in PersonalityTrait['category']]: number
  }
  insights: string[]
  createdAt: Date
  completedAt: Date | null
}

export type TestProgress = {
  currentQuestion: number
  totalQuestions: number
  answers: TestAnswer[]
  isComplete: boolean
} 