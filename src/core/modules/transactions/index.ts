import { TransactionEvents } from '@/core/shared/domain';
import {
  commandBus,
  queryBus,
  eventBus,
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
  createUpdateCategoryRollupHandler,
} from './application';

import {
  TransactionRepository,
  CategoryRollupRepository,
} from './infrastructure';

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
      categoryRollupRepository: new CategoryRollupRepository(prisma),
    };

    const services = {
      plaidClient: PlaidClientService.create(),
      idGenerator: IdGenerator,
    };

    eventBus.register(
      TransactionEvents.TRANSACTION_CREATED,
      createUpdateCategoryRollupHandler(repos.categoryRollupRepository),
    );

    commandBus.register(
      SyncTransactionsCommand,
      new SyncTransactionsHandler(
        repos.plaidItemRepository,
        repos.transactionRepository,
        services.plaidClient,
        eventBus,
        services.idGenerator,
      ),
    );

    queryBus.register(
      GetTransactionsQuery,
      new GetTransactionsHandler(repos.transactionRepository),
    );

    queryBus.register(
      GetSpendingByCategoryQuery,
      new GetSpendingByCategoryHandler(repos.categoryRollupRepository),
    );

    return new TransactionsController(commandBus, queryBus);
  }
}

const transactionsController = TransactionsModule.init();

export { transactionsController };

export * from './api';
