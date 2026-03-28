import { type BankAccountDTO } from '@/core/modules/banking';

const LIABILITY_TYPES = ['credit', 'loan'];

type AccountTypeTotal = {
  type: string;
  total: number;
  count: number;
  isLiability: boolean;
};

const calcTotalsByType = (accounts: BankAccountDTO[]): AccountTypeTotal[] => {
  const map = new Map<string, { total: number; count: number; rawType: string }>();

  for (const acct of accounts) {
    const type = acct.type.charAt(0).toUpperCase() + acct.type.slice(1);
    const existing = map.get(type) ?? { total: 0, count: 0, rawType: acct.type };

    map.set(type, {
      total: existing.total + (acct.currentBalance ?? 0),
      count: existing.count + 1,
      rawType: acct.type,
    });
  }

  return Array.from(map.entries()).map(([type, { total, count, rawType }]) => ({
    type,
    total,
    count,
    isLiability: LIABILITY_TYPES.includes(rawType),
  }));
};

export { calcTotalsByType, type AccountTypeTotal };
