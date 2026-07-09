import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:8081",
    supportFile: "cypress/support/e2e.ts",
    specPattern: "cypress/e2e/**/*.cy.ts",
    viewportWidth: 1280,
    viewportHeight: 720,
    retries: {
      runMode: 1,
    },
    env: {
      studentEmail: "maria.rodriguez@uniempresarial.edu.co",
      studentPassword: "Estudiante1!",
      buyerEmail: "carlos.mendoza@uniempresarial.edu.co",
      buyerPassword: "Estudiante1!",
      libraryEmail: "biblioteca@uniempresarial.edu.co",
      libraryPassword: "biblioteca123",
    },
  },

  component: {
    devServer: {
      framework: "react",
      bundler: "vite",
    },
  },
});
