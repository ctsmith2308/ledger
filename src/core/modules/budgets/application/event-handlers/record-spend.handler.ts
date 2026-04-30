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

/**
 * Reacts to TransactionCreatedEvent to check budget thresholds.
 *
 * Depends on the category rollup being up-to-date. This handler must
 * run AFTER updateCategoryRollup in the dispatch sequence. The EventBus
 * runs handlers sequentially in registration order, and the transactions
 * module registers its rollup handler before the budgets module registers
 * this one. See: the event-handler-ordering architecture decision.
 *
 * Threshold logic:
 * - >= 100% of monthlyLimit: dispatches BudgetExceededEvent
 * - >= 80% of monthlyLimit: dispatches BudgetThresholdReachedEvent
 * - < 80%: no event (silent)
 *
 * Early returns: skips if the transaction has no category, or the user
 * has no budget for that category, or no rollup exists for the period.
 *
 * Cross-module: reads from ICategoryRollupRepository (transactions module)
 * to get the current spend for the category/period.
 */
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
