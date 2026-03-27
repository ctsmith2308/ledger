import { type ICategoryRollupRepository } from '@/core/modules/transactions/domain';
import { TransactionCreatedEvent } from '@/core/modules/transactions/domain';
import { logger } from '@/core/shared/infrastructure';

const _formatPeriod = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

const createUpdateCategoryRollupHandler = (
  rollupRepository: ICategoryRollupRepository,
) => {
  return async (event: TransactionCreatedEvent): Promise<void> => {
    const category = event.category ?? 'Uncategorized';
    const period = _formatPeriod(event.date);

    await rollupRepository.upsert(
      event.userId,
      category,
      period,
      Math.round(event.amount * 100),
    );

    logger.debug(
      `Updated rollup: user=${event.userId} category=${category} period=${period}`,
    );
  };
};

export { createUpdateCategoryRollupHandler };
