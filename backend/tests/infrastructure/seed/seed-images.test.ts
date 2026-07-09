import { describe, expect, it } from 'vitest';
import { SEED_IMAGE_ARDUINO, SEED_IMAGE_SENSOR } from '../../../src/infrastructure/seed/seed-images';

describe('seed-images', () => {
  it('usa imágenes de la carpeta repensa/products en Cloudinary', () => {
    expect(SEED_IMAGE_ARDUINO.imagePublicId).toBe('repensa/products/tarsamrlj3u8r6db8knk');
    expect(SEED_IMAGE_ARDUINO.imageUrl).toContain('repensa/products/tarsamrlj3u8r6db8knk');

    expect(SEED_IMAGE_SENSOR.imagePublicId).toBe('repensa/products/q729ruf8yahsnok5cbg2');
    expect(SEED_IMAGE_SENSOR.imageUrl).toContain('repensa/products/q729ruf8yahsnok5cbg2');
  });
});
