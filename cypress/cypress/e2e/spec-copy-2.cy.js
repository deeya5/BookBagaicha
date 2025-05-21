describe('Login and open a book to read', () => {
  it('logs in, opens the first book, and clicks the Read button', () => {
    // Step 1: Visit login page
    cy.visit('http://localhost:3000/login');

    // Step 2: Login
    cy.get('input[placeholder="Email"]').type('deeyabastola@gmail.com');
    cy.get('input[placeholder="Password"]').type('deeya');
    cy.get('button[type="submit"]').click();

    // Step 3: Confirm redirected to homepage
    cy.url().should('eq', 'http://localhost:3000/');

    // Step 4: Wait for book cards to appear
    cy.get('.book-card', { timeout: 10000 }).should('have.length.greaterThan', 0);

    // Step 5: Click the first book card (no nested <a>)
    cy.get('.book-card')
      .first()
      .scrollIntoView()
      .should('be.visible')
      .click({ force: true });

    // Step 6: Confirm book detail page is loaded
    cy.url().should('include', '/book');

    // Step 7: Click on the "Read" button
    cy.contains('button, a', /read/i, { timeout: 8000 })
      .scrollIntoView()
      .should('be.visible')
      .click({ force: true });

    // Optional: Step 8: Confirm reading view loaded
    cy.url().should('include', '/read');
  });
});
