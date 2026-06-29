import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { uploadService } from '../../application/services/upload.service';
import { createHttpError } from '../middlewares/error.middleware';

export const uploadController = {
  async uploadProductImage(req: AuthRequest, res: Response): Promise<void> {
    if (!req.file) {
      throw createHttpError(400, 'El archivo "image" es requerido');
    }

    const result = await uploadService.uploadProductImage(
      req.file.buffer,
      req.file.mimetype
    );

    res.status(201).json(result);
  },
};
