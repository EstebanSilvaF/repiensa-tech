import http from 'k6/http';
import { check, sleep } from 'k6';
import {
  BASE_URL,
  PRODUCT_ID,
  authHeaders,
  login,
} from './lib/config.js';

export const options = {
  vus: 5,
  duration: '30s',
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<800'],
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
  check(health, { 'health 200': (r) => r.status === 200 });

  const universities = http.get(`${BASE_URL}/api/universities`, {
    tags: { name: 'GET /api/universities' },
  });
  check(universities, {
    'universities 200': (r) => r.status === 200,
    'universities es array': (r) => Array.isArray(r.json()),
  });

  const products = http.get(`${BASE_URL}/api/products`, {
    headers,
    tags: { name: 'GET /api/products' },
  });
  check(products, {
    'products 200': (r) => r.status === 200,
    'products es array': (r) => Array.isArray(r.json()),
  });

  const product = http.get(`${BASE_URL}/api/products/${PRODUCT_ID}`, {
    headers,
    tags: { name: 'GET /api/products/:id' },
  });
  check(product, {
    'product detail 200': (r) => r.status === 200,
    'product tiene nombre': (r) => !!r.json('name'),
  });

  sleep(1);
}
