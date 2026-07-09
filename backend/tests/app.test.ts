import { describe, expect, it, vi } from 'vitest';
import http from 'node:http';

vi.mock('../src/infrastructure/config/swagger', () => ({
  isSwaggerEnabled: () => false,
  swaggerRouter: () => {
    const { Router } = require('express');
    return Router();
  },
}));

import app from '../src/app';

function request(path: string): Promise<{ status: number; body: unknown }> {
  return new Promise((resolve, reject) => {
    const server = app.listen(0, () => {
      const address = server.address();
      if (!address || typeof address === 'string') {
        server.close();
        reject(new Error('No se pudo obtener el puerto del servidor de prueba'));
        return;
      }

      http
        .get(`http://127.0.0.1:${address.port}${path}`, (res) => {
          let raw = '';
          res.on('data', (chunk) => {
            raw += chunk;
          });
          res.on('end', () => {
            server.close();
            resolve({
              status: res.statusCode ?? 0,
              body: JSON.parse(raw),
            });
          });
        })
        .on('error', (error) => {
          server.close();
          reject(error);
        });
    });
  });
}

describe('app', () => {
  it('responde en /health', async () => {
    const response = await request('/health');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'ok' });
  });
});
