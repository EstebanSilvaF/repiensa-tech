import { describe, expect, it } from 'vitest';
import {
  assertDomainIsAvailable,
  assertUniversityExists,
  normalizeEmailDomain,
  validateCreateUniversity,
  validateUniversityStatus,
} from '../../../src/domain/validators/university.validator';

describe('university.validator', () => {
  describe('validateCreateUniversity', () => {
    const valid = {
      name: 'Universidad Empresarial',
      email_domain: 'uni.edu',
      subscription_start: '2025-01-01',
      subscription_end: '2026-01-01',
    };

    it('acepta datos válidos', () => {
      expect(() => validateCreateUniversity(valid)).not.toThrow();
    });

    it('rechaza nombre vacío', () => {
      expect(() =>
        validateCreateUniversity({ ...valid, name: '   ' })
      ).toThrow('El nombre es requerido');
    });

    it('rechaza dominio vacío', () => {
      expect(() =>
        validateCreateUniversity({ ...valid, email_domain: '' })
      ).toThrow('El dominio es requerido');
    });

    it('rechaza fecha de inicio faltante', () => {
      expect(() =>
        validateCreateUniversity({ ...valid, subscription_start: '' })
      ).toThrow('La fecha de inicio es requerida');
    });
  });

  describe('normalizeEmailDomain', () => {
    it('quita @ y normaliza a minúsculas', () => {
      expect(normalizeEmailDomain('  @UNI.EDU  ')).toBe('uni.edu');
    });
  });

  describe('validateUniversityStatus', () => {
    it('acepta estados válidos', () => {
      expect(() => validateUniversityStatus('active')).not.toThrow();
      expect(() => validateUniversityStatus('inactive')).not.toThrow();
      expect(() => validateUniversityStatus('expired')).not.toThrow();
    });

    it('rechaza estado inválido', () => {
      expect(() => validateUniversityStatus('cancelled')).toThrow('Estado inválido');
    });
  });

  describe('assertUniversityExists', () => {
    it('no lanza si la universidad existe', () => {
      expect(() => assertUniversityExists({ id: 'uni-1' })).not.toThrow();
    });

    it('lanza si la universidad no existe', () => {
      expect(() => assertUniversityExists(null)).toThrow('Universidad no encontrada');
    });
  });

  describe('assertDomainIsAvailable', () => {
    it('no lanza si el dominio está libre', () => {
      expect(() => assertDomainIsAvailable(null, 'uni.edu')).not.toThrow();
    });

    it('lanza si el dominio ya está registrado', () => {
      expect(() =>
        assertDomainIsAvailable({ id: 'existing' }, 'uni.edu')
      ).toThrow('Ya existe una universidad con el dominio uni.edu');
    });
  });
});
