import { PlaidItemModel } from '@generated-prisma/models/PlaidItem';

import { PlaidItem } from '@/core/modules/banking/domain';

const PlaidItemPrismaMapper = {
  toDomain(raw: PlaidItemModel): PlaidItem {
    return PlaidItem.reconstitute(
      raw.id,
      raw.userId,
      raw.accessToken,
      raw.institutionId ?? undefined,
      raw.cursor ?? undefined,
      raw.createdAt,
    );
  },

  toPersistence(item: PlaidItem) {
    return {
      id: item.id,
      userId: item.userId,
      accessToken: item.accessToken,
      institutionId: item.institutionId ?? null,
      cursor: item.cursor ?? null,
      createdAt: item.createdAt,
    };
  },
};

export { PlaidItemPrismaMapper };
