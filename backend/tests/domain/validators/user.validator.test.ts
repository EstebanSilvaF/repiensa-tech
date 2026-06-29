import { describe, expect, it } from 'vitest';
import {
  assertEmailAvailable,
  validateLogin,
  validateRegister,
} from '../../../src/domain/validators/user.validator';

describe('user.validator', () => {
  describe('validateRegister', () => {
    const valid = {
      university_id: 'uni-1',
      full_name: 'Ana Pérez',
      email: 'ana@uni.edu',
      password: 'password123',
    };

    it('acepta datos válidos', () => {
      expect(() => validateRegister(valid)).not.toThrow();
    });

    it('rechaza campos faltantes', () => {
      expect(() =>
        validateRegister({ ...valid, email: '' })
      ).toThrow('Todos los campos son requeridos');
    });

    it('rechaza contraseña corta', () => {
      expect(() =>
        validateRegister({ ...valid, password: 'corta' })
      ).toThrow('La contraseña debe tener mínimo 8 caracteres');
    });
  });

  describe('validateLogin', () => {
    it('acepta credenciales con formato válido', () => {
      expect(() =>
        validateLogin({ email: 'ana@uni.edu', password: 'secret' })
      ).not.toThrow();
    });

    it('rechaza email vacío', () => {
      expect(() =>
        validateLogin({ email: '  ', password: 'secret' })
      ).toThrow('Correo y contraseña son requeridos');
    });
  });

  describe('assertEmailAvailable', () => {
    it('lanza si el correo ya existe', () => {
      expect(() =>
        assertEmailAvailable({
          id: '1',
          university_id: 'u',
          full_name: 'X',
          email: 'a@b.c',
          password_hash: 'hash',
          role: 'student',
          created_at: new Date(),
          updated_at: new Date(),
        })
      ).toThrow('El correo ya está registrado');
    });
  });
});
