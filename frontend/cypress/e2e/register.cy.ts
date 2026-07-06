describe('Register — registro', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
  });

  it('muestra el formulario y carga universidades', () => {
    cy.visit('/register');
    cy.contains('h1', 'Crea tu cuenta').should('be.visible');
    cy.get('#university').should('be.visible');
    cy.get('#name').should('be.visible');
    cy.get('#email').should('be.visible');
    cy.get('#password').should('be.visible');
    cy.get('#confirmPassword').should('be.visible');
    cy.contains('button', 'Registrarse').should('be.visible');

    cy.get('#university option', { timeout: 10000 })
      .should('have.length.greaterThan', 1);
  });

  it('rechaza contraseñas que no coinciden', () => {
    cy.visit('/register');

    cy.get('#university option', { timeout: 10000 })
      .eq(1)
      .then(($option) => {
        cy.get('#university').select($option.val() as string);
      });

    cy.get('#name').type('Usuario Prueba');
    cy.get('#email').type('prueba@uniempresarial.edu.co');
    cy.get('#password').type('password123');
    cy.get('#confirmPassword').type('otra-clave');
    cy.contains('label', 'Acepto los').find('input[type="checkbox"]').check();
    cy.contains('button', 'Registrarse').click();

    cy.get('[role="alert"]').should('contain.text', 'Las contraseñas no coinciden');
  });

  it('rechaza envío sin aceptar términos', () => {
    cy.visit('/register');

    cy.get('#university option', { timeout: 10000 })
      .eq(1)
      .then(($option) => {
        cy.get('#university').select($option.val() as string);
      });

    cy.get('#name').type('Usuario Prueba');
    cy.get('#email').type('prueba@uniempresarial.edu.co');
    cy.get('#password').type('password123');
    cy.get('#confirmPassword').type('password123');
    cy.contains('button', 'Registrarse').click();

    cy.get('[role="alert"]').should('contain.text', 'Debes aceptar los Términos y Condiciones');
  });

  it('enlaza a login desde el pie del formulario', () => {
    cy.visit('/register');
    cy.contains('a', 'Inicia sesión').click();
    cy.url().should('include', '/login');
  });
});
