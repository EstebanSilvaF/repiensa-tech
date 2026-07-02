import { Types } from 'mongoose';
import { User, CreateUserDTO } from '../../../domain/types/user.types';
import { UserModel, UserDocument } from '../mongo/models/user.model';

function mapUser(doc: UserDocument): User {
  return {
    id: doc._id.toString(),
    university_id: doc.university_id,
    full_name: doc.full_name,
    email: doc.email,
    password_hash: doc.password_hash,
    role: doc.role,
    created_at: doc.created_at,
    updated_at: doc.updated_at,
  };
}

export const userRepository = {
  async findByEmail(email: string): Promise<User | null> {
    const user = await UserModel.findOne({ email }).exec();
    return user ? mapUser(user) : null;
  },

  async findById(id: string): Promise<User | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    const user = await UserModel.findById(id).exec();
    return user ? mapUser(user) : null;
  },

  async findByIds(ids: string[]): Promise<User[]> {
    const validIds = ids.filter((id) => Types.ObjectId.isValid(id));
    if (validIds.length === 0) return [];

    const users = await UserModel.find({
      _id: { $in: validIds.map((id) => new Types.ObjectId(id)) },
    }).exec();

    return users.map(mapUser);
  },

  async create(data: CreateUserDTO & { password_hash: string }): Promise<User> {
    try {
      const user = await UserModel.create({
        university_id: data.university_id,
        full_name: data.full_name,
        email: data.email,
        password_hash: data.password_hash,
      });
      return mapUser(user);
    } catch (error) {
      if (
        error &&
        typeof error === 'object' &&
        'code' in error &&
        (error as { code: number }).code === 11000
      ) {
        throw new Error('El email ya está registrado');
      }
      throw error;
    }
  },

  async updatePassword(id: string, password_hash: string): Promise<void> {
    if (!Types.ObjectId.isValid(id)) {
      throw new Error('Usuario no encontrado');
    }
    const result = await UserModel.updateOne(
      { _id: new Types.ObjectId(id) },
      { $set: { password_hash } },
    ).exec();
    if (result.matchedCount === 0) {
      throw new Error('Usuario no encontrado');
    }
  },
};
