import {
  commandBus,
  queryBus,
  InProcessEventBus,
  prisma,
  IdGenerator,
} from '@/core/shared/infrastructure';

import {
  SyncTransactionsCommand,
  SyncTransactionsHandler,
  GetTransactionsQuery,
  GetTransactionsHandler,
  GetSpendingByCategoryQuery,
  GetSpendingByCategoryHandler,
} from './application';

import { TransactionRepository } from './infrastructure';

import {
  PlaidItemRepository,
  PlaidClientService,
} from '@/core/modules/banking/infrastructure';

import { TransactionsController } from './api';

class TransactionsModule {
  private constructor() {}

  static init(): TransactionsController {
    const repos = {
      transactionRepository: new TransactionRepository(prisma),
      plaidItemRepository: new PlaidItemRepository(prisma),
    };

    const services = {
      plaidClient: PlaidClientService.create(),
      eventBus: new InProcessEventBus(),
      idGenerator: IdGenerator,
    };

    commandBus.register(
      SyncTransactionsCommand,
      new SyncTransactionsHandler(
        repos.plaidItemRepository,
        repos.transactionRepository,
        services.plaidClient,
        services.eventBus,
        services.idGenerator,
      ),
    );

    queryBus.register(
      GetTransactionsQuery,
      new GetTransactionsHandler(repos.transactionRepository),
    );

    queryBus.register(
      GetSpendingByCategoryQuery,
      new GetSpendingByCategoryHandler(repos.transactionRepository),
    );

    return new TransactionsController(commandBus, queryBus);
  }
}

const transactionsController = TransactionsModule.init();

export { transactionsController };

export * from './api';
