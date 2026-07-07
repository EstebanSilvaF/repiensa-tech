import http from 'k6/http';
import { check, fail } from 'k6';

export const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';
export const TEST_USER = __ENV.K6_TEST_USER || 'maria.rodriguez@uniempresarial.edu.co';
export const TEST_PASSWORD = __ENV.K6_TEST_PASSWORD || 'Estudiante1!';
export const PRODUCT_ID = __ENV.K6_PRODUCT_ID || 'clprodarduino001';

export const JSON_HEADERS = { 'Content-Type': 'application/json' };

export function authHeaders(token) {
  return {
    ...JSON_HEADERS,
    Authorization: `Bearer ${token}`,
  };
}

export function login() {
  const res = http.post(
    `${BASE_URL}/api/auth/login`,
    JSON.stringify({ email: TEST_USER, password: TEST_PASSWORD }),
    { headers: JSON_HEADERS, tags: { name: 'POST /api/auth/login' } },
  );

  const ok = check(res, {
    'login status 200': (r) => r.status === 200,
    'login devuelve token': (r) => !!r.json('token'),
  });

  if (!ok) {
    fail(`Login falló: ${res.status} ${res.body}`);
  }

  return res.json('token');
}
