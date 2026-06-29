import 'dotenv/config';
import { cloudinary, ensureCloudinaryConfig } from '../src/infrastructure/config/cloudinary';

async function check(): Promise<void> {
  ensureCloudinaryConfig();

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim();
  const apiKey = process.env.CLOUDINARY_API_KEY?.trim();

  console.log(`Cloud name: ${cloudName}`);
  console.log(`API Key:    ${apiKey}`);
  console.log('API Secret: **** (oculto)');
  console.log('Verificando con Cloudinary...');

  const result = await cloudinary.api.ping();
  console.log('OK — credenciales válidas:', result);
}

check()
  .catch((err) => {
    console.error('FALLO —', err.message ?? err);
    console.error('\nVe a https://console.cloudinary.com → Dashboard → API Keys');
    console.error('Copia de nuevo Cloud name, API Key y API Secret (no el Upload preset).');
    process.exit(1);
  });
