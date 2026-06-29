import { Product } from '../types/product.types';
import { assertValid, ValidationRule } from '../../shared/validation/validator';
import { notOwnProductRule, productExistsRule } from './shared/product.rules';

interface ReserveProductContext {
  product: Product | null;
  buyerId: string;
  hasActiveReservation: boolean;
}

const reserveProductRules: ValidationRule<ReserveProductContext>[] = [
  productExistsRule(),
  {
    test: ({ product }) => product!.status === 'available',
    message: 'Este producto no está disponible para reservar',
  },
  notOwnProductRule('No puedes reservar tu propio producto'),
  {
    test: ({ hasActiveReservation }) => !hasActiveReservation,
    message: 'Este producto ya está reservado',
  },
];

export function validateProductReservation(
  product: Product | null,
  buyerId: string,
  hasActiveReservation: boolean
): asserts product is Product {
  assertValid({ product, buyerId, hasActiveReservation }, reserveProductRules);
}
