import { PlaidItem } from '../aggregates';

interface IPlaidItemRepository {
  save(item: PlaidItem): Promise<void>;
  findById(id: string): Promise<PlaidItem | null>;
  findByUserId(userId: string): Promise<PlaidItem[]>;
  findByPlaidItemId(plaidItemId: string): Promise<PlaidItem | null>;
  updateCursor(id: string, cursor: string): Promise<void>;
}

export { type IPlaidItemRepository };
