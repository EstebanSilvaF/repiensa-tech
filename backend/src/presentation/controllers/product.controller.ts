import { Response } from 'express';
import { productService } from '../../application/services/product.service';
import { productDescriptionService } from '../../application/services/product-description.service';
import { AuthRequest } from '../middlewares/auth.middleware';
import { createHttpError } from '../middlewares/error.middleware';
import { ProductCategory, ProductCondition } from '../../domain/types/product.types';

export const productController = {
  async getAll(req: AuthRequest, res: Response): Promise<void> {
    const universityId = req.user!.universityId;
    const { category, condition, is_donation, search } = req.query;

    const products = await productService.getAll(universityId, {
      category:    category as ProductCategory,
      condition:   condition as ProductCondition,
      is_donation: is_donation !== undefined ? is_donation === 'true' : undefined,
      search:      search as string,
    });

    res.json(products);
  },

  async getMine(req: AuthRequest, res: Response): Promise<void> {
    const products = await productService.getMine(req.user!.userId);
    res.json(products);
  },

  async getById(req: AuthRequest, res: Response): Promise<void> {
    const product = await productService.getById(req.params.id as string);
    res.json(product);
  },

  async generateDescription(req: AuthRequest, res: Response): Promise<void> {
    if (!req.file) {
      throw createHttpError(400, 'El archivo "image" es requerido');
    }

    const suggestion = await productDescriptionService.generateFromImage(
      req.file.buffer,
      req.file.mimetype,
    );

    res.json(suggestion);
  },

  async create(req: AuthRequest, res: Response): Promise<void> {
    const {
      name, description, price, is_donation, category, condition,
      image_url, image_public_id,
    } = req.body;

    const product = await productService.create(
      req.user!.userId,
      req.user!.universityId,
      { name, description, price, is_donation, category, condition, image_url, image_public_id }
    );

    res.status(201).json(product);
  },

  async remove(req: AuthRequest, res: Response): Promise<void> {
    await productService.delete(req.params.id as string, req.user!.userId);
    res.json({ message: 'Producto eliminado' });
  },

  async acquire(req: AuthRequest, res: Response): Promise<void> {
    const result = await productService.markAsAcquired(req.params.id as string, req.user!.userId);
    res.json(result);
  },
};
