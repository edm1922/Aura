describe('Authentication', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('should navigate to sign in page', () => {
    cy.get('a').contains('Sign In').click()
    cy.url().should('include', '/auth/signin')
    cy.get('h1').should('contain', 'Sign In')
  })

  it('should show validation errors on empty form submission', () => {
    cy.visit('/auth/signin')
    cy.get('button[type="submit"]').click()
    cy.get('form').should('contain', 'required')
  })

  it('should navigate to sign up page', () => {
    cy.visit('/auth/signin')
    cy.get('a').contains('Sign Up').click()
    cy.url().should('include', '/auth/signup')
    cy.get('h1').should('contain', 'Sign Up')
  })

  // This test uses a mock user - in a real environment, you'd use a test database
  it('should allow user to sign in with valid credentials', () => {
    // Intercept the auth request and mock a successful response
    cy.intercept('POST', '/api/auth/callback/credentials', {
      statusCode: 200,
      body: {
        user: {
          name: 'Test User',
          email: 'test@example.com',
        },
      },
    }).as('signInRequest')

    cy.visit('/auth/signin')
    cy.get('input[name="email"]').type('test@example.com')
    cy.get('input[name="password"]').type('password123')
    cy.get('button[type="submit"]').click()

    cy.wait('@signInRequest')
    cy.url().should('include', '/dashboard')
  })
})
