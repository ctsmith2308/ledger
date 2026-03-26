import { Transaction } from '../aggregates';

interface ITransactionRepository {
  save(transaction: Transaction): Promise<void>;
  saveMany(transactions: Transaction[]): Promise<void>;
  findById(id: string): Promise<Transaction | null>;
  findByUserId(userId: string): Promise<Transaction[]>;
  findByAccountId(accountId: string): Promise<Transaction[]>;
  findByPlaidTransactionId(
    plaidTransactionId: string,
  ): Promise<Transaction | null>;
  deleteByPlaidTransactionIds(ids: string[]): Promise<void>;
}

export { type ITransactionRepository };
