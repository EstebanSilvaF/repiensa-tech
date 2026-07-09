import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { env } from '../../config/env';
import { UserModel } from './models/user.model';
import { SEED_ENV_KEYS } from '../../seed/seed-credentials';

const LIBRARY_EMAIL = 'biblioteca@uniempresarial.edu.co';

async function ensureLibraryUser(): Promise<void> {
  const libraryPassword = process.env[SEED_ENV_KEYS.library]?.trim();
  if (!libraryPassword) return;

  const existing = await UserModel.findOne({ email: LIBRARY_EMAIL }).exec();
  if (existing) return;

  const password_hash = await bcrypt.hash(libraryPassword, 10);
  await UserModel.create({
    university_id: 'cluniempresarial01',
    full_name: 'Biblioteca Universitaria',
    email: LIBRARY_EMAIL,
    password_hash,
    role: 'library',
  });
}

export async function connectMongo(): Promise<void> {
  if (mongoose.connection.readyState === 1) return;
  await mongoose.connect(env.mongoUri);
  await UserModel.syncIndexes();
  await ensureLibraryUser();
}

export async function disconnectMongo(): Promise<void> {
  if (mongoose.connection.readyState === 0) return;
  await mongoose.disconnect();
}
