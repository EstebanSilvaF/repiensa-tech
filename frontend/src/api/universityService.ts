import type { University } from '../types/api'
import { apiClient } from './client'

export const universityService = {
  getAll: () =>
    apiClient.get<University[]>('/universities', { auth: false }),
}
