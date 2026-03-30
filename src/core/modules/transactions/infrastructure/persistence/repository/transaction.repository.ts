import { PrismaService } from '@/core/shared/infrastructure';
import {
  Transaction,
  ITransactionRepository,
} from '@/core/modules/transactions/domain';
import { TransactionPrismaMapper } from '../mappers/transaction-prisma.mapper';

class TransactionRepository implements ITransactionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(transaction: Transaction): Promise<void> {
    const data = TransactionPrismaMapper.toPersistence(transaction);

    await this.prisma.transaction.upsert({
      where: { id: transaction.id },
      update: data,
      create: data,
    });
  }

  async saveMany(transactions: Transaction[]): Promise<void> {
    await this.prisma.$transaction(
      transactions.map((transaction) => {
        const data = TransactionPrismaMapper.toPersistence(transaction);

        return this.prisma.transaction.upsert({
          where: { id: transaction.id },
          update: data,
          create: data,
        });
      }),
    );
  }

  async findById(id: string): Promise<Transaction | null> {
    const record = await this.prisma.transaction.findUnique({
      where: { id },
    });

    return record ? TransactionPrismaMapper.toDomain(record) : null;
  }

  async findByIds(ids: string[]): Promise<Transaction[]> {
    const records = await this.prisma.transaction.findMany({
      where: { id: { in: ids } },
    });

    return records.map(TransactionPrismaMapper.toDomain);
  }

  async findByUserId(userId: string): Promise<Transaction[]> {
    const records = await this.prisma.transaction.findMany({
      where: { userId },
    });

    return records.map(TransactionPrismaMapper.toDomain);
  }

  async findByAccountId(accountId: string): Promise<Transaction[]> {
    const records = await this.prisma.transaction.findMany({
      where: { accountId },
    });

    return records.map(TransactionPrismaMapper.toDomain);
  }

  async deleteByIds(ids: string[]): Promise<void> {
    await this.prisma.transaction.deleteMany({
      where: { id: { in: ids } },
    });
  }
}

export { TransactionRepository };
