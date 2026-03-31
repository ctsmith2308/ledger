import { type TransactionDTO } from '@/core/modules/transactions';

type BudgetDTO = {
  id: string;
  userId: string;
  category: string;
  monthlyLimit: number;
  createdAt: string;
  updatedAt: string;
};

type BudgetOverviewItemDTO = {
  id: string;
  category: string;
  monthlyLimit: number;
  spent: number;
  transactions: TransactionDTO[];
};

export type { BudgetDTO, BudgetOverviewItemDTO };
