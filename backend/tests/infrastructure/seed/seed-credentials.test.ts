import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { hashSeedPassword, requireSeedPassword, SEED_ENV_KEYS } from '../../../src/infrastructure/seed/seed-credentials';

describe('seed-credentials', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('expone las claves de entorno del seed', () => {
    expect(SEED_ENV_KEYS.admin).toBe('SEED_ADMIN_PASSWORD');
  });

  it('requireSeedPassword devuelve el valor configurado', () => {
    process.env.SEED_ADMIN_PASSWORD = '  secreto-seed  ';

    expect(requireSeedPassword('SEED_ADMIN_PASSWORD')).toBe('secreto-seed');
  });

  it('requireSeedPassword falla si falta la variable', () => {
    delete process.env.SEED_ADMIN_PASSWORD;

    expect(() => requireSeedPassword('SEED_ADMIN_PASSWORD')).toThrow(
      'Variable de entorno requerida para seed: SEED_ADMIN_PASSWORD',
    );
  });

  it('hashSeedPassword genera un hash bcrypt', async () => {
    process.env.SEED_STUDENT_PASSWORD = 'password123';

    const hash = await hashSeedPassword('SEED_STUDENT_PASSWORD');

    expect(hash).toMatch(/^\$2[aby]\$/);
  });
});
