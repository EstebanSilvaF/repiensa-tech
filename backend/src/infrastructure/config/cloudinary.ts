import { v2 as cloudinary } from 'cloudinary';

function readEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Variable de entorno requerida: ${name}`);
  }
  return value;
}

export function ensureCloudinaryConfig(): void {
  cloudinary.config({
    cloud_name: readEnv('CLOUDINARY_CLOUD_NAME'),
    api_key:    readEnv('CLOUDINARY_API_KEY'),
    api_secret: readEnv('CLOUDINARY_API_SECRET'),
    secure:     true,
  });
}

export function getCloudinaryCloudName(): string {
  return readEnv('CLOUDINARY_CLOUD_NAME');
}

export { cloudinary };
