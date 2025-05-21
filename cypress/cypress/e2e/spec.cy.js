describe('BookBagaicha Login', () => {
  it('should log in successfully with valid credentials', () => {
    cy.visit('http://localhost:3000/login');

    cy.get('input[placeholder="Email"]')
      .should('not.be.disabled')
      .type('deeyabastola@gmail.com');

    cy.get('input[placeholder="Password"]')
      .should('not.be.disabled')
      .type('deeya');

    cy.get('button[type="submit"]').click();

    // Check URL redirects to homepage
    cy.url().should('eq', 'http://localhost:3000/');

    // check for some text on homepage
    cy.contains('Book Bagaicha Originals');
  });
});
