import { Budget } from '../aggregates';

interface IBudgetRepository {
  save(budget: Budget): Promise<void>;
  findById(id: string): Promise<Budget | null>;
  findByUserId(userId: string): Promise<Budget[]>;
  findByUserIdAndCategory(
    userId: string,
    category: string,
  ): Promise<Budget | null>;
  deleteById(id: string): Promise<void>;
}

export { type IBudgetRepository };
