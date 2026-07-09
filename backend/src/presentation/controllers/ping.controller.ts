import { Request, Response } from 'express';

export const pingController = {
  async ping(_req: Request, res: Response): Promise<void> {
    res.json({ message: 'pong' });
  },
};
