import { Product } from '../../types/product.types';
import { ValidationRule } from '../../../shared/validation/validator';

export function productExistsRule<T extends { product: Product | null }>(): ValidationRule<T> {
  return {
    test: ({ product }) => product !== null,
    message: 'Producto no encontrado',
  };
}

export function assertProductExists(
  product: Product | null
): asserts product is Product {
  if (!product) {
    throw new Error('Producto no encontrado');
  }
}

export function notOwnProductRule<T extends { product: Product | null; buyerId: string }>(
  message: string
): ValidationRule<T> {
  return {
    test: ({ product, buyerId }) => product!.seller_id !== buyerId,
    message,
  };
}
