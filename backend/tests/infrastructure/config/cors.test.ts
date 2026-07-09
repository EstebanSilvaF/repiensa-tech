import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import type { CorsOptions } from 'cors';

vi.mock('cors', () => ({
  default: vi.fn(() => (_req: unknown, _res: unknown, next: () => void) => next()),
}));

import cors from 'cors';
import { corsMiddleware } from '../../../src/infrastructure/config/cors';

describe('cors config', () => {
  const originalCorsOrigin = process.env.CORS_ORIGIN;

  beforeEach(() => {
    vi.clearAllMocks();
    delete process.env.CORS_ORIGIN;
  });

  afterEach(() => {
    process.env.CORS_ORIGIN = originalCorsOrigin;
  });

  it('permite orígenes locales por defecto', () => {
    corsMiddleware();

    const options = vi.mocked(cors).mock.calls.at(-1)?.[0] as CorsOptions;
    const callback = vi.fn();

    options.origin?.('http://localhost:5173', callback);

    expect(callback).toHaveBeenCalledWith(null, true);
  });

  it('rechaza orígenes no permitidos', () => {
    process.env.CORS_ORIGIN = 'http://localhost:5173';
    corsMiddleware();

    const options = vi.mocked(cors).mock.calls.at(-1)?.[0] as CorsOptions;
    const callback = vi.fn();

    options.origin?.('http://malicioso.test', callback);

    expect(callback).toHaveBeenCalledWith(null, false);
  });

  it('permite peticiones sin header Origin', () => {
    corsMiddleware();

    const options = vi.mocked(cors).mock.calls.at(-1)?.[0] as CorsOptions;
    const callback = vi.fn();

    options.origin?.(undefined, callback);

    expect(callback).toHaveBeenCalledWith(null, true);
  });
});
