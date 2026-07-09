declare global {
  namespace Cypress {
    interface Chainable {
      login(email?: string, password?: string): Cypress.Chainable<void>;
      loginLibrary(): Cypress.Chainable<void>;
    }
  }
}

Cypress.Commands.add('login', (email?: string, password?: string) => {
  const studentEmail = email ?? Cypress.env('studentEmail');
  const studentPassword = password ?? Cypress.env('studentPassword');

  cy.session([studentEmail, studentPassword], () => {
    cy.visit('/login');
    cy.get('#email').clear().type(studentEmail);
    cy.get('#password').clear().type(studentPassword);
    cy.contains('button', 'Iniciar sesión').click();
    cy.url().should('include', '/inicio');
  });
});

Cypress.Commands.add('loginLibrary', () => {
  cy.login(Cypress.env('libraryEmail'), Cypress.env('libraryPassword'));
});

export {};
