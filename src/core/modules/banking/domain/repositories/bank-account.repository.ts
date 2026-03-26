import { BankAccount } from '../aggregates';

interface IBankAccountRepository {
  saveMany(accounts: BankAccount[]): Promise<void>;
  findByPlaidItemId(plaidItemId: string): Promise<BankAccount[]>;
  findByUserId(userId: string): Promise<BankAccount[]>;
  findById(id: string): Promise<BankAccount | null>;
}

export { type IBankAccountRepository };
