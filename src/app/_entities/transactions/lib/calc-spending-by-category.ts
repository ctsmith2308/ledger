import { type TransactionDTO } from '@/core/modules/transactions';

type CategorySpending = {
  category: string;
  amount: number;
};

const _groupByCategory = (transactions: TransactionDTO[]): CategorySpending[] => {
  const map = new Map<string, number>();

  for (const tx of transactions) {
    if (tx.amount <= 0) continue;

    const category = tx.category ?? 'Uncategorized';
    const current = map.get(category) ?? 0;

    map.set(category, current + tx.amount);
  }

  return Array.from(map.entries())
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount);
};

const calcMonthlySpendingByCategory = (
  transactions: TransactionDTO[],
): CategorySpending[] => {
  const now = new Date();

  const monthly = transactions.filter((tx) => {
    const txDate = new Date(tx.date);

    return (
      txDate.getMonth() === now.getMonth() &&
      txDate.getFullYear() === now.getFullYear()
    );
  });

  return _groupByCategory(monthly);
};

const calcWeeklySpendingByCategory = (
  transactions: TransactionDTO[],
): CategorySpending[] => {
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const weekly = transactions.filter((tx) => {
    const txDate = new Date(tx.date);

    return txDate >= weekAgo && txDate <= now;
  });

  return _groupByCategory(weekly);
};

export {
  calcMonthlySpendingByCategory,
  calcWeeklySpendingByCategory,
  type CategorySpending,
};
