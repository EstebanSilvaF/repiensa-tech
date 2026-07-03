describe('Auth — autenticación', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
  });

  it('login exitoso redirige a /inicio y persiste el token', () => {
    cy.fixture('users').then(({ student }) => {
      cy.visit('/login');
      cy.get('#email').type(student.email);
      cy.get('#password').type(student.password);
      cy.contains('button', 'Iniciar sesión').click();

      cy.url().should('include', '/inicio');
      cy.window().then((win) => {
        expect(win.localStorage.getItem('repensa_token')).to.be.a('string').and.not.be.empty;
        expect(win.localStorage.getItem('repensa_user')).to.be.a('string').and.not.be.empty;
      });
    });
  });

  it('muestra error con credenciales inválidas', () => {
    cy.visit('/login');
    cy.get('#email').type('invalido@uniempresarial.edu.co');
    cy.get('#password').type('contraseña-incorrecta');
    cy.contains('button', 'Iniciar sesión').click();

    cy.get('[role="alert"]').should('be.visible').and('not.be.empty');
    cy.url().should('include', '/login');
  });

  it('redirige a login al visitar ruta protegida sin sesión', () => {
    cy.visit('/inicio');
    cy.url().should('include', '/login');
  });
});
