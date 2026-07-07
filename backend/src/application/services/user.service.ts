import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { env } from '../../infrastructure/config/env';
import { userRepository } from '../../infrastructure/persistence/repositories/user.repository';
import { universityRepository } from '../../infrastructure/persistence/repositories/university.repository';
import {
  ChangePasswordDTO,
  CreateUserDTO,
  LoginDTO,
  AuthPayload,
  User,
} from '../../domain/types/user.types';
import {
  assertEmailAvailable,
  assertUniversityForRegistration,
  assertValidCredentials,
  validateChangePassword,
  validateEmailBelongsToUniversity,
  validateLogin,
  validateRegister,
} from '../../domain/validators/user.validator';

const SALT_ROUNDS = 10;

export const userService = {
  async register(data: CreateUserDTO) {
    validateRegister(data);

    const existing = await userRepository.findByEmail(data.email);
    assertEmailAvailable(existing);

    const university = await universityRepository.findById(data.university_id);
    assertUniversityForRegistration(university);
    validateEmailBelongsToUniversity(data.email, university.email_domain);

    const password_hash = await bcrypt.hash(data.password, SALT_ROUNDS);
    const user = await userRepository.create({
      ...data,
      role: data.role ?? 'student',
      password_hash,
    });

    return sanitizeUser(user);
  },

  async login(data: LoginDTO) {
    validateLogin(data);

    const user = await userRepository.findByEmail(data.email);
    const valid = user ? await bcrypt.compare(data.password, user.password_hash) : false;
    assertValidCredentials(user, valid);

    const payload: AuthPayload = {
      userId: user.id,
      universityId: user.university_id,
      role: user.role,
    };

    const token = jwt.sign(payload, env.jwtSecret, {
      expiresIn: '7d',
    });

    return { token, user: sanitizeUser(user) };
  },

  async changePassword(userId: string, data: ChangePasswordDTO) {
    validateChangePassword(data);

    const user = await userRepository.findById(userId);
    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    const valid = await bcrypt.compare(data.current_password, user.password_hash);
    if (!valid) {
      throw new Error('Contraseña actual incorrecta');
    }

    const password_hash = await bcrypt.hash(data.new_password, SALT_ROUNDS);
    await userRepository.updatePassword(userId, password_hash);

    return { message: 'Contraseña actualizada correctamente' };
  },
};

function sanitizeUser(user: User) {
  const { password_hash, ...safe } = user;
  return safe;
}
