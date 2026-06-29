import { Response } from 'express';
import { reservationService } from '../../application/services/reservation.service';
import { AuthRequest } from '../middlewares/auth.middleware';
import { createHttpError } from '../middlewares/error.middleware';

export const reservationController = {
  async getMine(req: AuthRequest, res: Response): Promise<void> {
    const reservations = await reservationService.getMyReservations(req.user!.userId);
    res.json(reservations);
  },

  async reserve(req: AuthRequest, res: Response): Promise<void> {
    const { product_id } = req.body;
    if (!product_id) {
      throw createHttpError(400, 'product_id es requerido');
    }

    const reservation = await reservationService.reserve(product_id, req.user!.userId);
    res.status(201).json(reservation);
  },
};
