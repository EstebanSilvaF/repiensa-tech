describe('Publish — publicar producto', () => {
  beforeEach(() => {
    cy.login();
    cy.visit('/publish');
  });

  it('muestra el formulario de publicación', () => {
    cy.contains('h1', 'Publicar producto', { timeout: 10000 }).should('be.visible');
    cy.contains('h2', 'Foto del producto').should('be.visible');
    cy.contains('h2', 'Información básica').should('be.visible');
    cy.contains('h2', 'Estado del producto').should('be.visible');
    cy.contains('button', 'Publicar').should('be.visible');
  });

  it('redirige a login si no hay sesión', () => {
    cy.clearLocalStorage();
    cy.visit('/publish');
    cy.url().should('include', '/login');
  });
});
