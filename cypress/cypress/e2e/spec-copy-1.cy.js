describe('BookBagaicha Search', () => {
  it('should allow users to search for a book and show results', () => {
    cy.visit('http://localhost:3000');

    // Wait for search input to be available
    cy.get('input[placeholder*="Search"]').should('not.be.disabled');

    // Type with a small delay to avoid race conditions with React state updates
    cy.get('input[placeholder*="Search"]')
      .type('Test', { delay: 100 });

    // Wait for network request to complete (if you can alias it)
    // Example (if you alias in app): cy.intercept(...).as('searchBooks');
    // cy.wait('@searchBooks');

    // Wait for results to appear
    cy.get('.search-results', { timeout: 5000 }).should('be.visible');

    // Confirm results exist (optional: check for one of the expected titles)
    cy.get('.search-results ul li').should('exist');
  });
});
