export type UserRole = 'student' | 'admin';

export interface User {
  id: string;
  university_id: string;
  full_name: string;
  email: string;
  password_hash: string;
  role: UserRole;
  created_at: Date;
  updated_at: Date;
}

export interface CreateUserDTO {
  university_id: string;
  full_name: string;
  email: string;
  password: string;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface ChangePasswordDTO {
  current_password: string;
  new_password: string;
}

export interface AuthPayload {
  userId: string;
  universityId: string;
  role: UserRole;
}
