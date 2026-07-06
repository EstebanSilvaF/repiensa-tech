describe('Smoke — rutas públicas', () => {
  it('muestra la landing con marca y enlace de login', () => {
    cy.visit('/');
    cy.contains('Re-Pensa').should('be.visible');
    cy.contains('a', 'Iniciar sesión').should('be.visible');
  });

  it('muestra el formulario de login', () => {
    cy.visit('/login');
    cy.contains('h1', 'Bienvenido').should('be.visible');
    cy.get('label[for="email"]').should('contain.text', 'Correo institucional');
    cy.get('label[for="password"]').should('contain.text', 'Contraseña');
    cy.get('#email').should('be.visible');
    cy.get('#password').should('be.visible');
    cy.contains('button', 'Iniciar sesión').should('be.visible');
  });

  it('navega a registro desde la landing', () => {
    cy.visit('/');
    cy.contains('a', 'Regístrate gratis').click();
    cy.url().should('include', '/register');
    cy.contains('h1', 'Crea tu cuenta').should('be.visible');
  });
});
