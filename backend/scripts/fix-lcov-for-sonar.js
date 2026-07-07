const fs = require('fs');
const path = require('path');

const lcovPath = path.join(__dirname, '../coverage/lcov.info');

if (!fs.existsSync(lcovPath)) {
  console.error('No se encontró backend/coverage/lcov.info. Ejecuta primero npm run test:coverage.');
  process.exit(1);
}

const content = fs.readFileSync(lcovPath, 'utf8');
const fixed = content.replace(/^SF:(.+)$/gm, (_, filePath) => {
  const normalized = filePath.replace(/\\/g, '/');
  const fromBackend = normalized.startsWith('src/') ? `backend/${normalized}` : normalized;
  return `SF:${fromBackend}`;
});

fs.writeFileSync(lcovPath, fixed);
console.log('Rutas de lcov.info ajustadas para SonarQube.');
