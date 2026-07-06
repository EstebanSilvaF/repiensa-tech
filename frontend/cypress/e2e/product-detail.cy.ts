describe('Product detail — detalle del producto', () => {
  it('el comprador ve detalle y acciones del producto', () => {
    cy.fixture('users').then(({ buyer, products }) => {
      cy.login(buyer.email, buyer.password);
      cy.visit(`/producto/${products.arduinoId}`);

      cy.contains('h2', 'Arduino Uno R3', { timeout: 10000 }).should('be.visible');
      cy.contains('dt', 'Categoría').parent().should('contain.text', 'Microcontroladores');
      cy.contains('dt', 'Disponibilidad').parent().should('contain.text', 'Disponible');
      cy.contains('button', 'Abrir chat con vendedor').should('be.visible');
      cy.contains('button', 'Reservar producto').should('be.visible');
    });
  });

  it('el vendedor ve su propio producto sin acciones de compra', () => {
    cy.fixture('users').then(({ student, products }) => {
      cy.login(student.email, student.password);
      cy.visit(`/producto/${products.arduinoId}`);

      cy.contains('h2', 'Arduino Uno R3', { timeout: 10000 }).should('be.visible');
      cy.contains('Este es tu producto publicado.').should('be.visible');
      cy.contains('button', 'Abrir chat con vendedor').should('not.exist');
      cy.contains('button', 'Reservar producto').should('not.exist');
    });
  });

  it('navega desde la galería al detalle', () => {
    cy.login();
    cy.visit('/inicio');

    cy.contains('a', 'Arduino Uno R3', { timeout: 10000 }).click();
    cy.url().should('match', /\/producto\/.+/);
    cy.contains('h1', 'Detalle del producto').should('be.visible');
    cy.contains('h2', 'Arduino Uno R3').should('be.visible');
  });

  it('vuelve a la galería desde el detalle', () => {
    cy.fixture('users').then(({ buyer, products }) => {
      cy.login(buyer.email, buyer.password);
      cy.visit(`/producto/${products.arduinoId}`);

      cy.contains('a', '← Volver').click();
      cy.url().should('include', '/inicio');
    });
  });
});
