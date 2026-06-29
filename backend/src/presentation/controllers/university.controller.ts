import { Request, Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { universityService } from '../../application/services/university.service';
import { getRouteParam } from '../../shared/utils/params';
import { createHttpError } from '../middlewares/error.middleware';

export const universityController = {
  async getAll(_req: Request, res: Response): Promise<void> {
    const universities = await universityService.getAll();
    res.json(universities);
  },

  async create(req: AuthRequest, res: Response): Promise<void> {
    const { name, email_domain, subscription_start, subscription_end } = req.body;
    const university = await universityService.create({
      name, email_domain, subscription_start, subscription_end,
    });
    res.status(201).json(university);
  },

  async updateStatus(req: AuthRequest, res: Response): Promise<void> {
    const { status } = req.body;
    if (!status) {
      throw createHttpError(400, 'status es requerido');
    }

    const id = getRouteParam(req.params.id);
    if (!id) {
      throw createHttpError(400, 'id inválido');
    }

    const university = await universityService.updateStatus(id, status);
    res.json(university);
  },
};
