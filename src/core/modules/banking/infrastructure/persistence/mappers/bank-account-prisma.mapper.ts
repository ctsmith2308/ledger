import { BankAccountModel } from '@generated-prisma/models/BankAccount';
import { BankAccount } from '@/core/modules/banking/domain';

const BankAccountPrismaMapper = {
  toDomain(raw: BankAccountModel): BankAccount {
    return BankAccount.reconstitute(
      raw.id,
      raw.plaidItemId,
      raw.name,
      raw.officialName ?? undefined,
      raw.mask ?? undefined,
      raw.type,
      raw.subtype ?? undefined,
      raw.availableBalance ? Number(raw.availableBalance) : undefined,
      raw.currentBalance ? Number(raw.currentBalance) : undefined,
      raw.currencyCode ?? 'USD',
      raw.createdAt,
      raw.updatedAt,
    );
  },

  toPersistence(account: BankAccount) {
    return {
      id: account.id,
      plaidItemId: account.plaidItemId,
      name: account.name,
      officialName: account.officialName ?? null,
      mask: account.mask ?? null,
      type: account.type,
      subtype: account.subtype ?? null,
      availableBalance: account.availableBalance ?? null,
      currentBalance: account.currentBalance ?? null,
      currencyCode: account.currencyCode,
      createdAt: account.createdAt,
      updatedAt: account.updatedAt,
    };
  },
};

export { BankAccountPrismaMapper };
