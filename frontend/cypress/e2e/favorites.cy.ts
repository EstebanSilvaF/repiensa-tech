describe('Favorites — favoritos', () => {
  beforeEach(() => {
    cy.login();
    cy.visit('/inicio');
    cy.window().then((win) => {
      win.localStorage.removeItem('repensa_favorites');
    });
  });

  it('muestra estado vacío sin favoritos', () => {
    cy.visit('/favorites');
    cy.contains('h1', 'Productos favoritos').should('be.visible');
    cy.contains('No tienes productos favoritos aún.').should('be.visible');
    cy.contains('a', 'Ir al catálogo de productos').should('be.visible');
  });

  it('guarda un producto en favoritos desde la galería', () => {
    cy.contains('Arduino Uno R3', { timeout: 10000 }).should('be.visible');

    cy.contains('.start-page__card', 'Arduino Uno R3')
      .find('button[aria-label="Agregar a favoritos"]')
      .click();

    cy.visit('/favorites');
    cy.contains('h1', 'Productos favoritos').should('be.visible');
    cy.contains('1 favoritos').should('be.visible');
    cy.contains('Arduino Uno R3').should('be.visible');
  });

  it('navega al detalle desde favoritos', () => {
    cy.contains('Arduino Uno R3', { timeout: 10000 }).should('be.visible');

    cy.contains('.start-page__card', 'Arduino Uno R3')
      .find('button[aria-label="Agregar a favoritos"]')
      .click();

    cy.visit('/favorites');
    cy.contains('a', 'Arduino Uno R3').click();
    cy.url().should('match', /\/producto\/.+/);
    cy.contains('h2', 'Arduino Uno R3').should('be.visible');
  });
});
