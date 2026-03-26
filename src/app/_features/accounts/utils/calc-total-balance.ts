import { type BankAccountDTO } from '@/core/modules/banking';

const calcTotalBalance = (accounts: BankAccountDTO[]): number => {
  return accounts.reduce(
    (sum, a) => sum + (a.currentBalance ?? 0),
    0,
  );
};

export { calcTotalBalance };
