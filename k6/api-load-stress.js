import http from 'k6/http';
import { check, sleep } from 'k6';
import {
  BASE_URL,
  PRODUCT_ID,
  authHeaders,
  login,
} from './lib/config.js';

/**
 * Prueba de carga intensa (stress):
 * - Sube hasta 80 usuarios virtuales simultáneos
 * - Mantiene presión ~5 minutos
 * - Golpea los endpoints más usados de la API
 */
export const options = {
  stages: [
    { duration: '1m', target: 20 },
    { duration: '2m', target: 50 },
    { duration: '2m', target: 80 },
    { duration: '1m', target: 80 },
    { duration: '30s', target: 0 },
  ],
  thresholds: {
    http_req_failed: ['rate<0.05'],
    http_req_duration: ['p(95)<1500', 'p(99)<3000'],
    checks: ['rate>0.95'],
  },
};

export function setup() {
  return { token: login() };
}

export default function ({ token }) {
  const headers = authHeaders(token);

  const health = http.get(`${BASE_URL}/health`, {
    tags: { name: 'GET /health' },
  });
  check(health, { 'health ok': (r) => r.status === 200 });

  const universities = http.get(`${BASE_URL}/api/universities`, {
    tags: { name: 'GET /api/universities' },
  });
  check(universities, { 'universities ok': (r) => r.status === 200 });

  const products = http.get(`${BASE_URL}/api/products`, {
    headers,
    tags: { name: 'GET /api/products' },
  });
  check(products, { 'productos ok': (r) => r.status === 200 });

  const product = http.get(`${BASE_URL}/api/products/${PRODUCT_ID}`, {
    headers,
    tags: { name: 'GET /api/products/:id' },
  });
  check(product, { 'detalle ok': (r) => r.status === 200 });

  const mine = http.get(`${BASE_URL}/api/products/mine`, {
    headers,
    tags: { name: 'GET /api/products/mine' },
  });
  check(mine, { 'mis productos ok': (r) => r.status === 200 });

  const history = http.get(`${BASE_URL}/api/transactions`, {
    headers,
    tags: { name: 'GET /api/transactions' },
  });
  check(history, { 'historial ok': (r) => r.status === 200 });

  const notifications = http.get(`${BASE_URL}/api/notifications`, {
    headers,
    tags: { name: 'GET /api/notifications' },
  });
  check(notifications, { 'notificaciones ok': (r) => r.status === 200 });

  const reservations = http.get(`${BASE_URL}/api/reservations`, {
    headers,
    tags: { name: 'GET /api/reservations' },
  });
  check(reservations, { 'reservas ok': (r) => r.status === 200 });

  const chats = http.get(`${BASE_URL}/api/chats`, {
    headers,
    tags: { name: 'GET /api/chats' },
  });
  check(chats, { 'chats ok': (r) => r.status === 200 });

  sleep(0.3);
}
