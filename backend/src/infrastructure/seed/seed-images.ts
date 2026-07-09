/**
 * Imágenes de productos demo para el seed.
 * Carpeta en Cloudinary: repensa/products (misma que upload.service.ts).
 *
 * Para ver imágenes disponibles: npm run cloudinary:list
 * Sube nuevas en la app (Publicar producto) o en console.cloudinary.com.
 */
const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME?.trim() || 'dqlvczepf';

export type SeedProductImage = {
  imageUrl: string;
  imagePublicId: string;
};

function buildSeedImage(publicId: string): SeedProductImage {
  return {
    imagePublicId: publicId,
    imageUrl: `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${publicId}`,
  };
}

/** Arduino Uno R3 — foto subida a repensa/products */
export const SEED_IMAGE_ARDUINO = buildSeedImage('repensa/products/tarsamrlj3u8r6db8knk');

/** Sensor HC-SR04 — foto subida a repensa/products */
export const SEED_IMAGE_SENSOR = buildSeedImage('repensa/products/q729ruf8yahsnok5cbg2');
