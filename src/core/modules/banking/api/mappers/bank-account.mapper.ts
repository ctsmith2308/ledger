import { BankAccount } from '@/core/modules/banking/domain';

import { BankAccountDTO } from '../banking.dto';

const BankAccountMapper = {
  toDTO(account: BankAccount): BankAccountDTO {
    return {
      id: account.id,
      name: account.name,
      officialName: account.officialName,
      mask: account.mask,
      type: account.type,
      subtype: account.subtype,
      availableBalance: account.availableBalance,
      currentBalance: account.currentBalance,
      currencyCode: account.currencyCode,
      createdAt: account.createdAt.toISOString(),
    };
  },

  toDTOList(accounts: BankAccount[]): BankAccountDTO[] {
    return accounts.map(BankAccountMapper.toDTO);
  },
};

export { BankAccountMapper };
