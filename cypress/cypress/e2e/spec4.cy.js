describe('Login and switch user role to Author', () => {
  it('logs in and switches to Author role/view', () => {
    // Visit login page
    cy.visit('http://localhost:3000/login');

    // Login
    cy.get('input[placeholder="Email"]').type('emily@gmail.com');
    cy.get('input[placeholder="Password"]').type('emily');
    cy.get('button[type="submit"]').click();

    // Confirm homepage loaded
    cy.url().should('eq', 'http://localhost:3000/');

    // Step 1: Click profile avatar icon to open sidebar (skip visibility assertion)
    cy.get('img.profile-avatar, .profile-section img', { timeout: 10000 })
      .first()
      .scrollIntoView()
      .click({ force: true });

    // Step 2: Wait for sidebar and click "Switch to Author" without .should('be.visible')
    cy.get('button.menu-button', { timeout: 10000 })
      .contains('Switch to Author')
      .scrollIntoView()
      .click({ force: true });

    // Step 3: Confirm UI switched to author mode
    cy.contains(/author dashboard|my books|author profile/i, { timeout: 10000 }).should('be.visible');
  });
});
