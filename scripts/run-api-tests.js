const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');

const ROOT = path.join(__dirname, '..');
const COLLECTION = path.join(ROOT, 'repensa-postman-collection.json');
const DEFAULT_ENV = path.join(ROOT, 'postman', 'repensa-local.environment.json');

function parseArgs(argv) {
  const args = { reporter: 'cli', exportPath: null, envFile: DEFAULT_ENV };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--reporter') {
      args.reporter = argv[i + 1];
      i += 1;
    } else if (arg === '--export') {
      args.exportPath = argv[i + 1];
      i += 1;
    } else if (arg === '--env') {
      args.envFile = path.resolve(argv[i + 1]);
      i += 1;
    }
  }
  return args;
}

function readBaseUrl(envFile) {
  if (process.env.BASE_URL) {
    return process.env.BASE_URL;
  }

  const raw = JSON.parse(fs.readFileSync(envFile, 'utf8'));
  const entry = raw.values.find((v) => v.key === 'baseUrl');
  return entry?.value || 'http://localhost:3000';
}

function waitForHealth(baseUrl, timeoutMs = 60000, intervalMs = 2000) {
  const healthUrl = new URL('/health', baseUrl);
  const client = healthUrl.protocol === 'https:' ? https : http;
  const started = Date.now();

  return new Promise((resolve, reject) => {
    const attempt = () => {
      const req = client.get(healthUrl, (res) => {
        res.resume();
        if (res.statusCode === 200) {
          resolve();
          return;
        }
        schedule();
      });

      req.on('error', schedule);
      req.setTimeout(5000, () => {
        req.destroy();
        schedule();
      });
    };

    const schedule = () => {
      if (Date.now() - started >= timeoutMs) {
        reject(new Error(`Backend no respondió en ${healthUrl} dentro de ${timeoutMs}ms`));
        return;
      }
      setTimeout(attempt, intervalMs);
    };

    attempt();
  });
}

function runNewman(options) {
  const newmanBin = path.join(ROOT, 'node_modules', '.bin', process.platform === 'win32' ? 'newman.cmd' : 'newman');

  const args = [
    'run',
    COLLECTION,
    '-e',
    options.envFile,
    '--delay-request',
    '150',
    '--color',
    'on',
    '--reporters',
    options.reporter,
  ];

  if (options.exportPath) {
    const exportDir = path.dirname(options.exportPath);
    fs.mkdirSync(exportDir, { recursive: true });
    args.push('--reporter-json-export', options.exportPath);
  }

  return new Promise((resolve) => {
    const child = spawn(newmanBin, args, {
      cwd: ROOT,
      stdio: 'inherit',
      shell: true,
    });

    child.on('close', (code) => resolve(code ?? 1));
  });
}

async function main() {
  const options = parseArgs(process.argv.slice(2));

  if (!fs.existsSync(COLLECTION)) {
    console.error('No existe la colección. Ejecuta: npm run postman:generate');
    process.exit(1);
  }

  if (!fs.existsSync(options.envFile)) {
    console.error(`No existe el entorno: ${options.envFile}`);
    process.exit(1);
  }

  const baseUrl = readBaseUrl(options.envFile);
  console.log(`Esperando backend en ${baseUrl}/health ...`);
  await waitForHealth(baseUrl);

  console.log('Backend listo. Ejecutando Newman (sin db:reset)...');
  const exitCode = await runNewman(options);
  process.exit(exitCode);
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
