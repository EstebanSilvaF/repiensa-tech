import { cloudinary, ensureCloudinaryConfig, getCloudinaryCloudName } from '../../infrastructure/config/cloudinary';
import { createHttpError } from '../../presentation/middlewares/error.middleware';

const PRODUCT_FOLDER = 'repensa/products';
const MAX_UPLOAD_ATTEMPTS = 3;
const RETRY_DELAY_MS = 800;

const NETWORK_ERROR_CODES = new Set([
  'ENOTFOUND',
  'ECONNRESET',
  'ECONNREFUSED',
  'ETIMEDOUT',
  'EAI_AGAIN',
]);

function isNetworkError(error: unknown): boolean {
  const message = extractCloudinaryErrorMessage(error).toLowerCase();
  if (
    message.includes('enotfound') ||
    message.includes('econnrefused') ||
    message.includes('econnreset') ||
    message.includes('etimedout') ||
    message.includes('getaddrinfo') ||
    message.includes('network')
  ) {
    return true;
  }

  if (error && typeof error === 'object') {
    const record = error as Record<string, unknown>;
    const nested = record.error;
    if (nested && typeof nested === 'object' && 'code' in nested) {
      const code = String((nested as { code: unknown }).code);
      if (NETWORK_ERROR_CODES.has(code)) return true;
    }
    if ('code' in record && NETWORK_ERROR_CODES.has(String(record.code))) {
      return true;
    }
  }

  return false;
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export interface UploadedImage {
  image_url: string;
  image_public_id: string;
  width: number;
  height: number;
}

function extractCloudinaryErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  if (error && typeof error === 'object') {
    const record = error as Record<string, unknown>;

    if (typeof record.message === 'string' && record.message.trim()) {
      return record.message;
    }

    if (record.error) {
      return extractCloudinaryErrorMessage(record.error);
    }
  }

  return 'No se pudo subir la imagen a Cloudinary.';
}

function mapCloudinaryError(error: unknown): never {
  const message = extractCloudinaryErrorMessage(error);
  const lower = message.toLowerCase();

  if (message.includes('Invalid Signature')) {
    throw createHttpError(
      503,
      'Credenciales de Cloudinary inválidas. Revisa CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY y CLOUDINARY_API_SECRET en .env.'
    );
  }

  if (lower.includes('enotfound') || lower.includes('econnrefused') || lower.includes('network') || lower.includes('getaddrinfo')) {
    throw createHttpError(
      503,
      'No se pudo conectar con Cloudinary. Revisa tu conexión a internet, VPN o firewall (api.cloudinary.com).'
    );
  }

  if (lower.includes('invalid image')) {
    throw createHttpError(400, 'La imagen no es válida o está corrupta.');
  }

  const httpCode =
    error && typeof error === 'object' && 'http_code' in error
      ? Number((error as { http_code: unknown }).http_code)
      : undefined;

  throw createHttpError(httpCode && httpCode >= 400 ? httpCode : 502, message);
}

export const uploadService = {
  async uploadProductImage(buffer: Buffer, mimetype: string): Promise<UploadedImage> {
    ensureCloudinaryConfig();

    const dataUri = `data:${mimetype};base64,${buffer.toString('base64')}`;
    let lastError: unknown;

    for (let attempt = 1; attempt <= MAX_UPLOAD_ATTEMPTS; attempt++) {
      try {
        const result = await cloudinary.uploader.upload(dataUri, {
          folder: PRODUCT_FOLDER,
          resource_type: 'image',
          timeout: 60000,
        });

        return {
          image_url: result.secure_url,
          image_public_id: result.public_id,
          width: result.width,
          height: result.height,
        };
      } catch (error) {
        lastError = error;
        console.error(`Cloudinary upload error (intento ${attempt}/${MAX_UPLOAD_ATTEMPTS}):`, error);

        if (!isNetworkError(error) || attempt === MAX_UPLOAD_ATTEMPTS) {
          mapCloudinaryError(error);
        }

        await wait(RETRY_DELAY_MS * attempt);
      }
    }

    mapCloudinaryError(lastError);
  },

  async deleteProductImage(publicId: string): Promise<void> {
    ensureCloudinaryConfig();
    await cloudinary.uploader.destroy(publicId);
  },

  isCloudinaryUrl(url: string): boolean {
    try {
      const cloudName = getCloudinaryCloudName();
      return url.includes(`res.cloudinary.com/${cloudName}/`);
    } catch {
      return false;
    }
  },
};
