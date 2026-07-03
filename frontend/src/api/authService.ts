import type {
  ChangePasswordRequest,
  ChangePasswordResponse,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
} from '../types/api'
import { apiClient } from './client'

export const authService = {
  login: (credentials: LoginRequest) =>
    apiClient.post<LoginResponse>('/auth/login', {
      body: credentials,
      auth: false,
    }),

  register: (data: RegisterRequest) =>
    apiClient.post<RegisterResponse>('/auth/register', {
      body: data,
      auth: false,
    }),

  changePassword: (data: ChangePasswordRequest) =>
    apiClient.patch<ChangePasswordResponse>('/auth/change-password', {
      body: data,
    }),
}
