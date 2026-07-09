describe('Library — biblioteca', () => {
  beforeEach(() => {
    cy.loginLibrary();
    cy.visit('/inicio');
  });

  it('muestra navegación exclusiva de biblioteca', () => {
    cy.get('nav[aria-label="Navegación principal"]').within(() => {
      cy.contains('a', 'Inicio').should('be.visible');
      cy.contains('a', 'Biblioteca').should('be.visible');
      cy.contains('a', 'Entregados').should('be.visible');
      cy.contains('a', 'Historial').should('not.exist');
      cy.contains('a', 'Publicar producto').should('not.exist');
    });
  });

  it('carga la vista de biblioteca con productos del seed', () => {
    cy.get('nav[aria-label="Navegación principal"]').contains('a', 'Biblioteca').click();
    cy.url().should('include', '/biblioteca');
    cy.contains('h1', 'Biblioteca', { timeout: 10000 }).should('be.visible');
    cy.contains('Arduino Uno R3').should('be.visible');
    cy.contains('Sensor HC-SR04').should('be.visible');
  });

  it('carga la vista de entregados', () => {
    cy.get('nav[aria-label="Navegación principal"]').contains('a', 'Entregados').click();
    cy.url().should('include', '/biblioteca/entregados');
    cy.contains('h1', 'Biblioteca', { timeout: 10000 }).should('be.visible');
    cy.contains('Historial de productos entregados').should('be.visible');
  });

  it('puede abrir historial desde el menú de perfil', () => {
    cy.fixture('users').then(({ library }) => {
      cy.get(`button[aria-label="Perfil de ${library.fullName}"]`).click();
      cy.contains('[role="menuitem"]', 'Historial').click();
      cy.url().should('include', '/history');
      cy.contains('h1', 'Historial').should('be.visible');
    });
  });
});
