import type { ApiTransaction } from '../types/api'
import { apiClient } from './client'

export const transactionService = {
  getTransactions: () =>
    apiClient.get<ApiTransaction[]>('/transactions'),
}
