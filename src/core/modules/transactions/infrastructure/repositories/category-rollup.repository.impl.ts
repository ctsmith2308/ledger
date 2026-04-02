import { PrismaService } from '@/core/shared/infrastructure';

import {
  type ICategoryRollupRepository,
  type CategoryRollupRecord,
} from '@/core/modules/transactions/domain';

class CategoryRollupRepository implements ICategoryRollupRepository {
  constructor(private readonly prisma: PrismaService) {}

  async upsert(
    userId: string,
    category: string,
    period: string,
    amountCents: number,
  ): Promise<void> {
    await this.prisma.categoryRollup.upsert({
      where: {
        userId_category_period: { userId, category, period },
      },
      update: {
        totalCents: { increment: amountCents },
        transactionCount: { increment: 1 },
      },
      create: {
        userId,
        category,
        period,
        totalCents: amountCents,
        transactionCount: 1,
      },
    });
  }

  async findByUserAndPeriod(
    userId: string,
    period: string,
  ): Promise<CategoryRollupRecord[]> {
    const records = await this.prisma.categoryRollup.findMany({
      where: { userId, period },
      orderBy: { totalCents: 'desc' },
    });

    return records.map((r) => ({
      userId: r.userId,
      category: r.category,
      period: r.period,
      totalCents: r.totalCents,
      transactionCount: r.transactionCount,
    }));
  }
  async findDistinctPeriodsByUser(userId: string): Promise<string[]> {
    const records = await this.prisma.categoryRollup.findMany({
      where: { userId },
      select: { period: true },
      distinct: ['period'],
      orderBy: { period: 'desc' },
    });

    return records.map((r) => r.period);
  }
}

export { CategoryRollupRepository };
