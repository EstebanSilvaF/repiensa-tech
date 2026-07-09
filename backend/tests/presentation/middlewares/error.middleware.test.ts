import { describe, expect, it, vi } from 'vitest';
import type { NextFunction, Request, Response } from 'express';
import {
  createHttpError,
  errorHandler,
  type AppError,
} from '../../../src/presentation/middlewares/error.middleware';

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

describe('error.middleware', () => {
  const req = {} as Request;
  const next = vi.fn() as NextFunction;

  it('createHttpError adjunta el código HTTP', () => {
    const error = createHttpError(404, 'Recurso no encontrado');

    expect(error.message).toBe('Recurso no encontrado');
    expect(error.statusCode).toBe(404);
  });

  it('errorHandler responde con statusCode explícito', () => {
    const res = createResponse();
    const error = createHttpError(409, 'Conflicto');

    errorHandler(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({ message: 'Conflicto' });
  });

  it.each([
    ['Credenciales inválidas', 401],
    ['Producto no encontrado', 404],
    ['No tienes acceso a este recurso', 403],
    ['El campo es requerido', 400],
  ])('errorHandler infiere %i para "%s"', (message, statusCode) => {
    const res = createResponse();

    errorHandler(new Error(message), req, res, next);

    expect(res.status).toHaveBeenCalledWith(statusCode);
  });

  it('errorHandler usa mensaje genérico para errores desconocidos', () => {
    const res = createResponse();
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    errorHandler({ foo: 'bar' }, req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'Error interno del servidor' });
    consoleError.mockRestore();
  });

  it('errorHandler acepta http_code de servicios externos', () => {
    const res = createResponse();
    const error = new Error('Fallo remoto') as AppError;
    error.http_code = 502;

    errorHandler(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(502);
  });
});
