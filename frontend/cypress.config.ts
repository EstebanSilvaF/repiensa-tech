import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5173',
    supportFile: 'cypress/support/e2e.ts',
    specPattern: 'cypress/e2e/**/*.cy.ts',
    viewportWidth: 1280,
    viewportHeight: 720,
    retries: {
      runMode: 1,
    },
    env: {
      studentEmail: 'maria.rodriguez@uniempresarial.edu.co',
      studentPassword: 'Estudiante1!',
    },
  },
});
