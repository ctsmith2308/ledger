import { PrismaService } from '@/core/shared/infrastructure';
import { IPlaidItemRepository, PlaidItem } from '@/core/modules/banking/domain';
import { PlaidItemPrismaMapper } from '../mappers/plaid-item-prisma.mapper';

class PlaidItemRepository implements IPlaidItemRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(item: PlaidItem): Promise<void> {
    const data = PlaidItemPrismaMapper.toPersistence(item);

    await this.prisma.plaidItem.upsert({
      where: { id: item.id },
      update: data,
      create: data,
    });
  }

  async findById(id: string): Promise<PlaidItem | null> {
    const record = await this.prisma.plaidItem.findUnique({
      where: { id },
    });

    return record ? PlaidItemPrismaMapper.toDomain(record) : null;
  }

  async findByUserId(userId: string): Promise<PlaidItem[]> {
    const records = await this.prisma.plaidItem.findMany({
      where: { userId },
    });

    return records.map(PlaidItemPrismaMapper.toDomain);
  }

  async updateCursor(id: string, cursor: string): Promise<void> {
    await this.prisma.plaidItem.update({
      where: { id },
      data: { cursor },
    });
  }
}

export { PlaidItemRepository };
