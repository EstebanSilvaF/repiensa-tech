describe('History — historial', () => {
  beforeEach(() => {
    cy.login();
    cy.visit('/history');
  });

  it('muestra resumen y filtros', () => {
    cy.contains('h1', 'Historial', { timeout: 10000 }).should('be.visible');
    cy.contains('Registro de tus compras, ventas y donaciones').should('be.visible');
    cy.get('[aria-label="Resumen"]').should('be.visible');
    cy.contains('Compras realizadas').should('be.visible');
    cy.contains('Ventas completadas').should('be.visible');
    cy.contains('Ahorrado comprando').should('be.visible');
  });

  it('muestra filtros de transacciones', () => {
    cy.get('[aria-label="Filtrar transacciones"]').within(() => {
      cy.contains('button', 'Todo').should('be.visible');
      cy.contains('button', 'Compras').should('be.visible');
      cy.contains('button', 'Ventas').should('be.visible');
      cy.contains('button', 'Donaciones').should('be.visible');
    });
  });

  it('permite cambiar filtro sin errores', () => {
    cy.get('[aria-label="Filtrar transacciones"]').contains('button', 'Compras').click();
    cy.get('[aria-label="Filtrar transacciones"]')
      .contains('button', 'Compras')
      .should('have.class', 'history-page__filter--active');
  });

  it('vuelve a la galería desde el enlace superior', () => {
    cy.contains('a', '← Volver').click();
    cy.url().should('include', '/inicio');
  });
});
