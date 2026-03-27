import { PrismaService } from '@/core/shared/infrastructure';
import { Budget, IBudgetRepository } from '@/core/modules/budgets/domain';
import { BudgetPrismaMapper } from '../mappers/budget-prisma.mapper';

class BudgetRepository implements IBudgetRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(budget: Budget): Promise<void> {
    const data = BudgetPrismaMapper.toPersistence(budget);

    await this.prisma.budget.upsert({
      where: { id: budget.id },
      update: data,
      create: data,
    });
  }

  async findById(id: string): Promise<Budget | null> {
    const record = await this.prisma.budget.findUnique({
      where: { id },
    });

    return record ? BudgetPrismaMapper.toDomain(record) : null;
  }

  async findByUserId(userId: string): Promise<Budget[]> {
    const records = await this.prisma.budget.findMany({
      where: { userId },
    });

    return records.map(BudgetPrismaMapper.toDomain);
  }

  async findByUserIdAndCategory(
    userId: string,
    category: string,
  ): Promise<Budget | null> {
    const record = await this.prisma.budget.findUnique({
      where: { userId_category: { userId, category } },
    });

    return record ? BudgetPrismaMapper.toDomain(record) : null;
  }
  async deleteById(id: string): Promise<void> {
    await this.prisma.budget.delete({
      where: { id },
    });
  }
}

export { BudgetRepository };
