import { BudgetModel } from '@generated-prisma/models/Budget';

import { Budget } from '@/core/modules/budgets/domain/aggregates';

const BudgetPrismaMapper = {
  toDomain(raw: BudgetModel): Budget {
    return Budget.reconstitute(
      raw.id,
      raw.userId,
      raw.category,
      Number(raw.monthlyLimit),
      raw.createdAt,
      raw.updatedAt,
    );
  },

  toPersistence(budget: Budget) {
    return {
      id: budget.id,
      userId: budget.userId,
      category: budget.category,
      monthlyLimit: budget.monthlyLimit,
      createdAt: budget.createdAt,
      updatedAt: budget.updatedAt,
    };
  },
};

export { BudgetPrismaMapper };
