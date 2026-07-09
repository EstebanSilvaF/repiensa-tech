import { describe, expect, it, vi } from 'vitest';

vi.mock('../src/infrastructure/config/swagger', () => ({
  isSwaggerEnabled: () => true,
  swaggerRouter: () => {
    const { Router } = require('express');
    return Router();
  },
}));

import app from '../src/app';

describe('app con swagger habilitado', () => {
  it('inicializa la aplicación con la ruta de documentación', () => {
    expect(app).toBeTruthy();
  });
});
