describe('Dashboard', () => {
  beforeEach(() => {
    // Mock the session to simulate a logged-in user
    cy.intercept('GET', '/api/auth/session', {
      statusCode: 200,
      body: {
        user: {
          id: 'test-user-id',
          name: 'Test User',
          email: 'test@example.com',
        },
      },
    }).as('sessionRequest')

    // Mock the test results API
    cy.intercept('GET', '/api/test/latest', {
      statusCode: 200,
      body: {
        traits: {
          openness: 0.8,
          conscientiousness: 0.7,
          extraversion: 0.6,
          agreeableness: 0.9,
          neuroticism: 0.4,
        },
      },
    }).as('testResultsRequest')

    // Mock the mood entries API
    cy.intercept('GET', '/api/mood', {
      statusCode: 200,
      body: {
        entries: [
          {
            id: 'mock-mood-1',
            userId: 'test-user-id',
            level: 4,
            category: 'happy',
            factors: ['exercise', 'social'],
            notes: 'Had a great day!',
            date: new Date().toISOString(),
            createdAt: new Date().toISOString(),
          },
        ],
      },
    }).as('moodEntriesRequest')

    // Mock the recommendations API
    cy.intercept('GET', '/api/recommendations', {
      statusCode: 200,
      body: {
        recommendations: {
          activities: [
            'Try a 10-minute mindfulness meditation to center yourself.',
            'Schedule a short walk in nature to improve mood and mental clarity.',
          ],
          content: [
            'Read "Atomic Habits" by James Clear for practical strategies.',
            'Listen to the "Ten Percent Happier" podcast for mindfulness techniques.',
          ],
          personalGrowth: [
            'Practice setting one small, achievable goal each day.',
            'Experiment with the "two-minute rule" for small tasks.',
          ],
        },
      },
    }).as('recommendationsRequest')

    cy.visit('/dashboard')
    cy.wait('@sessionRequest')
  })

  it('should display personalized greeting', () => {
    cy.contains('Welcome back, Test User')
  })

  it('should display main dashboard cards', () => {
    cy.contains('Start New Test')
    cy.contains('Test History')
    cy.contains('Your Profile')
  })

  it('should navigate to test page when clicking Begin Test', () => {
    cy.contains('Begin Test').click()
    cy.url().should('include', '/test')
  })

  it('should display aura visualization when test results exist', () => {
    cy.wait('@testResultsRequest')
    cy.get('[data-testid="aura-display"]').should('exist')
  })

  it('should display mood tracker when test results exist', () => {
    cy.wait('@testResultsRequest')
    cy.wait('@moodEntriesRequest')
    cy.contains('Mood Tracker').should('exist')
  })

  it('should display recommendations when test results exist', () => {
    cy.wait('@testResultsRequest')
    cy.wait('@recommendationsRequest')
    cy.contains('Personalized Recommendations').should('exist')
    cy.contains('Recommended Activities').should('exist')
  })
})
