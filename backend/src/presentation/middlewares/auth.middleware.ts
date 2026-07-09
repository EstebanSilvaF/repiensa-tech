import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../../infrastructure/config/env';
import { AuthPayload } from '../../domain/types/user.types';

export interface AuthRequest extends Request {
  user?: AuthPayload;
}

export function authMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Token no proporcionado' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = jwt.verify(token, env.jwtSecret) as AuthPayload;

    req.user = payload;
    next();
  } catch {
    res.status(401).json({ message: 'Token inválido o expirado' });
  }
}

// Middleware para rutas solo de admin
export function adminMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void {
  if (req.user?.role !== 'admin') {
    res.status(403).json({ message: 'Acceso restringido a administradores' });
    return;
  }
  next();
}
