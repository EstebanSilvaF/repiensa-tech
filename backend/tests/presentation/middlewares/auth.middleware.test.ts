import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { NextFunction, Response } from 'express';

const { verify } = vi.hoisted(() => ({
  verify: vi.fn(),
}));

vi.mock('jsonwebtoken', () => ({
  default: { verify },
}));

vi.mock('../../../src/infrastructure/config/env', () => ({
  env: { jwtSecret: 'test-secret' },
}));

import {
  adminMiddleware,
  authMiddleware,
  type AuthRequest,
} from '../../../src/presentation/middlewares/auth.middleware';

function createResponse() {
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  };
  return res as unknown as Response & {
    status: ReturnType<typeof vi.fn>;
    json: ReturnType<typeof vi.fn>;
  };
}

describe('auth.middleware', () => {
  const next = vi.fn() as NextFunction;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('authMiddleware', () => {
    it('rechaza peticiones sin Bearer token', () => {
      const req = { headers: {} } as AuthRequest;
      const res = createResponse();

      authMiddleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Token no proporcionado' });
      expect(next).not.toHaveBeenCalled();
    });

    it('rechaza token inválido', () => {
      verify.mockImplementation(() => {
        throw new Error('invalid');
      });

      const req = {
        headers: { authorization: 'Bearer bad-token' },
      } as AuthRequest;
      const res = createResponse();

      authMiddleware(req, res, next);

      expect(verify).toHaveBeenCalledWith('bad-token', 'test-secret');
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Token inválido o expirado' });
      expect(next).not.toHaveBeenCalled();
    });

    it('adjunta el usuario y continúa con token válido', () => {
      const payload = { id: 'user-1', role: 'student' as const };
      verify.mockReturnValue(payload);

      const req = {
        headers: { authorization: 'Bearer valid-token' },
      } as AuthRequest;
      const res = createResponse();

      authMiddleware(req, res, next);

      expect(req.user).toEqual(payload);
      expect(next).toHaveBeenCalledOnce();
      expect(res.status).not.toHaveBeenCalled();
    });
  });

  describe('adminMiddleware', () => {
    it('rechaza usuarios que no son admin', () => {
      const req = { user: { id: 'user-1', role: 'student' as const } } as AuthRequest;
      const res = createResponse();

      adminMiddleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Acceso restringido a administradores',
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('permite acceso a administradores', () => {
      const req = { user: { id: 'admin-1', role: 'admin' as const } } as AuthRequest;
      const res = createResponse();

      adminMiddleware(req, res, next);

      expect(next).toHaveBeenCalledOnce();
      expect(res.status).not.toHaveBeenCalled();
    });
  });
});
