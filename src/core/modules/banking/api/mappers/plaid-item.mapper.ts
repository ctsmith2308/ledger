import { PlaidItem } from '@/core/modules/banking/domain';

import { PlaidItemDTO } from '../banking.dto';

const PlaidItemMapper = {
  toDTO(item: PlaidItem): PlaidItemDTO {
    return {
      id: item.id,
      userId: item.userId,
      institutionId: item.institutionId,
      createdAt: item.createdAt.toISOString(),
    };
  },
};

export { PlaidItemMapper };
