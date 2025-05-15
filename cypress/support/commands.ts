// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

// Add Testing Library commands
import '@testing-library/cypress/add-commands'

// Custom command to simulate login
Cypress.Commands.add('login', (email = 'test@example.com', password = 'password123') => {
  // Mock the session
  cy.intercept('GET', '/api/auth/session', {
    statusCode: 200,
    body: {
      user: {
        id: 'test-user-id',
        name: 'Test User',
        email,
      },
    },
  }).as('sessionRequest')

  // Visit the dashboard
  cy.visit('/dashboard')
  cy.wait('@sessionRequest')
})

// Custom command to simulate completing a test
Cypress.Commands.add('completeTest', () => {
  // Mock the test submission
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
  
  // Answer all questions (simplified for test)
  for (let i = 0; i < 10; i++) {
    cy.contains('Agree').click()
    if (i < 9) {
      cy.contains('Next').click()
    } else {
      cy.contains('Complete').click()
    }
  }

  cy.wait('@testSubmitRequest')
})

// Declare the Cypress namespace to add the custom commands
declare global {
  namespace Cypress {
    interface Chainable {
      login(email?: string, password?: string): Chainable<void>
      completeTest(): Chainable<void>
    }
  }
}
