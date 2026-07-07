import { transactionRepository } from '../../infrastructure/persistence/repositories/transaction.repository';
import { enrichTransactionsWithParties } from '../helpers/user-profile.helper';

export const transactionService = {
  async getHistory(userId: string, role?: string) {
    if (role === 'library') {
      const transactions = await transactionRepository.findAll();
      return enrichTransactionsWithParties(transactions);
    }

    const transactions = await transactionRepository.findByUser(userId);
    return enrichTransactionsWithParties(transactions);
  },
};
