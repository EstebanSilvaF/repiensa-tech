describe('Navigation — rutas protegidas', () => {
  beforeEach(() => {
    cy.login();
  });

  it('navega a historial desde la navbar', () => {
    cy.visit('/inicio');
    cy.get('nav[aria-label="Navegación principal"]').contains('a', 'Historial').click();
    cy.url().should('include', '/history');
    cy.contains('h1', 'Historial').should('be.visible');
  });

  it('navega a publicar producto desde la navbar', () => {
    cy.visit('/inicio');
    cy.get('nav[aria-label="Navegación principal"]')
      .contains('a', 'Publicar producto')
      .click();
    cy.url().should('include', '/publish');
    cy.contains('h1', 'Publicar producto').should('be.visible');
  });

  it('navega al perfil desde el icono de usuario', () => {
    cy.visit('/inicio');
    cy.fixture('users').then(({ student }) => {
      cy.get(`button[aria-label="Perfil de ${student.fullName}"]`).click();
      cy.contains('[role="menuitem"]', 'Mi perfil').click();
      cy.url().should('include', '/profile');
      cy.contains('h1', student.fullName).should('be.visible');
    });
  });

  it('navega al chat desde la navbar', () => {
    cy.visit('/inicio');
    cy.get('a[aria-label="Mensajes"]').click();
    cy.url().should('include', '/chat');
    cy.contains('Selecciona una conversación para ver los mensajes.').should('be.visible');
  });
});
