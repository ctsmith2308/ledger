type TransactionDTO = {
  id: string;
  accountId: string;
  amount: number;
  date: string;
  name: string;
  merchantName: string | undefined;
  category: string | undefined;
  detailedCategory: string | undefined;
  pending: boolean;
  paymentChannel: string | undefined;
};

type SyncResultDTO = {
  added: number;
  modified: number;
  removed: number;
};

type SpendingByCategoryDTO = {
  category: string;
  total: number;
};

type SpendingPeriodsDTO = {
  periods: string[];
};

export type {
  TransactionDTO,
  SyncResultDTO,
  SpendingByCategoryDTO,
  SpendingPeriodsDTO,
};
