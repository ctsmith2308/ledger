import { TransactionModel } from '@generated-prisma/models/Transaction';
import { Transaction } from '@/core/modules/transactions/domain/aggregates';

const TransactionPrismaMapper = {
  toDomain(raw: TransactionModel): Transaction {
    return Transaction.reconstitute(
      raw.id,
      raw.accountId,
      raw.userId,
      Number(raw.amount),
      new Date(raw.date),
      raw.name,
      raw.merchantName ?? undefined,
      raw.category ?? undefined,
      raw.detailedCategory ?? undefined,
      raw.pending,
      raw.paymentChannel ?? undefined,
      raw.createdAt,
      raw.updatedAt,
    );
  },

  toPersistence(transaction: Transaction) {
    return {
      id: transaction.id,
      accountId: transaction.accountId,
      userId: transaction.userId,
      amount: transaction.amount,
      date: transaction.date,
      name: transaction.name,
      merchantName: transaction.merchantName ?? null,
      category: transaction.category ?? null,
      detailedCategory: transaction.detailedCategory ?? null,
      pending: transaction.pending,
      paymentChannel: transaction.paymentChannel ?? null,
      createdAt: transaction.createdAt,
      updatedAt: transaction.updatedAt,
    };
  },
};

export { TransactionPrismaMapper };
