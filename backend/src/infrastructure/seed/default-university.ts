import { prisma } from '../persistence/prisma';

export const DEFAULT_UNIVERSITY_ID = 'cluniempresarial01';

const DEFAULT_UNIVERSITY = {
  id: DEFAULT_UNIVERSITY_ID,
  name: 'Fundación Universitaria Empresarial de la CCB',
  emailDomain: 'uniempresarial.edu.co',
  subscriptionStatus: 'active' as const,
  subscriptionStart: new Date('2026-01-01'),
  subscriptionEnd: new Date('2026-12-31'),
};

export async function ensureDefaultUniversity(): Promise<void> {
  await prisma.university.upsert({
    where: { id: DEFAULT_UNIVERSITY.id },
    update: {},
    create: DEFAULT_UNIVERSITY,
  });
}
