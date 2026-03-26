import { PrismaService } from '@/core/shared/infrastructure';
import {
  IBankAccountRepository,
  BankAccount,
} from '@/core/modules/banking/domain';
import { BankAccountPrismaMapper } from '../mappers/bank-account-prisma.mapper';

class BankAccountRepository implements IBankAccountRepository {
  constructor(private readonly prisma: PrismaService) {}

  async saveMany(accounts: BankAccount[]): Promise<void> {
    await this.prisma.$transaction(
      accounts.map((account) => {
        const data = BankAccountPrismaMapper.toPersistence(account);

        return this.prisma.bankAccount.upsert({
          where: { plaidAccountId: account.plaidAccountId },
          update: data,
          create: data,
        });
      }),
    );
  }

  async findByPlaidItemId(plaidItemId: string): Promise<BankAccount[]> {
    const records = await this.prisma.bankAccount.findMany({
      where: { plaidItemId },
    });

    return records.map(BankAccountPrismaMapper.toDomain);
  }

  async findByUserId(userId: string): Promise<BankAccount[]> {
    const records = await this.prisma.bankAccount.findMany({
      where: { plaidItem: { userId } },
    });

    return records.map(BankAccountPrismaMapper.toDomain);
  }

  async findById(id: string): Promise<BankAccount | null> {
    const record = await this.prisma.bankAccount.findUnique({
      where: { id },
    });

    return record ? BankAccountPrismaMapper.toDomain(record) : null;
  }
}

export { BankAccountRepository };
