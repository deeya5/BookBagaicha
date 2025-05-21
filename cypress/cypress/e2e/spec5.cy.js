describe('Login and read a book', () => {
  it('logs in and opens a book to read', () => {
    // Step 1: Visit login page
    cy.visit('http://localhost:3000/login');

    // Step 2: Login
    cy.get('input[placeholder="Email"]').type('emily@gmail.com');
    cy.get('input[placeholder="Password"]').type('emily');
    cy.get('button[type="submit"]').click();

    // Step 3: Confirm homepage loaded
    cy.url().should('eq', 'http://localhost:3000/');

    // Step 4: Wait for books to load on homepage or navigate to Explore
    cy.get('.book-card, .book-item', { timeout: 10000 }).should('exist');

    // Step 5: Click on the first book
    cy.get('.book-card a, .book-item a')
      .first()
      .scrollIntoView()
      .click({ force: true });

    // Step 6: On book detail page, wait for Read button
    cy.url().should('include', '/books/');
    cy.get('button').contains('Read', { timeout: 10000 })
      .scrollIntoView()
      .click({ force: true });

    // Step 7: Confirm reader view or book content is visible
    cy.contains(/chapter|page|reading|scroll/i, { timeout: 10000 }).should('be.visible');
  });
});
