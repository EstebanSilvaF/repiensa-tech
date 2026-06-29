import { CreateProductDTO, Product } from '../types/product.types';
import { assertValid, ValidationRule } from '../../shared/validation/validator';
import { requiredTrimmed } from './shared/field.rules';
import { productExistsRule } from './shared/product.rules';

export { assertProductExists } from './shared/product.rules';

const createProductRules: ValidationRule<CreateProductDTO>[] = [
  requiredTrimmed('El nombre es requerido', (data) => data.name),
  {
    test: (data) => !!data.category,
    message: 'La categoría es requerida',
  },
  {
    test: (data) => !!data.condition,
    message: 'El estado es requerido',
  },
  {
    test: (data) => data.is_donation || (data.price != null && data.price >= 0),
    message: 'El precio debe ser mayor o igual a 0',
  },
  requiredTrimmed('La imagen del producto es requerida', (data) => data.image_url),
];

interface DeleteProductContext {
  product: Product | null;
  sellerId: string;
}

const deleteProductRules: ValidationRule<DeleteProductContext>[] = [
  productExistsRule(),
  {
    test: ({ product, sellerId }) => product!.seller_id === sellerId,
    message: 'No tienes permiso para eliminar este producto',
  },
  {
    test: ({ product }) => product!.status === 'available',
    message: 'No puedes eliminar un producto reservado o vendido',
  },
];

export function validateCreateProduct(
  data: CreateProductDTO,
  isCloudinaryUrl: (url: string) => boolean
): void {
  assertValid(data, createProductRules);

  if (!isCloudinaryUrl(data.image_url)) {
    throw new Error('La imagen debe subirse mediante POST /api/upload/product-image');
  }
}

export function validateProductDeletion(
  product: Product | null,
  sellerId: string
): asserts product is Product {
  assertValid({ product, sellerId }, deleteProductRules);
}
