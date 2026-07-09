import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

export const SEED_ENV_KEYS = {
  admin: 'SEED_ADMIN_PASSWORD',
  student: 'SEED_STUDENT_PASSWORD',
  library: 'SEED_LIBRARY_PASSWORD',
} as const;

export function requireSeedPassword(envKey: string): string {
  const value = process.env[envKey]?.trim();
  if (!value) {
    throw new Error(`Variable de entorno requerida para seed: ${envKey}`);
  }
  return value;
}

export async function hashSeedPassword(envKey: string): Promise<string> {
  return bcrypt.hash(requireSeedPassword(envKey), SALT_ROUNDS);
}
