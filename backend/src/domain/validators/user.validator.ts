import { ChangePasswordDTO, CreateUserDTO, LoginDTO } from '../types/user.types';
import { University } from '../types/university.types';
import { User } from '../types/user.types';
import { assertValid } from '../../shared/validation/validator';
import { required, requiredTrimmed } from './shared/field.rules';

const registerRules = [
  required('Todos los campos son requeridos', (data: CreateUserDTO) => data.university_id),
  requiredTrimmed('Todos los campos son requeridos', (data: CreateUserDTO) => data.full_name),
  requiredTrimmed('Todos los campos son requeridos', (data: CreateUserDTO) => data.email),
  required('Todos los campos son requeridos', (data: CreateUserDTO) => data.password),
  {
    test: (data: CreateUserDTO) => data.password.length >= 8,
    message: 'La contraseña debe tener mínimo 8 caracteres',
  },
];

const loginRules = [
  requiredTrimmed('Correo y contraseña son requeridos', (data: LoginDTO) => data.email),
  required('Correo y contraseña son requeridos', (data: LoginDTO) => data.password),
];

const changePasswordRules = [
  required('Todos los campos son requeridos', (data: ChangePasswordDTO) => data.current_password),
  required('Todos los campos son requeridos', (data: ChangePasswordDTO) => data.new_password),
  {
    test: (data: ChangePasswordDTO) => data.new_password.length >= 8,
    message: 'La contraseña debe tener mínimo 8 caracteres',
  },
];

export function validateRegister(data: CreateUserDTO): void {
  assertValid(data, registerRules);
}

export function validateLogin(data: LoginDTO): void {
  assertValid(data, loginRules);
}

export function validateChangePassword(data: ChangePasswordDTO): void {
  assertValid(data, changePasswordRules);
}

export function assertEmailAvailable(existing: User | null): void {
  if (existing) {
    throw new Error('El correo ya está registrado');
  }
}

export function assertUniversityForRegistration(
  university: University | null
): asserts university is University {
  if (!university) {
    throw new Error('Universidad no encontrada');
  }
  if (university.subscription_status !== 'active') {
    throw new Error('La universidad no tiene una suscripción activa');
  }
}

export function validateEmailBelongsToUniversity(email: string, universityDomain: string): void {
  const emailDomain = email.split('@')[1];
  if (emailDomain !== universityDomain) {
    throw new Error('El correo no pertenece a esta universidad');
  }
}

export function assertValidCredentials(user: User | null, passwordValid: boolean): asserts user is User {
  if (!user || !passwordValid) {
    throw new Error('Credenciales inválidas');
  }
}
