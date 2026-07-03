import { describe, expect, it } from 'vitest';
import {
  validateCreateProduct,
  validateProductDeletion,
} from '../../../src/domain/validators/product.validator';
import { CreateProductDTO, Product } from '../../../src/domain/types/product.types';

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

describe('validateProductDeletion', () => {
  const now = new Date();
  const product: Product = {
    id: 'prod-1',
    seller_id: 'seller-1',
    university_id: 'uni-1',
    name: 'Laptop',
    description: null,
    price: 100,
    is_donation: false,
    category: 'microcontrollers',
    condition: 'good',
    status: 'available',
    image_url: 'https://res.cloudinary.com/demo/img.jpg',
    image_public_id: null,
    created_at: now,
    updated_at: now,
  };

  it('permite eliminar producto propio disponible', () => {
    expect(() => validateProductDeletion(product, 'seller-1')).not.toThrow();
  });

  it('rechaza eliminar producto de otro vendedor', () => {
    expect(() => validateProductDeletion(product, 'other-seller')).toThrow(
      'No tienes permiso para eliminar este producto'
    );
  });

  it('rechaza eliminar producto reservado', () => {
    expect(() =>
      validateProductDeletion({ ...product, status: 'reserved' }, 'seller-1')
    ).toThrow('No puedes eliminar un producto reservado o vendido');
  });
});
