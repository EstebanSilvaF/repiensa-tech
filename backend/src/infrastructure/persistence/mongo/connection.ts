import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { env } from '../../config/env';
import { UserModel } from './models/user.model';

const LIBRARY_EMAIL = 'biblioteca@uniempresarial.edu.co';
const LIBRARY_PASSWORD = 'biblioteca123';

export async function connectMongo(): Promise<void> {
  if (mongoose.connection.readyState === 1) return;
  await mongoose.connect(env.mongoUri);
  await UserModel.syncIndexes();

  const existing = await UserModel.findOne({ email: LIBRARY_EMAIL }).exec();
  if (!existing) {
    const password_hash = await bcrypt.hash(LIBRARY_PASSWORD, 10);
    await UserModel.create({
      university_id: 'cluniempresarial01',
      full_name: 'Biblioteca Universitaria',
      email: LIBRARY_EMAIL,
      password_hash,
      role: 'library',
    });
  }
}

export async function disconnectMongo(): Promise<void> {
  if (mongoose.connection.readyState === 0) return;
  await mongoose.disconnect();
}
