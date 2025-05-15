describe('Personality Test', () => {
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

    // Mock the adaptive questions API
    cy.intercept('POST', '/api/test/adaptive', {
      statusCode: 200,
      body: {
        nextQuestions: [
          {
            id: 'adaptive-q1',
            text: 'I enjoy trying new experiences and learning new things.',
            trait: 'openness',
            options: [
              { value: 1, text: 'Strongly Disagree' },
              { value: 2, text: 'Disagree' },
              { value: 3, text: 'Neutral' },
              { value: 4, text: 'Agree' },
              { value: 5, text: 'Strongly Agree' },
            ],
          },
          {
            id: 'adaptive-q2',
            text: 'I prefer to have a detailed plan before starting a project.',
            trait: 'conscientiousness',
            options: [
              { value: 1, text: 'Strongly Disagree' },
              { value: 2, text: 'Disagree' },
              { value: 3, text: 'Neutral' },
              { value: 4, text: 'Agree' },
              { value: 5, text: 'Strongly Agree' },
            ],
          },
          {
            id: 'adaptive-q3',
            text: 'I find it easy to empathize with others\' feelings.',
            trait: 'agreeableness',
            options: [
              { value: 1, text: 'Strongly Disagree' },
              { value: 2, text: 'Disagree' },
              { value: 3, text: 'Neutral' },
              { value: 4, text: 'Agree' },
              { value: 5, text: 'Strongly Agree' },
            ],
          },
        ],
        isAdaptive: true,
      },
    }).as('adaptiveQuestionsRequest')

    // Mock the test submission API
    cy.intercept('POST', '/api/test/submit', {
      statusCode: 200,
      body: {
        success: true,
        testId: 'mock-test-id',
        traits: {
          openness: 0.8,
          conscientiousness: 0.7,
          extraversion: 0.6,
          agreeableness: 0.9,
          neuroticism: 0.4,
        },
      },
    }).as('testSubmitRequest')

    cy.visit('/test/new')
    cy.wait('@sessionRequest')
  })

  it('should display the first question', () => {
    cy.contains('Question 1 of')
  })

  it('should allow answering questions and navigating through the test', () => {
    // Answer the first question
    cy.contains('Agree').click()
    cy.contains('Next').click()

    // Answer the second question
    cy.contains('Neutral').click()
    cy.contains('Next').click()

    // Verify we can go back
    cy.contains('Previous').click()
    cy.contains('Question 2 of')

    // Go forward again
    cy.contains('Next').click()
    cy.contains('Question 3 of')
  })

  it('should show adaptive mode after answering several questions', () => {
    // Answer the first 6 questions to trigger adaptive mode
    for (let i = 0; i < 6; i++) {
      cy.contains('Agree').click()
      cy.contains('Next').click()
    }

    // Wait for adaptive questions request
    cy.wait('@adaptiveQuestionsRequest')

    // Verify adaptive mode is active
    cy.contains('Adaptive Mode Active').should('exist')
  })

  it('should complete the test and show results', () => {
    // Answer all questions (simplified for test)
    for (let i = 0; i < 10; i++) {
      cy.contains('Agree').click()
      if (i < 9) {
        cy.contains('Next').click()
      } else {
        cy.contains('Complete').click()
      }
    }

    // Wait for test submission
    cy.wait('@testSubmitRequest')

    // Verify we're on the results page
    cy.url().should('include', '/test/results')
    cy.contains('Your Personality Profile').should('exist')
  })
})
