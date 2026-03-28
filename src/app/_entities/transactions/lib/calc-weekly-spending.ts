import { type TransactionDTO } from '@/core/modules/transactions';

const calcWeeklySpending = (transactions: TransactionDTO[]): number => {
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  return transactions
    .filter((tx) => {
      const txDate = new Date(tx.date);
      return txDate >= weekAgo && txDate <= now && tx.amount > 0;
    })
    .reduce((sum, tx) => sum + tx.amount, 0);
};

export { calcWeeklySpending };
