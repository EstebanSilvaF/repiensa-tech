import { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
  statusCode?: number;
  http_code?: number;
}

function getErrorMessage(err: unknown): string {
  if (err instanceof Error && err.message) {
    return err.message;
  }

  if (typeof err === 'string' && err.trim()) {
    return err;
  }

  if (err && typeof err === 'object' && 'message' in err) {
    const message = (err as { message: unknown }).message;
    if (typeof message === 'string' && message.trim()) {
      return message;
    }
  }

  return 'Error interno del servidor';
}

function resolveStatusCode(err: unknown): number {
  if (err && typeof err === 'object') {
    const appError = err as AppError;

    if (typeof appError.statusCode === 'number') {
      return appError.statusCode;
    }

    if (typeof appError.http_code === 'number' && appError.http_code >= 400) {
      return appError.http_code;
    }
  }

  const msg = getErrorMessage(err).toLowerCase();

  if (msg.includes('credenciales') || msg.includes('token')) return 401;
  if (msg.includes('no encontrado') || msg.includes('no encontrada')) return 404;
  if (msg.includes('no tienes acceso') || msg.includes('restringido')) return 403;

  return 500;
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  const statusCode = resolveStatusCode(err);
  const message = getErrorMessage(err);

  if (statusCode >= 500) {
    console.error(err);
  }

  res.status(statusCode).json({ message });
}

export function createHttpError(statusCode: number, message: string): AppError {
  const error = new Error(message) as AppError;
  error.statusCode = statusCode;
  return error;
}
