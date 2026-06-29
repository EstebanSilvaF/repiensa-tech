import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { notificationService } from '../../application/services/notification.service';
import { getRouteParam } from '../../shared/utils/params';
import { createHttpError } from '../middlewares/error.middleware';

export const notificationController = {
  async getAll(req: AuthRequest, res: Response): Promise<void> {
    const data = await notificationService.getAll(req.user!.userId);
    res.json(data);
  },

  async markAllRead(req: AuthRequest, res: Response): Promise<void> {
    await notificationService.markAllRead(req.user!.userId);
    res.json({ message: 'Notificaciones marcadas como leídas' });
  },

  async markOneRead(req: AuthRequest, res: Response): Promise<void> {
    const id = getRouteParam(req.params.id);
    if (!id) {
      throw createHttpError(400, 'id inválido');
    }

    await notificationService.markOneRead(id, req.user!.userId);
    res.json({ message: 'Notificación marcada como leída' });
  },
};
