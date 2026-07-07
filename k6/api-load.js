import http from 'k6/http';
import { check, sleep } from 'k6';
import {
  BASE_URL,
  PRODUCT_ID,
  authHeaders,
  login,
} from './lib/config.js';

export const options = {
  stages: [
    { duration: '30s', target: 5 },
    { duration: '1m', target: 15 },
    { duration: '30s', target: 0 },
  ],
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<500', 'p(99)<1000'],
    'http_req_duration{name:GET /api/products}': ['p(95)<600'],
    'http_req_duration{name:POST /api/auth/login}': ['p(95)<800'],
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

  const products = http.get(`${BASE_URL}/api/products`, {
    headers,
    tags: { name: 'GET /api/products' },
  });
  check(products, {
    'listado productos ok': (r) => r.status === 200,
  });

  const product = http.get(`${BASE_URL}/api/products/${PRODUCT_ID}`, {
    headers,
    tags: { name: 'GET /api/products/:id' },
  });
  check(product, {
    'detalle producto ok': (r) => r.status === 200,
  });

  const history = http.get(`${BASE_URL}/api/transactions`, {
    headers,
    tags: { name: 'GET /api/transactions' },
  });
  check(history, {
    'historial ok': (r) => r.status === 200,
  });

  sleep(1);
}
