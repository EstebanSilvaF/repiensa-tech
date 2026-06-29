import { analyzeProductImage, ProductSuggestion } from '../../infrastructure/config/ai';
import { createHttpError } from '../../presentation/middlewares/error.middleware';

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
]);

function mapGroqError(error: unknown): never {
  const message = error instanceof Error ? error.message : String(error);
  const lower = message.toLowerCase();

  if (lower.includes('groq_api_key') || lower.includes('variable de entorno requerida')) {
    throw createHttpError(503, 'Falta GROQ_API_KEY en el .env del backend.');
  }
  if (lower.includes('api key') || lower.includes('invalid') && lower.includes('key') || lower.includes('401')) {
    throw createHttpError(503, 'GROQ_API_KEY inválida. Revisa la key en console.groq.com.');
  }
  if (lower.includes('model_not_found') || lower.includes('does not exist')) {
    throw createHttpError(503, 'Modelo Groq no disponible. Revisa GROQ_MODEL en .env.');
  }
  if (lower.includes('quota') || lower.includes('rate') || lower.includes('429')) {
    throw createHttpError(503, 'Cuota de Groq agotada. Revisa tu plan en console.groq.com o intenta más tarde.');
  }

  console.error('Error Groq:', message);
  throw createHttpError(502, 'No se pudo analizar la imagen. Intenta de nuevo.');
}

export const productDescriptionService = {
  async generateFromImage(buffer: Buffer, mimetype: string): Promise<ProductSuggestion> {
    if (!ALLOWED_MIME_TYPES.has(mimetype)) {
      throw createHttpError(400, 'Formato no permitido. Usa JPG, PNG, WEBP o GIF.');
    }

    try {
      return await analyzeProductImage(buffer.toString('base64'), mimetype);
    } catch (error) {
      if (error && typeof error === 'object' && 'statusCode' in error) {
        throw error;
      }
      mapGroqError(error);
    }
  },
};
