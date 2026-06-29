import { describe, expect, it } from 'vitest';
import { validateCreateProduct } from '../../../src/domain/validators/product.validator';
import { CreateProductDTO } from '../../../src/domain/types/product.types';

const cloudinaryOk = (url: string) => url.startsWith('https://res.cloudinary.com/');

describe('product.validator', () => {
  const base: CreateProductDTO = {
    name: 'Laptop',
    category: 'microcontrollers',
    condition: 'good',
    price: 100,
    is_donation: false,
    image_url: 'https://res.cloudinary.com/demo/image/upload/v1/laptop.jpg',
    description: 'Usada un semestre',
  };

  it('acepta producto válido con imagen Cloudinary', () => {
    expect(() => validateCreateProduct(base, cloudinaryOk)).not.toThrow();
  });

  it('rechaza nombre vacío', () => {
    expect(() =>
      validateCreateProduct({ ...base, name: '   ' }, cloudinaryOk)
    ).toThrow('El nombre es requerido');
  });

  it('rechaza precio negativo si no es donación', () => {
    expect(() =>
      validateCreateProduct({ ...base, price: -1 }, cloudinaryOk)
    ).toThrow('El precio debe ser mayor o igual a 0');
  });

  it('rechaza URL que no es de Cloudinary', () => {
    expect(() =>
      validateCreateProduct(
        { ...base, image_url: 'https://example.com/img.jpg' },
        cloudinaryOk
      )
    ).toThrow('La imagen debe subirse mediante POST /api/upload/product-image');
  });
});
