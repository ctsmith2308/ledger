import {
  commandBus,
  queryBus,
  InProcessEventBus,
  prisma,
  IdGenerator,
} from '@/core/shared/infrastructure';

import {
  CreateBudgetCommand,
  CreateBudgetHandler,
  GetBudgetsQuery,
  GetBudgetsHandler,
} from './application';

import { BudgetRepository } from './infrastructure';

import { BudgetsController } from './api';

class BudgetsModule {
  private constructor() {}

  static init(): BudgetsController {
    const repos = {
      budgetRepository: new BudgetRepository(prisma),
    };

    const services = {
      idGenerator: IdGenerator,
      eventBus: new InProcessEventBus(),
    };

    commandBus.register(
      CreateBudgetCommand,
      new CreateBudgetHandler(
        repos.budgetRepository,
        services.eventBus,
        services.idGenerator,
      ),
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
