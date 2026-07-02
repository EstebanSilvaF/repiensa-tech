require('dotenv/config');

const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const compiledSeed = path.join(
  __dirname,
  '..',
  'dist',
  'infrastructure',
  'seed',
  'database.seed.js',
);

if (fs.existsSync(compiledSeed)) {
  require(compiledSeed);
} else {
  const result = spawnSync(
    process.platform === 'win32' ? 'npx.cmd' : 'npx',
    ['ts-node', 'src/infrastructure/seed/database.seed.ts'],
    { stdio: 'inherit', cwd: path.join(__dirname, '..'), shell: process.platform === 'win32' },
  );
  process.exit(result.status ?? 1);
}
