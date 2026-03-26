import { type TransactionDTO } from '@/core/modules/transactions';

const calcMonthlySpending = (transactions: TransactionDTO[]): number => {
  const now = new Date();
  return transactions
    .filter((tx) => {
      const txDate = new Date(tx.date);
      return (
        txDate.getMonth() === now.getMonth() &&
        txDate.getFullYear() === now.getFullYear() &&
        tx.amount > 0
      );
    })
    .reduce((sum, tx) => sum + tx.amount, 0);
};

export { calcMonthlySpending };
