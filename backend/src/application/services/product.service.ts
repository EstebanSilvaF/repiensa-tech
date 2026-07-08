import { productRepository } from '../../infrastructure/persistence/repositories/product.repository';
import { transactionRepository } from '../../infrastructure/persistence/repositories/transaction.repository';
import { universityRepository } from '../../infrastructure/persistence/repositories/university.repository';
import { userRepository } from '../../infrastructure/persistence/repositories/user.repository';
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

    const university = await universityRepository.findById(universityId);
    if (!university) {
      throw new Error('La universidad no está registrada en el sistema');
    }

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

  async markAsAcquired(productId: string, buyerId: string) {
    const product = await productRepository.findById(productId);
    assertProductExists(product);

    const buyer = await userRepository.findById(buyerId);
    if (!buyer) {
      throw new Error('El adquiriente no existe');
    }

    if (buyer.university_id !== product.university_id) {
      throw new Error('El adquiriente debe pertenecer a la misma universidad');
    }

    await productRepository.updateStatus(productId, 'sold');
    await transactionRepository.createForProduct({
      productId,
      sellerId: product.seller_id,
      buyerId,
      finalPrice: product.price,
    });

    return { message: 'Producto marcado como adquirido' };
  },
};
