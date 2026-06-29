import { Response } from 'express';
import { transactionService } from '../../application/services/transaction.service';
import { AuthRequest } from '../middlewares/auth.middleware';

export const transactionController = {
  async getHistory(req: AuthRequest, res: Response): Promise<void> {
    const history = await transactionService.getHistory(req.user!.userId);
    res.json(history);
  },
};
