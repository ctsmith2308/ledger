import { Budget } from '@/core/modules/budgets/domain';

import { BudgetDTO } from '../budgets.dto';

const BudgetMapper = {
  toDTO(budget: Budget): BudgetDTO {
    return {
      id: budget.id,
      userId: budget.userId,
      category: budget.category,
      monthlyLimit: budget.monthlyLimit,
      createdAt: budget.createdAt.toISOString(),
      updatedAt: budget.updatedAt.toISOString(),
    };
  },

  toDTOList(budgets: Budget[]): BudgetDTO[] {
    return budgets.map(BudgetMapper.toDTO);
  },
};

export { BudgetMapper };
