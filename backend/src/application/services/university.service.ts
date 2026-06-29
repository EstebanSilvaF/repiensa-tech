import { CreateUniversityDTO } from '../../domain/types/university.types';
import { universityRepository } from '../../infrastructure/persistence/repositories/university.repository';
import {
  assertDomainIsAvailable,
  assertUniversityExists,
  normalizeEmailDomain,
  validateCreateUniversity,
  validateUniversityStatus,
} from '../../domain/validators/university.validator';

export const universityService = {
  async getAll() {
    return universityRepository.findAll();
  },

  async create(data: CreateUniversityDTO) {
    validateCreateUniversity(data);

    const domain = normalizeEmailDomain(data.email_domain);
    const existing = await universityRepository.findByEmailDomain(domain);
    assertDomainIsAvailable(existing, domain);

    return universityRepository.create({ ...data, email_domain: domain });
  },

  async updateStatus(id: string, status: string) {
    validateUniversityStatus(status);

    const university = await universityRepository.updateStatus(id, status);
    assertUniversityExists(university);
    return university;
  },
};
