import { beforeEach, describe, expect, it, vi } from 'vitest';

const { findByEmail, create, findUniversityById } = vi.hoisted(() => ({
  findByEmail: vi.fn(),
  create: vi.fn(),
  findUniversityById: vi.fn(),
}));

vi.mock('../../../src/infrastructure/persistence/repositories/user.repository', () => ({
  userRepository: { findByEmail, create },
}));

vi.mock('../../../src/infrastructure/persistence/repositories/university.repository', () => ({
  universityRepository: { findById: findUniversityById },
}));

vi.mock('bcrypt', () => ({
  default: {
    hash: vi.fn().mockResolvedValue('hashed'),
    compare: vi.fn(),
  },
}));

vi.mock('jsonwebtoken', () => ({
  default: { sign: vi.fn().mockReturnValue('jwt-token') },
}));

import bcrypt from 'bcrypt';
import { userService } from '../../../src/application/services/user.service';

describe('user.service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('register', () => {
    const dto = {
      university_id: 'uni-1',
      full_name: 'Ana Pérez',
      email: 'ana@uni.edu',
      password: 'password123',
    };

    it('crea usuario cuando la universidad es válida', async () => {
      findByEmail.mockResolvedValue(null);
      findUniversityById.mockResolvedValue({
        id: 'uni-1',
        subscription_status: 'active',
        email_domain: 'uni.edu',
      });
      create.mockResolvedValue({
        id: 'user-1',
        ...dto,
        password_hash: 'hashed',
        role: 'student',
        created_at: new Date(),
        updated_at: new Date(),
      });

      const user = await userService.register(dto);

      expect(findByEmail).toHaveBeenCalledWith('ana@uni.edu');
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
      expect(create).toHaveBeenCalled();
      expect(user).not.toHaveProperty('password_hash');
      expect(user.email).toBe('ana@uni.edu');
    });

    it('rechaza registro con contraseña corta', async () => {
      await expect(
        userService.register({ ...dto, password: 'corta' })
      ).rejects.toThrow('La contraseña debe tener mínimo 8 caracteres');
      expect(findByEmail).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('devuelve token y usuario sin password_hash', async () => {
      const dbUser = {
        id: 'user-1',
        university_id: 'uni-1',
        full_name: 'Ana',
        email: 'ana@uni.edu',
        password_hash: 'hashed',
        role: 'student' as const,
        created_at: new Date(),
        updated_at: new Date(),
      };
      findByEmail.mockResolvedValue(dbUser);
      vi.mocked(bcrypt.compare).mockResolvedValue(true as never);

      const result = await userService.login({
        email: 'ana@uni.edu',
        password: 'password123',
      });

      expect(result.token).toBe('jwt-token');
      expect(result.user).not.toHaveProperty('password_hash');
    });
  });
});
