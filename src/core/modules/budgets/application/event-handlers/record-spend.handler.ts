import { IEventBus } from '@/core/shared/domain';

import { logger } from '@/core/shared/infrastructure';

import {
  IBudgetRepository,
  BudgetExceededEvent,
  BudgetThresholdReachedEvent,
} from '@/core/modules/budgets/domain';

import { type ICategoryRollupRepository } from '@/core/modules/transactions/domain';

import { TransactionCreatedEvent } from '@/core/modules/transactions/domain';

const _formatPeriod = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

const createRecordSpendHandler = (
  budgetRepository: IBudgetRepository,
  rollupRepository: ICategoryRollupRepository,
  eventBus: IEventBus,
) => {
  return async (event: TransactionCreatedEvent): Promise<void> => {
    const category = event.category;
    if (!category) return;

    const budget = await budgetRepository.findByUserIdAndCategory(
      event.userId,
      category,
    );

    if (!budget) return;

    const period = _formatPeriod(event.date);
    const rollups = await rollupRepository.findByUserAndPeriod(
      event.userId,
      period,
    );

    const rollup = rollups.find((r) => r.category === category);
    if (!rollup) return;

    const currentSpendDollars = rollup.totalCents / 100;
    const percent = (currentSpendDollars / budget.monthlyLimit) * 100;

    if (percent >= 100) {
      const exceeded = new BudgetExceededEvent(
        budget.id,
        event.userId,
        category,
        currentSpendDollars,
        budget.monthlyLimit,
      );

      await eventBus.dispatch([exceeded]);

      logger.info(
        `Budget exceeded: user=${event.userId} category=${category} ${percent.toFixed(0)}%`,
      );
    } else if (percent >= 80) {
      const threshold = new BudgetThresholdReachedEvent(
        budget.id,
        event.userId,
        category,
        currentSpendDollars,
        budget.monthlyLimit,
        percent,
      );

      await eventBus.dispatch([threshold]);

      logger.info(
        `Budget threshold reached: user=${event.userId} category=${category} ${percent.toFixed(0)}%`,
      );
    }
  };
};

export { createRecordSpendHandler };
