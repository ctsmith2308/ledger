import { type SpendingByCategory } from '../../application';

import { type SpendingByCategoryDTO } from '../transactions.dto';

const SpendingByCategoryMapper = {
  toDTOList(data: SpendingByCategory[]): SpendingByCategoryDTO[] {
    return data.map((item) => ({
      category: item.category,
      total: item.total,
    }));
  },
};

export { SpendingByCategoryMapper };
