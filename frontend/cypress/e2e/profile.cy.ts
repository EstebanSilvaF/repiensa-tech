describe('Profile — perfil de usuario', () => {
  beforeEach(() => {
    cy.login();
    cy.visit('/profile');
  });

  it('muestra datos del usuario autenticado', () => {
    cy.fixture('users').then(({ student }) => {
      cy.contains('h1', student.fullName, { timeout: 10000 }).should('be.visible');
      cy.contains('p', student.email).should('be.visible');
      cy.contains('Bienvenido estudiante').should('be.visible');
    });
  });

  it('muestra enlaces a favoritos e historial', () => {
    cy.contains('a', 'Productos favoritos').should('be.visible');
    cy.contains('a', 'Historial').should('be.visible');
    cy.contains('button', 'Cerrar sesión').should('be.visible');
  });

  it('muestra formulario de cambio de contraseña', () => {
    cy.contains('h2', 'Configuración de perfil').should('be.visible');
    cy.get('#currentPassword').should('be.visible');
    cy.get('#newPassword').should('be.visible');
    cy.get('#confirmPassword').should('be.visible');
    cy.contains('button', 'Cambiar contraseña').should('be.visible');
  });

  it('cierra sesión y redirige al login', () => {
    cy.contains('button', 'Cerrar sesión').click();
    cy.url().should('include', '/login');
    cy.window().then((win) => {
      expect(win.localStorage.getItem('repensa_token')).to.be.null;
    });
  });
});
