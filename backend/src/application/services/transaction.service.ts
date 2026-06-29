import { transactionRepository } from '../../infrastructure/persistence/repositories/transaction.repository';

export const transactionService = {
  async getHistory(userId: string) {
    return transactionRepository.findByUser(userId);
  },
};
