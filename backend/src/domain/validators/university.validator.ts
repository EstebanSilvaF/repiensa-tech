import { CreateUniversityDTO } from '../types/university.types';
import { assertValid } from '../../shared/validation/validator';
import { required, requiredTrimmed } from './shared/field.rules';

const createUniversityRules = [
  requiredTrimmed('El nombre es requerido', (data: CreateUniversityDTO) => data.name),
  requiredTrimmed('El dominio es requerido', (data: CreateUniversityDTO) => data.email_domain),
  required('La fecha de inicio es requerida', (data: CreateUniversityDTO) => data.subscription_start),
  required('La fecha de fin es requerida', (data: CreateUniversityDTO) => data.subscription_end),
];

export function validateCreateUniversity(data: CreateUniversityDTO): void {
  assertValid(data, createUniversityRules);
}

export function normalizeEmailDomain(emailDomain: string): string {
  return emailDomain.replace('@', '').toLowerCase().trim();
}

const VALID_STATUSES = ['active', 'inactive', 'expired'] as const;

export function validateUniversityStatus(status: string): void {
  if (!VALID_STATUSES.includes(status as (typeof VALID_STATUSES)[number])) {
    throw new Error('Estado inválido');
  }
}

export function assertUniversityExists<T>(university: T | null): asserts university is T {
  if (!university) {
    throw new Error('Universidad no encontrada');
  }
}

export function assertDomainIsAvailable(existing: unknown, domain: string): void {
  if (existing) {
    throw new Error(`Ya existe una universidad con el dominio ${domain}`);
  }
}
