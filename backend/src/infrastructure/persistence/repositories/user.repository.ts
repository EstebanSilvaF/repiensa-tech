import { prisma } from '../prisma';
import { User, CreateUserDTO } from '../../../domain/types/user.types';

function mapUser(row: {
  id: string;
  universityId: string;
  fullName: string;
  email: string;
  passwordHash: string;
  role: User['role'];
  createdAt: Date;
  updatedAt: Date;
}): User {
  return {
    id: row.id,
    university_id: row.universityId,
    full_name: row.fullName,
    email: row.email,
    password_hash: row.passwordHash,
    role: row.role,
    created_at: row.createdAt,
    updated_at: row.updatedAt,
  };
}

export const userRepository = {
  async findByEmail(email: string): Promise<User | null> {
    const user = await prisma.user.findUnique({ where: { email } });
    return user ? mapUser(user) : null;
  },

  async findById(id: string): Promise<User | null> {
    const user = await prisma.user.findUnique({ where: { id } });
    return user ? mapUser(user) : null;
  },

  async create(data: CreateUserDTO & { password_hash: string }): Promise<User> {
    const user = await prisma.user.create({
      data: {
        universityId: data.university_id,
        fullName: data.full_name,
        email: data.email,
        passwordHash: data.password_hash,
      },
    });
    return mapUser(user);
  },

  async updatePassword(id: string, password_hash: string): Promise<void> {
    await prisma.user.update({
      where: { id },
      data: { passwordHash: password_hash },
    });
  },
};
