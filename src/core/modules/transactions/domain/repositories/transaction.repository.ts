import { Transaction } from '../aggregates';

interface ITransactionRepository {
  save(transaction: Transaction): Promise<void>;
  saveMany(transactions: Transaction[]): Promise<void>;
  findById(id: string): Promise<Transaction | null>;
  findByIds(ids: string[]): Promise<Transaction[]>;
  findByUserId(userId: string): Promise<Transaction[]>;
  findByAccountId(accountId: string): Promise<Transaction[]>;
  findByUserIdAndCategory(
    userId: string,
    category: string,
    limit: number,
  ): Promise<Transaction[]>;
  deleteByIds(ids: string[]): Promise<void>;
}

export { type ITransactionRepository };
