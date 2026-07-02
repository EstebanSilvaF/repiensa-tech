import mongoose from 'mongoose';
import { env } from '../../config/env';
import { UserModel } from './models/user.model';

export async function connectMongo(): Promise<void> {
  if (mongoose.connection.readyState === 1) return;
  await mongoose.connect(env.mongoUri);
  await UserModel.syncIndexes();
}

export async function disconnectMongo(): Promise<void> {
  if (mongoose.connection.readyState === 0) return;
  await mongoose.disconnect();
}
