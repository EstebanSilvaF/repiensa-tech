import { Request, Response } from 'express';
import { userService } from '../../application/services/user.service';
import { AuthRequest } from '../middlewares/auth.middleware';

export const authController = {
  async register(req: Request, res: Response): Promise<void> {
    const { university_id, full_name, email, password } = req.body;
    const user = await userService.register({ university_id, full_name, email, password });
    res.status(201).json({ message: 'Cuenta creada exitosamente', user });
  },

  async login(req: Request, res: Response): Promise<void> {
    const { email, password } = req.body;
    const result = await userService.login({ email, password });
    res.status(200).json(result);
  },

  async changePassword(req: AuthRequest, res: Response): Promise<void> {
    const { current_password, new_password } = req.body;
    if (!req.user) {
      res.status(401).json({ message: 'Usuario no autenticado' });
      return;
    }

    const result = await userService.changePassword(req.user.userId, {
      current_password,
      new_password,
    });

    res.status(200).json(result);
  },
};
