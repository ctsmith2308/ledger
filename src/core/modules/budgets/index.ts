import { TransactionEvents } from '@/core/shared/domain';
import {
  commandBus,
  queryBus,
  eventBus,
  prisma,
  IdGenerator,
} from '@/core/shared/infrastructure';

import {
  CreateBudgetCommand,
  CreateBudgetHandler,
  DeleteBudgetCommand,
  DeleteBudgetHandler,
  GetBudgetsQuery,
  GetBudgetsHandler,
  createRecordSpendHandler,
} from './application';

import { BudgetRepository } from './infrastructure';

import { CategoryRollupRepository } from '@/core/modules/transactions/infrastructure';

import { BudgetsController } from './api';

class BudgetsModule {
  private constructor() {}

  static init(): BudgetsController {
    const repos = {
      budgetRepository: new BudgetRepository(prisma),
      categoryRollupRepository: new CategoryRollupRepository(prisma),
    };

    eventBus.register(
      TransactionEvents.TRANSACTION_CREATED,
      createRecordSpendHandler(
        repos.budgetRepository,
        repos.categoryRollupRepository,
        eventBus,
      ),
    );

    commandBus.register(
      CreateBudgetCommand,
      new CreateBudgetHandler(
        repos.budgetRepository,
        eventBus,
        IdGenerator,
      ),
    );

    commandBus.register(
      DeleteBudgetCommand,
      new DeleteBudgetHandler(repos.budgetRepository),
    );

    queryBus.register(
      GetBudgetsQuery,
      new GetBudgetsHandler(repos.budgetRepository),
    );

    return new BudgetsController(commandBus, queryBus);
  }
}

const budgetsController = BudgetsModule.init();

export { budgetsController };

export * from './api';
