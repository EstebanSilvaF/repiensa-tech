import { productRepository } from '../../infrastructure/persistence/repositories/product.repository';
import { expandSearchTerms } from '../../infrastructure/config/ai';
import { uploadService } from './upload.service';
import { CreateProductDTO, ProductFilters } from '../../domain/types/product.types';
import {
  assertProductExists,
  validateCreateProduct,
  validateProductDeletion,
} from '../../domain/validators/product.validator';
import { enrichProductsWithSeller } from '../helpers/user-profile.helper';

export const productService = {
  async getAll(universityId: string, filters: ProductFilters) {
    const searchTerms = filters.search?.trim()
      ? await expandSearchTerms(filters.search)
      : undefined;

    const products = await productRepository.findAll(universityId, {
      ...filters,
      searchTerms,
    });
    return enrichProductsWithSeller(products);
  },

  async getById(id: string) {
    const product = await productRepository.findById(id);
    assertProductExists(product);
    const [enriched] = await enrichProductsWithSeller([product], { includeEmail: true });
    return enriched;
  },

  async getMine(sellerId: string) {
    return productRepository.findBySeller(sellerId);
  },

  async create(sellerId: string, universityId: string, data: CreateProductDTO) {
    validateCreateProduct(data, uploadService.isCloudinaryUrl.bind(uploadService));

    return productRepository.create(sellerId, universityId, data);
  },

  async delete(id: string, sellerId: string) {
    const product = await productRepository.findById(id);
    validateProductDeletion(product, sellerId);

    const deleted = await productRepository.delete(id, sellerId);
    if (!deleted) throw new Error('No se pudo eliminar el producto');

    if (product.image_public_id) {
      try {
        await uploadService.deleteProductImage(product.image_public_id);
      } catch {
        // La imagen en Cloudinary se limpia en segundo plano; el producto ya se eliminó en BD
      }
    }
  },
};
