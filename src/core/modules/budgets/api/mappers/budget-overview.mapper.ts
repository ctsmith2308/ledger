import { type BudgetOverviewItem } from '../../application';

import { type BudgetOverviewItemDTO } from '../budgets.dto';

const BudgetOverviewMapper = {
  toDTOList(data: BudgetOverviewItem[]): BudgetOverviewItemDTO[] {
    return data.map((item) => ({
      id: item.id,
      category: item.category,
      monthlyLimit: item.monthlyLimit,
      spent: item.spent,
      transactions: item.transactions,
    }));
  },
};

export { BudgetOverviewMapper };
