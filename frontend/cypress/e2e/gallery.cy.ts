describe('Gallery — galería autenticada', () => {
  beforeEach(() => {
    cy.login();
    cy.visit('/inicio');
  });

  it('carga productos del seed', () => {
    cy.contains('Arduino Uno R3', { timeout: 10000 }).should('be.visible');
    cy.contains('Sensor HC-SR04').should('be.visible');
  });

  it('muestra la navbar con links principales', () => {
    cy.get('nav[aria-label="Navegación principal"]').within(() => {
      cy.contains('a', 'Inicio').should('be.visible');
      cy.contains('a', 'Publicar producto').should('be.visible');
      cy.contains('a', 'Historial').should('be.visible');
    });
  });

  it('filtra productos al buscar Arduino', () => {
    cy.get('input[type="search"]').clear().type('Arduino');
    cy.contains('Arduino Uno R3', { timeout: 10000 }).should('be.visible');
    cy.contains('Sensor HC-SR04').should('not.exist');
  });
});
