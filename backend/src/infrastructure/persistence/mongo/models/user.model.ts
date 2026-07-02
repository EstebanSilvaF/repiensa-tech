import mongoose, { Schema, Document } from 'mongoose';
import { UserRole } from '../../../../domain/types/user.types';

export interface UserDocument extends Document {
  university_id: string;
  full_name: string;
  email: string;
  password_hash: string;
  role: UserRole;
  created_at: Date;
  updated_at: Date;
}

const userSchema = new Schema<UserDocument>(
  {
    university_id: { type: String, required: true, index: true },
    full_name: { type: String, required: true, maxlength: 150 },
    email: { type: String, required: true, unique: true, maxlength: 254 },
    password_hash: { type: String, required: true },
    role: { type: String, enum: ['student', 'admin'], default: 'student' },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    collection: 'users',
  },
);

export const UserModel =
  mongoose.models.User ?? mongoose.model<UserDocument>('User', userSchema);
