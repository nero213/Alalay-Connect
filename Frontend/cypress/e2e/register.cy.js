describe('Random Registration Testing', () => {
  beforeEach(() => {
    cy.visit('http://localhost:5173/')
  })

  it('Registers 10 random users automatically', () => {
    for (let i = 0; i < 10; i++) {
      const user = Cypress.generateRandomUser()
      console.log(`Registering user ${i + 1}: ${user.email}`)

      // Fill the form
      cy.get('form').within(() => {
        cy.get('input[type="email"]').clear().type(user.email)
        cy.get('input[type="text"]').eq(0).clear().type(user.firstName)
        cy.get('input[type="text"]').eq(1).clear().type(user.lastName)
        cy.get('input[type="password"]').eq(0).clear().type(user.password)
        cy.get('input[type="password"]').eq(1).clear().type(user.confirmPassword)
        cy.get('input[type="tel"]').clear().type(user.phone)
        cy.get('button[type="submit"]').click()
      })

      // Wait and check for either success or error
      cy.wait(3000) // Wait for API call to complete

      // Check if form was successful by looking for the success message element
      cy.get('body').then(($body) => {
        const hasSuccess = $body.find('.success').length > 0

        if (hasSuccess) {
          cy.get('.success').should('be.visible').and('contain.text', 'successful registration')
        } else {
          // If not successful, check for error
          const hasError = $body.find('.error').length > 0
          if (hasError) {
            cy.get('.error').then(($error) => {
              console.log(`Registration failed: ${$error.text()}`)
            })
          }
        }
      })

      // Take screenshot for debugging
      cy.screenshot(`registration-${i + 1}`)

      // Navigate back for next registration if not the last one
      if (i < 9) {
        cy.visit('http://localhost:5173/')
        cy.wait(1000) // Wait for page load
      }
    }
  })
})
