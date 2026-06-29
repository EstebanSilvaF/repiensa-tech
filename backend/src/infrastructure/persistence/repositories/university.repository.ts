import { prisma } from '../prisma';
import {
  University,
  CreateUniversityDTO,
  SubscriptionStatus,
} from '../../../domain/types/university.types';

function mapUniversity(row: {
  id: string;
  name: string;
  emailDomain: string;
  subscriptionStatus: string;
  subscriptionStart: Date | null;
  subscriptionEnd: Date | null;
  createdAt: Date;
  updatedAt: Date;
}): University {
  return {
    id: row.id,
    name: row.name,
    email_domain: row.emailDomain,
    subscription_status: row.subscriptionStatus,
    subscription_start: row.subscriptionStart ?? (null as unknown as Date),
    subscription_end: row.subscriptionEnd ?? (null as unknown as Date),
    created_at: row.createdAt,
    updated_at: row.updatedAt,
  };
}

export const universityRepository = {
  async findAll(): Promise<University[]> {
    const rows = await prisma.university.findMany({ orderBy: { name: 'asc' } });
    return rows.map(mapUniversity);
  },

  async findById(id: string): Promise<University | null> {
    const row = await prisma.university.findUnique({ where: { id } });
    return row ? mapUniversity(row) : null;
  },

  async findByEmailDomain(emailDomain: string): Promise<University | null> {
    const row = await prisma.university.findUnique({ where: { emailDomain } });
    return row ? mapUniversity(row) : null;
  },

  async create(data: CreateUniversityDTO): Promise<University> {
    const row = await prisma.university.create({
      data: {
        name: data.name,
        emailDomain: data.email_domain,
        subscriptionStart: new Date(data.subscription_start),
        subscriptionEnd: new Date(data.subscription_end),
      },
    });
    return mapUniversity(row);
  },

  async updateStatus(id: string, status: string): Promise<University | null> {
    try {
      const row = await prisma.university.update({
        where: { id },
        data: { subscriptionStatus: status as SubscriptionStatus },
      });
      return mapUniversity(row);
    } catch {
      return null;
    }
  },
};
