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
  UpdateBudgetCommand,
  UpdateBudgetHandler,
  GetBudgetOverviewQuery,
  GetBudgetOverviewHandler,
  GetBudgetsQuery,
  GetBudgetsHandler,
  createRecordSpendHandler,
} from '../application';

import { BudgetRepository } from '../infrastructure';

import {
  CategoryRollupRepository,
  TransactionRepository,
} from '@/core/modules/transactions/infrastructure';

import { BudgetsService } from './budgets.service';

class BudgetsModule {
  private constructor() {}

  static init(): BudgetsService {
    const repos = {
      budgetRepository: new BudgetRepository(prisma),
      categoryRollupRepository: new CategoryRollupRepository(prisma),
      transactionRepository: new TransactionRepository(prisma),
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

    commandBus.register(
      UpdateBudgetCommand,
      new UpdateBudgetHandler(repos.budgetRepository),
    );

    queryBus.register(
      GetBudgetOverviewQuery,
      new GetBudgetOverviewHandler(
        repos.budgetRepository,
        repos.categoryRollupRepository,
        repos.transactionRepository,
      ),
    );

    queryBus.register(
      GetBudgetsQuery,
      new GetBudgetsHandler(repos.budgetRepository),
    );

    return new BudgetsService(commandBus, queryBus);
  }
}

const budgetsService = BudgetsModule.init();

export { budgetsService, type BudgetsService };
export * from './budgets.dto';
