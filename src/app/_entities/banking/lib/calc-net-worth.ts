import { type BankAccountDTO } from '@/core/modules/banking';

const ASSET_TYPES = ['depository', 'investment', 'brokerage'];
const LIABILITY_TYPES = ['credit', 'loan'];

const calcNetWorth = (accounts: BankAccountDTO[]): number => {
  let total = 0;

  for (const acct of accounts) {
    const balance = acct.currentBalance ?? 0;

    if (ASSET_TYPES.includes(acct.type)) {
      total += balance;
    } else if (LIABILITY_TYPES.includes(acct.type)) {
      total -= balance;
    }
  }

  return total;
};

export { calcNetWorth };
