import { type SpendingByCategoryDTO } from '@/core/modules/transactions';

import { type CategorySpending } from './calc-spending-by-category';

const mapSpendingDtoToCategory = (
  data: SpendingByCategoryDTO[],
): CategorySpending[] => {
  return data.map((d) => ({ category: d.category, amount: d.total }));
};

export { mapSpendingDtoToCategory };
